import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/orders/:id/refill - Refill an order
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
    const { reason, refillType = 'full', customQuantity } = body;
    
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
    
    // Get the original order
    const originalOrder = await db.newOrder.findUnique({
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
            rate: true,
            min_order: true,
            max_order: true,
            avg_time: true,
            status: true
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
    
    if (!originalOrder) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }
    
    // Check if order is eligible for refill
    const eligibleStatuses = ['completed', 'partial'];
    if (!eligibleStatuses.includes(originalOrder.status)) {
      return NextResponse.json(
        { 
          error: `Order must be completed or partial to be refilled. Current status: ${originalOrder.status}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Check if service is still active
    if (originalOrder.service.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Service is no longer active and cannot be refilled',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Calculate refill quantity
    let refillQuantity: number;
    
    switch (refillType) {
      case 'full':
        refillQuantity = originalOrder.qty;
        break;
      case 'remaining':
        refillQuantity = originalOrder.remains;
        break;
      case 'custom':
        if (!customQuantity || customQuantity <= 0) {
          return NextResponse.json(
            { 
              error: 'Custom quantity must be provided and greater than 0',
              success: false,
              data: null 
            },
            { status: 400 }
          );
        }
        refillQuantity = parseInt(customQuantity);
        break;
      default:
        return NextResponse.json(
          { 
            error: 'Invalid refill type. Must be: full, remaining, or custom',
            success: false,
            data: null 
          },
          { status: 400 }
        );
    }
    
    // Validate quantity limits
    if (refillQuantity < originalOrder.service.min_order || refillQuantity > originalOrder.service.max_order) {
      return NextResponse.json(
        { 
          error: `Refill quantity must be between ${originalOrder.service.min_order} and ${originalOrder.service.max_order}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Calculate refill cost
    const refillRate = originalOrder.service.rate;
    const refillUsdPrice = (refillRate * refillQuantity) / 1000;
    const refillBdtPrice = refillUsdPrice * (originalOrder.user.dollarRate || 121.52);
    const refillPrice = originalOrder.user.currency === 'USD' ? refillUsdPrice : refillBdtPrice;
    
    // Check user balance
    if (originalOrder.user.balance < refillPrice) {
      return NextResponse.json(
        { 
          error: `Insufficient balance for refill. Required: ${refillPrice.toFixed(2)}, Available: ${originalOrder.user.balance.toFixed(2)}`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }
    
    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (prisma) => {
      // Create new refill order
      const refillOrder = await prisma.newOrder.create({
        data: {
          userId: originalOrder.userId,
          categoryId: originalOrder.categoryId,
          serviceId: originalOrder.serviceId,
          link: originalOrder.link,
          qty: refillQuantity,
          price: refillPrice,
          usdPrice: refillUsdPrice,
          bdtPrice: refillBdtPrice,
          currency: originalOrder.currency,
          avg_time: originalOrder.service.avg_time,
          status: 'processing', // Start refill orders as processing
          remains: refillQuantity,
          startCount: 0
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currency: true
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
      
      // Deduct balance from user
      await prisma.user.update({
        where: { id: originalOrder.userId },
        data: {
          balance: {
            decrement: refillPrice
          },
          total_spent: {
            increment: refillPrice
          }
        }
      });
      
      return refillOrder;
    });
    
    // Log the refill action
    console.log(`Admin ${session.user.email} created refill order for original order ${id}`, {
      originalOrderId: id,
      refillOrderId: result.id,
      refillType,
      refillQuantity,
      refillPrice,
      reason: reason || 'No reason provided',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Refill order created successfully`,
      data: {
        originalOrder: {
          id: originalOrder.id,
          status: originalOrder.status,
          qty: originalOrder.qty,
          remains: originalOrder.remains
        },
        refillOrder: result,
        refillDetails: {
          type: refillType,
          quantity: refillQuantity,
          cost: refillPrice,
          reason: reason || 'Admin initiated refill'
        }
      },
      error: null
    });
    
  } catch (error) {
    console.error('Error creating refill order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create refill order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/orders/:id/refill - Get refill eligibility and cost estimate
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
            balance: true,
            currency: true,
            dollarRate: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true,
            min_order: true,
            max_order: true,
            status: true
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
    
    // Check eligibility
    const eligibleStatuses = ['completed', 'partial'];
    const isEligible = eligibleStatuses.includes(order.status) && order.service.status === 'active';
    
    // Calculate refill costs
    const refillRate = order.service.rate;
    const fullRefillUsd = (refillRate * order.qty) / 1000;
    const remainingRefillUsd = (refillRate * order.remains) / 1000;
    
    const dollarRate = order.user.dollarRate || 121.52;
    const fullRefillBdt = fullRefillUsd * dollarRate;
    const remainingRefillBdt = remainingRefillUsd * dollarRate;
    
    const refillInfo = {
      eligible: isEligible,
      reason: !isEligible ? (
        !eligibleStatuses.includes(order.status) 
          ? `Order status must be completed or partial (current: ${order.status})`
          : 'Service is not active'
      ) : null,
      order: {
        id: order.id,
        status: order.status,
        totalQuantity: order.qty,
        remainingQuantity: order.remains,
        deliveredQuantity: order.qty - order.remains
      },
      service: {
        id: order.service.id,
        name: order.service.name,
        rate: order.service.rate,
        status: order.service.status,
        minOrder: order.service.min_order,
        maxOrder: order.service.max_order
      },
      user: {
        balance: order.user.balance,
        currency: order.user.currency
      },
      refillOptions: {
        full: {
          quantity: order.qty,
          costUsd: fullRefillUsd,
          costBdt: fullRefillBdt,
          cost: order.user.currency === 'USD' ? fullRefillUsd : fullRefillBdt,
          affordable: order.user.balance >= (order.user.currency === 'USD' ? fullRefillUsd : fullRefillBdt)
        },
        remaining: {
          quantity: order.remains,
          costUsd: remainingRefillUsd,
          costBdt: remainingRefillBdt,
          cost: order.user.currency === 'USD' ? remainingRefillUsd : remainingRefillBdt,
          affordable: order.user.balance >= (order.user.currency === 'USD' ? remainingRefillUsd : remainingRefillBdt)
        }
      }
    };
    
    return NextResponse.json({
      success: true,
      data: refillInfo,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching refill info:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch refill info: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
