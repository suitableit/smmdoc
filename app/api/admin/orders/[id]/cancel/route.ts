import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/orders/:id/cancel - Cancel an order
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await req.json();
    const { reason, refundType = 'full', customRefundAmount } = body;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Order ID is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Get the order to be cancelled
    const order = await db.newOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            currency: true,
            total_spent: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true
          }
        },
        category: {
          select: {
            id: true,
            category_name: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'processing', 'in_progress', 'partial'];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        { 
          error: `Order cannot be cancelled. Current status: ${order.status}. Cancellable statuses: ${cancellableStatuses.join(', ')}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Calculate refund amount
    let refundAmount: number;
    const orderPrice = order.user.currency === 'USD' ? order.usdPrice : order.bdtPrice;
    
    switch (refundType) {
      case 'full':
        refundAmount = orderPrice;
        break;
      case 'partial':
        // Refund based on remaining quantity
        const deliveredPercentage = order.qty > 0 ? (order.qty - order.remains) / order.qty : 0;
        refundAmount = orderPrice * (order.remains / order.qty);
        break;
      case 'none':
        refundAmount = 0;
        break;
      case 'custom':
        if (customRefundAmount === undefined || customRefundAmount < 0) {
          return NextResponse.json(
            { 
              error: 'Custom refund amount must be provided and non-negative',
              success: false,
              data: null 
            },
            { status: 400 }
          );
        }
        refundAmount = parseFloat(customRefundAmount);
        if (refundAmount > orderPrice) {
          return NextResponse.json(
            { 
              error: `Refund amount cannot exceed order price (${orderPrice.toFixed(2)})`,
              success: false,
              data: null 
            },
            { status: 400 }
          );
        }
        break;
      default:
        return NextResponse.json(
          { 
            error: 'Invalid refund type. Must be: full, partial, none, or custom',
            success: false,
            data: null 
          },
          { status: 400 }
        );
    }
    
    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Update order status to cancelled
      const cancelledOrder = await prisma.newOrder.update({
        where: { id },
        data: {
          status: 'cancelled',
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currency: true,
              balance: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              rate: true
            }
          },
          category: {
            select: {
              id: true,
              category_name: true
            }
          }
        }
      });
      
      // Process refund if amount > 0
      let updatedUser = null;
      if (refundAmount > 0) {
        // Calculate how much was actually spent (for total_spent adjustment)
        const spentAmount = order.status === 'pending' ? 0 : orderPrice;
        const spentAdjustment = Math.min(spentAmount, refundAmount);
        
        updatedUser = await prisma.user.update({
          where: { id: order.userId },
          data: {
            balance: {
              increment: refundAmount
            },
            total_spent: {
              decrement: spentAdjustment
            }
          },
          select: {
            id: true,
            balance: true,
            total_spent: true
          }
        });
      }
      
      return { cancelledOrder, updatedUser, refundAmount };
    });
    
    // Log the cancellation
    console.log(`Admin ${session.user.email} cancelled order ${id}`, {
      orderId: id,
      userId: order.userId,
      originalStatus: order.status,
      refundType,
      refundAmount,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Order cancelled successfully${refundAmount > 0 ? ` with ${refundAmount.toFixed(2)} ${order.user.currency} refund` : ''}`,
      data: {
        order: result.cancelledOrder,
        refund: {
          amount: refundAmount,
          currency: order.user.currency,
          type: refundType,
          processed: refundAmount > 0
        },
        user: result.updatedUser ? {
          id: result.updatedUser.id,
          newBalance: result.updatedUser.balance,
          newTotalSpent: result.updatedUser.total_spent
        } : null,
        cancellation: {
          reason: reason || 'Admin cancelled order',
          timestamp: new Date().toISOString(),
          adminEmail: session.user.email
        }
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      {
        error: 'Failed to cancel order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/orders/:id/cancel - Get cancellation eligibility and refund estimate
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          error: 'Order ID is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Get order details
    const order = await db.newOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            currency: true,
            balance: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true
          }
        }
      }
    });
    
    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    // Check cancellation eligibility
    const cancellableStatuses = ['pending', 'processing', 'in_progress', 'partial'];
    const isCancellable = cancellableStatuses.includes(order.status);
    
    // Calculate refund estimates
    const orderPrice = order.user.currency === 'USD' ? order.usdPrice : order.bdtPrice;
    const deliveredQuantity = order.qty - order.remains;
    const deliveredPercentage = order.qty > 0 ? deliveredQuantity / order.qty : 0;
    const partialRefundAmount = orderPrice * (order.remains / order.qty);
    
    const cancellationInfo = {
      eligible: isCancellable,
      reason: !isCancellable ? `Order status '${order.status}' is not cancellable. Cancellable statuses: ${cancellableStatuses.join(', ')}` : null,
      order: {
        id: order.id,
        status: order.status,
        totalQuantity: order.qty,
        deliveredQuantity,
        remainingQuantity: order.remains,
        deliveredPercentage: Math.round(deliveredPercentage * 100),
        orderPrice,
        currency: order.user.currency
      },
      refundOptions: {
        full: {
          amount: orderPrice,
          description: 'Refund full order amount'
        },
        partial: {
          amount: partialRefundAmount,
          description: `Refund for undelivered quantity (${order.remains}/${order.qty})`
        },
        none: {
          amount: 0,
          description: 'No refund'
        },
        custom: {
          maxAmount: orderPrice,
          description: 'Custom refund amount (up to full order price)'
        }
      }
    };
    
    return NextResponse.json({
      success: true,
      data: cancellationInfo,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching cancellation info:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cancellation info: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
