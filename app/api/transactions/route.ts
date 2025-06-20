import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10'); // Reduced default limit
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const adminView = searchParams.get('admin') === 'true';

    // Build where clause
    const where: any = {};

    // If admin view, don't filter by userId, otherwise filter by current user
    if (!adminView || session.user.role !== 'admin') {
      where.userId = session.user.id;
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        where.status = 'Success';
      } else if (status === 'pending') {
        // For admin view, filter by admin_status for pending transactions
        if (adminView && session.user.role === 'admin') {
          where.admin_status = 'Pending';
        } else {
          where.status = 'Processing';
        }
      } else if (status === 'failed') {
        where.status = { in: ['Failed', 'Cancelled'] };
      }
    }

    // For admin view, if no specific status requested, show only pending
    if (adminView && session.user.role === 'admin' && !status) {
      where.admin_status = 'Pending';
    }

    // Fetch transactions from database (using AddFund model) with timeout
    const transactions = await Promise.race([
      db.addFund.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: Math.min(limit, 100), // Limit to max 100 records
        skip: offset,
        select: {
          id: true,
          invoice_id: true,
          amount: true,
          status: true,
          method: true,
          payment_method: true,
          transaction_id: true,
          createdAt: true,
          order_id: true,
          sender_number: true,
          currency: true,
          admin_status: true,
          userId: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      )
    ]) as any[];

    // Transform data to match frontend interface
    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.amount,
      status: mapStatus(transaction.status || 'Processing'),
      admin_status: transaction.admin_status || 'Pending',
      method: transaction.method || 'uddoktapay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      transaction_type: 'deposit',
      reference_id: transaction.order_id,
      sender_number: transaction.sender_number,
      phone: transaction.sender_number,
      currency: transaction.currency || 'BDT',
      userId: transaction.userId,
      user: transaction.user ? {
        name: transaction.user.name,
        email: transaction.user.email,
      } : null,
    }));

    // For admin view, return structured response, otherwise return array for backward compatibility
    if (adminView && session.user.role === 'admin') {
      return NextResponse.json({
        transactions: transformedTransactions,
        total: transactions.length,
        success: true
      });
    } else {
      // Return array directly for backward compatibility
      return NextResponse.json(transformedTransactions);
    }

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('id');
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

      // Add balance to user account
      await db.user.update({
        where: { id: transaction.userId },
        data: {
          balance: { increment: transaction.amount },
          total_deposit: { increment: transaction.amount }
        }
      });
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
