import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/orders/:id - Get a specific order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
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

    const { id  } = await params;

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

    // Convert string ID to integer
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid Order ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get order with all related data
    const order = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
            balance: true,
            total_spent: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true,
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
            category_name: true,
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
    
    return NextResponse.json({
      success: true,
      data: order,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders/:id - Update order details
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
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

    const { id  } = await params;
    const body = await req.json();

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

    // Convert string ID to integer
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid Order ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get current order
    const currentOrder = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            balance: true,
            currency: true,
            dollarRate: true
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
    
    // Prepare update data
    const updateData: {
      status?: string;
      remains?: number;
      startCount?: number;
      link?: string;
      qty?: number;
      updatedAt?: Date;
    } = {};
    
    // Allow updating specific fields
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    
    if (body.remains !== undefined) {
      updateData.remains = parseInt(body.remains);
    }
    
    if (body.startCount !== undefined) {
      updateData.startCount = parseInt(body.startCount);
    }
    
    if (body.link !== undefined) {
      updateData.link = body.link;
    }
    
    if (body.qty !== undefined) {
      updateData.qty = parseInt(body.qty);
      // If quantity changes, update remains accordingly
      if (updateData.remains === undefined) {
        updateData.remains = parseInt(body.qty) - (currentOrder.qty - currentOrder.remains);
      }
    }
    
    // Add updated timestamp
    updateData.updatedAt = new Date();
    
    // Handle balance adjustments for status changes
    if (body.status && body.status !== currentOrder.status) {
      const user = currentOrder.user;
      const orderPrice = user.currency === 'USD' ? currentOrder.usdPrice : currentOrder.bdtPrice;
      
      // If changing from pending to active status, deduct balance
      if (currentOrder.status === 'pending' && ['processing', 'completed'].includes(body.status)) {
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

        // Deduct balance and update spent amount
        await db.user.update({
          where: { id: user.id },
          data: {
            balance: {
              decrement: orderPrice
            },
            total_spent: {
              increment: orderPrice
            }
          }
        });
      }
      
      // If changing from active status to cancelled/refunded, refund balance
      if (['processing', 'completed'].includes(currentOrder.status) && ['cancelled', 'refunded'].includes(body.status)) {
        await db.user.update({
          where: { id: user.id },
          data: {
            balance: {
              increment: orderPrice
            },
            total_spent: {
              decrement: orderPrice
            }
          }
        });
      }
    }
    
    // Update the order
    const updatedOrder = await db.newOrder.update({
      where: { id: orderId },
      data: updateData,
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
    
    // Log the order update
    console.log(`Admin ${session.user.email} updated order ${id}`, {
      orderId: id,
      changes: updateData,
      previousStatus: currentOrder.status,
      newStatus: body.status,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
      error: null
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders/:id - Delete an order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string  }> }
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

    const { id  } = await params;

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

    // Convert string ID to integer
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return NextResponse.json(
        {
          error: 'Invalid Order ID format',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get order details before deletion for refund calculation
    const order = await db.newOrder.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            currency: true
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
    
    // If order was paid (not pending), refund the user
    if (order.status !== 'pending') {
      const refundAmount = order.user.currency === 'USD' ? order.usdPrice : order.bdtPrice;

      await db.user.update({
        where: { id: order.userId },
        data: {
          balance: {
            increment: refundAmount
          },
          total_spent: {
            decrement: refundAmount
          }
        }
      });
    }
    
    // Delete the order
    await db.newOrder.delete({
      where: { id: orderId }
    });

    // Log the order deletion
    console.log(`Admin ${session.user.email} deleted order ${orderId}`, {
      orderId: orderId,
      userId: order.userId,
      refunded: order.status !== 'pending',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      message: 'Order deleted successfully',
      data: null,
      error: null
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete order: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
