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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const where: any = {
      userId: session.user.id,
    };

    if (search) {
      where.OR = [
        { transaction_id: { contains: search, mode: 'insensitive' } },
        { invoice_id: { contains: search, mode: 'insensitive' } },
        { sender_number: { contains: search, mode: 'insensitive' } },
        { payment_method: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'all') {
      if (status === 'success') {
        where.admin_status = 'Success';
      } else if (status === 'pending') {
        where.admin_status = 'Pending';
      } else if (status === 'failed') {
        where.admin_status = { in: ['Failed', 'Cancelled'] };
      }
    }

    await db.$queryRaw`SELECT 1`;

    const transactions = await db.addFunds.findMany({
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

    const transformedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.original_amount || transaction.amount,
      status: mapStatus(transaction.status || 'Processing'),
      method: transaction.method || 'uddoktapay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      transaction_type: transaction.transaction_type || 'deposit',
      reference_id: transaction.order_id,
      sender_number: transaction.sender_number,
      phone: transaction.sender_number,
      currency: transaction.currency || 'BDT',
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
