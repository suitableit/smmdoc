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
    const limit = parseInt(searchParams.get('limit') || '20'); // Increased for admin view
    const offset = parseInt(searchParams.get('offset') || '0');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';
    const adminView = searchParams.get('admin') === 'true';

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // If admin view, don't filter by userId, otherwise filter by current user
    if (!adminView || session.user.role !== 'admin') {
      where.userId = session.user.id;
    }

    // Add search functionality for admin view
    if (search && adminView && session.user.role === 'admin') {
      where.OR = [
        { transaction_id: { contains: search, mode: 'insensitive' } },
        { invoice_id: { contains: search, mode: 'insensitive' } },
        { sender_number: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Status filtering
    if (status && status !== 'all') {
      if (status === 'Success' || status === 'completed') {
        where.admin_status = 'Success';
      } else if (status === 'pending' || status === 'Pending') {
        where.admin_status = 'Pending';
      } else if (status === 'cancelled' || status === 'Cancelled') {
        where.admin_status = 'Cancelled';
      } else if (status === 'Suspicious') {
        where.admin_status = 'Suspicious';
      } else if (status === 'failed') {
        where.status = { in: ['Failed', 'Cancelled'] };
      }
    }

    // Type filtering (deposit/withdrawal)
    if (type && type !== 'all') {
      // For now, AddFund table only contains deposits
      // In future, you might have separate tables for withdrawals
      if (type === 'withdrawal') {
        // Return empty result for now as we don't have withdrawal data
        where.id = -1; // This will return no results
      }
    }

    // Fetch transactions from database (using AddFund model) with timeout
    const [transactions, totalCount] = await Promise.all([
      Promise.race([
        db.addFund.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          take: limit > 10000 ? undefined : limit, // No limit for "All" option
          skip: adminView ? skip : offset, // Use skip for admin pagination, offset for user
          select: {
            id: true,
            invoice_id: true,
            amount: true,
            status: true,
            method: true,
            payment_method: true,
            transaction_id: true,
            createdAt: true,
            updatedAt: true,
            order_id: true,
            sender_number: true,
            currency: true,
            admin_status: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]) as any[],
      // Get total count for pagination (only for admin view)
      adminView && session.user.role === 'admin'
        ? db.addFund.count({ where })
        : Promise.resolve(0)
    ]);

    // Transform data to match frontend interface
    const transformedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      transactionId: transaction.transaction_id || transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.amount,
      status: transaction.status || 'Processing',
      admin_status: transaction.admin_status || 'pending',
      method: transaction.method || 'uddoktapay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt?.toISOString() || transaction.createdAt.toISOString(),
      type: 'deposit', // All AddFund records are deposits
      phone: transaction.sender_number || '',
      currency: transaction.currency || 'BDT',
      userId: transaction.userId,
      user: transaction.user ? {
        id: transaction.user.id,
        name: transaction.user.name || '',
        email: transaction.user.email || '',
        username: transaction.user.username || '',
      } : null,
      notes: '', // Can be added later if needed
      processedAt: transaction.admin_status === 'Success' ? transaction.updatedAt?.toISOString() : null,
    }));

    // For admin view, return structured response with pagination
    if (adminView && session.user.role === 'admin') {
      const totalPages = Math.ceil(totalCount / limit);

      // Calculate stats for admin dashboard
      const stats = {
        totalTransactions: totalCount,
        pendingTransactions: await db.addFund.count({
          where: { ...where, admin_status: 'Pending' }
        }),
        completedTransactions: await db.addFund.count({
          where: { ...where, admin_status: 'Success' }
        }),
        cancelledTransactions: await db.addFund.count({
          where: { ...where, admin_status: 'Cancelled' }
        }),
        suspiciousTransactions: await db.addFund.count({
          where: { ...where, admin_status: 'Suspicious' }
        }),
        totalVolume: await db.addFund.aggregate({
          where: { ...where, admin_status: 'Success' },
          _sum: { amount: true }
        }).then(result => result._sum.amount || 0),
        todayTransactions: await db.addFund.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        })
      };

      return NextResponse.json({
        success: true,
        data: transformedTransactions,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats,
        error: null
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
    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };

    if (status === 'approved' || status === 'Success') {
      updateData.status = 'Success';
      updateData.admin_status = 'Success';

      // Add balance to user account only if not already approved
      if (transaction.admin_status !== 'Success') {
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount },
            total_deposit: { increment: transaction.amount }
          }
        });
      }
    } else if (status === 'cancelled' || status === 'Cancelled') {
      updateData.status = 'Cancelled';
      updateData.admin_status = 'Cancelled';

      // If transaction was previously approved, deduct balance
      if (transaction.admin_status === 'Success') {
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { decrement: transaction.amount },
            total_deposit: { decrement: transaction.amount }
          }
        });
      }
    } else if (status === 'Suspicious') {
      updateData.admin_status = 'Suspicious';
      updateData.status = 'Processing'; // Keep original status but mark as suspicious
    } else if (status === 'Pending' || status === 'pending') {
      updateData.admin_status = 'Pending';
      updateData.status = 'Processing';
    }

    // Update the transaction
    const updatedTransaction = await db.addFund.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: {
        id: updatedTransaction.id,
        transactionId: updatedTransaction.transaction_id,
        amount: updatedTransaction.amount,
        status: updatedTransaction.status,
        admin_status: updatedTransaction.admin_status,
        currency: updatedTransaction.currency,
        user: updatedTransaction.user,
        updatedAt: updatedTransaction.updatedAt.toISOString()
      },
      error: null
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}


