import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: transactionId } = params;
    const body = await request.json();
    const { status } = body;

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Find the transaction
    const transaction = await db.addFund.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction status based on action
    let updateData: any = {};
    
    if (status === 'approved') {
      updateData = {
        status: 'Success',
        admin_status: 'approved'
      };

      // Add balance to user account only if not already approved
      if (transaction.admin_status !== 'approved') {
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount },
            total_deposit: { increment: transaction.amount }
          }
        });
      }
    } else if (status === 'cancelled') {
      updateData = {
        status: 'Cancelled',
        admin_status: 'cancelled'
      };
    }

    // Update the transaction
    const updatedTransaction = await db.addFund.update({
      where: { id: transactionId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: updatedTransaction
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: transactionId } = params;

    // Find the transaction
    const transaction = await db.addFund.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Check if user owns this transaction or is admin
    if (transaction.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Transform data to match frontend interface
    const transformedTransaction = {
      id: transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.amount,
      status: mapStatus(transaction.status || 'Processing'),
      method: transaction.method || 'uddoktapay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      transaction_type: 'deposit',
      reference_id: transaction.order_id,
      sender_number: transaction.sender_number,
      phone: transaction.sender_number,
      currency: transaction.currency || 'BDT',
      admin_status: transaction.admin_status,
    };

    return NextResponse.json(transformedTransaction);

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// Helper function to map status
function mapStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'success';
    case 'processing':
    case 'pending':
      return 'pending';
    case 'failed':
    case 'cancelled':
      return 'failed';
    default:
      return 'pending';
  }
}
