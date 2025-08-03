import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/orders/[id]/refund - Process order refund
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const { refundType, refundAmount } = await req.json();

    // Validate refund type
    if (!['partial', 'full'].includes(refundType)) {
      return NextResponse.json(
        {
          error: 'Invalid refund type. Must be "partial" or "full"',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if order exists
    const existingOrder = await db.newOrder.findUnique({
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            currency: true
          }
        }
      }
    });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: 'Order not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Check if order can be refunded
    if (['refunded', 'cancelled'].includes(existingOrder.status)) {
      return NextResponse.json(
        {
          error: 'Order has already been refunded or cancelled',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Calculate refund amount
    let finalRefundAmount: number;
    if (refundType === 'full') {
      finalRefundAmount = existingOrder.price;
    } else {
      // For partial refund, use provided amount or calculate based on remaining quantity
      if (refundAmount && refundAmount > 0) {
        finalRefundAmount = Math.min(refundAmount, existingOrder.price);
      } else {
        // Calculate based on remaining quantity
        const completedPercentage = ((existingOrder.qty - existingOrder.remains) / existingOrder.qty) * 100;
        const refundPercentage = Math.max(0, 100 - completedPercentage);
        finalRefundAmount = (existingOrder.price * refundPercentage) / 100;
      }
    }

    // Start transaction
    const result = await db.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: existingOrder.user.id },
        data: {
          balance: {
            increment: finalRefundAmount
          }
        }
      });

      // Update order status
      const updatedOrder = await tx.newOrder.update({
        where: { id: Number(id) },
        data: { 
          status: refundType === 'full' ? 'refunded' : 'partial',
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              balance: true
            }
          },
          service: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      // Create refund record using AddFund model
      await tx.addFund.create({
        data: {
          userId: existingOrder.user.id,
          invoice_id: `refund_${id}_${Date.now()}`,
          amount: finalRefundAmount,
          spent_amount: 0,
          fee: 0,
          email: existingOrder.user.email || '',
          name: existingOrder.user.name || 'User',
          status: 'Success',
          admin_status: 'Approved',
          method: 'Admin Refund',
          payment_method: 'Refund',
          transaction_type: 'refund',
          reference_id: id,
          date: new Date(),
          paid_at: new Date(),
          createdAt: new Date()
        }
      });

      // Note: Order logging would be implemented here if OrderLog model exists

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `${refundType === 'full' ? 'Full' : 'Partial'} refund of $${finalRefundAmount.toFixed(2)} processed successfully`,
      refundAmount: finalRefundAmount,
      error: null
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    return NextResponse.json(
      {
        error: 'Failed to process refund: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
