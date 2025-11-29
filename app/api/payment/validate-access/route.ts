import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', valid: false },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const invoice_id = searchParams.get('invoice_id');

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'Invoice ID is required', valid: false },
        { status: 400 }
      );
    }

    // Fetch payment record
    const payment = await db.addFunds.findUnique({
      where: { invoice_id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found', valid: false },
        { status: 404 }
      );
    }

    // Check if payment belongs to the authenticated user
    const userId = parseInt(session.user.id);
    if (payment.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this payment', valid: false },
        { status: 403 }
      );
    }

    // Return payment data if valid
    return NextResponse.json({
      valid: true,
      payment: {
        id: payment.id,
        invoice_id: payment.invoice_id,
        order_id: payment.order_id,
        amount: payment.amount,
        original_amount: payment.original_amount,
        status: payment.status,
        transaction_id: payment.transaction_id,
        payment_method: payment.payment_method,
        sender_number: payment.sender_number,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
      user: payment.user ? {
        id: payment.user.id,
        email: payment.user.email,
        name: payment.user.name,
      } : null,
    });
  } catch (error) {
    console.error('Error validating payment access:', error);
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    );
  }
}

