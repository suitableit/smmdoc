import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      if (status === 'success') {
        where.status = 'Success';
      } else if (status === 'pending') {
        where.status = 'Processing';
      } else if (status === 'failed') {
        where.status = { in: ['Failed', 'Cancelled'] };
      }
    }

    // Fetch transactions from database (using AddFund model)
    const transactions = await db.addFund.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform data to match frontend interface
    const transformedTransactions = transactions.map((transaction) => ({
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
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
      total: transactions.length,
    });

  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

function mapStatus(dbStatus: string): 'Success' | 'Processing' | 'Cancelled' | 'Failed' {
  switch (dbStatus) {
    case 'Success':
      return 'Success';
    case 'Processing':
      return 'Processing';
    case 'Cancelled':
      return 'Cancelled';
    case 'Failed':
      return 'Failed';
    default:
      return 'Processing';
  }
}
