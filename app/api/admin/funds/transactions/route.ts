import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = new URL(req.url).searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build search conditions
    let whereCondition = {};
    
    if (search) {
      whereCondition = {
        OR: [
          { transaction_id: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      };
    }
    
    // Get transactions with pagination
    const transactions = await db.addFund.findMany({
      where: whereCondition,
      select: {
        id: true,
        invoice_id: true,
        amount: true,
        original_amount: true,
        status: true,
        admin_status: true,
        method: true,
        payment_method: true,
        transaction_id: true,
        sender_number: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });
    
    // Get total count for pagination
    const totalCount = await db.addFund.count({ where: whereCondition });
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      transactions,
      totalPages,
      currentPage: page,
      totalCount,
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}