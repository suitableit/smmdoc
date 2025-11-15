import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

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

    const body = await req.json();
    const { orderIds, status } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Order IDs array is required and must not be empty',
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

    const validStatuses = ['pending', 'processing', 'in_progress', 'completed', 'partial', 'cancelled'];
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

    const orderIdNumbers = orderIds.map(id => parseInt(String(id))).filter(id => !isNaN(id));

    if (orderIdNumbers.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid order IDs provided',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'completed') {
      updateData.remains = 0;
    }

    if (status === 'cancelled') {
      const orders = await db.newOrders.findMany({
        where: {
          id: { in: orderIdNumbers }
        },
        include: {
          user: {
            select: {
              id: true,
              currency: true,
              dollarRate: true,
              balance: true,
              total_spent: true
            }
          }
        }
      });

      const userRefunds: { [userId: number]: number } = {};
      const userSpentAdjustments: { [userId: number]: number } = {};

      orders.forEach(order => {
        if (order.status !== 'cancelled') {
          const orderPrice = order.user.currency === 'USD' 
            ? order.usdPrice 
            : order.usdPrice * (order.user.dollarRate || 121.52);
          
          if (!userRefunds[order.userId]) {
            userRefunds[order.userId] = 0;
            userSpentAdjustments[order.userId] = 0;
          }
          
          userRefunds[order.userId] += orderPrice;
          userSpentAdjustments[order.userId] += orderPrice;
        }
      });

      await db.$transaction(async (prisma) => {
        for (const [userId, refundAmount] of Object.entries(userRefunds)) {
          const spentAdjustment = userSpentAdjustments[parseInt(userId)];
          
          await prisma.users.update({
            where: { id: parseInt(userId) },
            data: {
              balance: {
                increment: refundAmount
              },
              total_spent: {
                decrement: spentAdjustment
              }
            }
          });
        }

        await prisma.newOrders.updateMany({
          where: {
            id: { in: orderIdNumbers }
          },
          data: updateData
        });
      });
    } else {
      await db.newOrders.updateMany({
        where: {
          id: { in: orderIdNumbers }
        },
        data: updateData
      });
    }

    console.log(`Admin ${session.user.email} bulk updated ${orderIdNumbers.length} orders to status ${status}`, {
      orderIds: orderIdNumbers,
      newStatus: status,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${orderIdNumbers.length} order${orderIdNumbers.length !== 1 ? 's' : ''} to ${status}`,
      data: {
        updatedCount: orderIdNumbers.length,
        status
      },
      error: null
    });

  } catch (error) {
    console.error('Error bulk updating order status:', error);
    return NextResponse.json(
      {
        error: 'Failed to bulk update order status: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

