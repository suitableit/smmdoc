import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/orders/:id/status - Update order status
export async function PUT(
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
    const { status, reason, startCount, remains } = body;
    
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
    
    if (!status) {
      return NextResponse.json(
        { 
          error: 'Status is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Validate status values
    const validStatuses = ['pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Get current order
    const currentOrder = await db.newOrder.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            currency: true,
            dollarRate: true
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
    
    if (!currentOrder) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    const user = currentOrder.user;
    const orderPrice = user.currency === 'USD' ? currentOrder.usdPrice : currentOrder.bdtPrice;
    
    // Handle balance adjustments based on status changes
    let balanceUpdate = null;
    
    // If changing from pending to active status, deduct balance
    if (currentOrder.status === 'pending' && ['processing', 'in_progress', 'completed', 'partial'].includes(status)) {
      if (user.balance < orderPrice) {
        return NextResponse.json(
          { 
            error: `Insufficient balance to activate order. Required: ${orderPrice.toFixed(2)}, Available: ${user.balance.toFixed(2)}`,
            success: false,
            data: null 
          },
          { status: 400 }
        );
      }
      
      balanceUpdate = {
        balance: {
          decrement: orderPrice
        },
        total_spent: {
          increment: orderPrice
        }
      };
    }
    
    // If changing from active status to cancelled/refunded, refund balance
    if (['processing', 'in_progress', 'completed', 'partial'].includes(currentOrder.status) && ['cancelled', 'refunded'].includes(status)) {
      balanceUpdate = {
        balance: {
          increment: orderPrice
        },
        total_spent: {
          decrement: orderPrice
        }
      };
    }
    
    // Prepare order update data
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    // Update start count and remains if provided
    if (startCount !== undefined) {
      updateData.startCount = parseInt(startCount);
    }
    
    if (remains !== undefined) {
      updateData.remains = parseInt(remains);
    }
    
    // For completed orders, set remains to 0
    if (status === 'completed') {
      updateData.remains = 0;
    }
    
    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Update user balance if needed
      if (balanceUpdate) {
        await prisma.user.update({
          where: { id: user.id },
          data: balanceUpdate
        });
      }
      
      // Update order
      const updatedOrder = await prisma.newOrder.update({
        where: { id },
        data: updateData,
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
      
      return updatedOrder;
    });
    
    // Log the status change
    console.log(`Admin ${session.user.email} changed order ${id} status from ${currentOrder.status} to ${status}`, {
      orderId: id,
      userId: user.id,
      previousStatus: currentOrder.status,
      newStatus: status,
      reason: reason || 'No reason provided',
      balanceAdjusted: balanceUpdate !== null,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: result,
      error: null
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/orders/:id/status - Get order status history (if implemented)
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
    
    // Get current order status
    const order = await db.newOrder.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        qty: true,
        remains: true,
        startCount: true
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
    
    // Calculate progress
    const progress = order.qty > 0 ? ((order.qty - order.remains) / order.qty) * 100 : 0;
    
    // Return current status info
    // In a full implementation, you might have a separate OrderStatusHistory table
    const statusInfo = {
      currentStatus: order.status,
      progress: Math.round(progress),
      totalQuantity: order.qty,
      delivered: order.qty - order.remains,
      remaining: order.remains,
      startCount: order.startCount,
      createdAt: order.createdAt,
      lastUpdated: order.updatedAt,
      // Mock status history - in real implementation, query from status history table
      statusHistory: [
        {
          status: 'pending',
          timestamp: order.createdAt,
          note: 'Order created'
        },
        ...(order.status !== 'pending' ? [{
          status: order.status,
          timestamp: order.updatedAt,
          note: `Status changed to ${order.status}`
        }] : [])
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: statusInfo,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
