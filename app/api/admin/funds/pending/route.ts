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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const status = searchParams.get('status') || 'pending';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause: {
      admin_status: string;
      OR?: Array<{
        user?: {
          name?: { contains: string; mode: string };
          email?: { contains: string; mode: string };
        };
        transaction_id?: { contains: string; mode: string };
        invoice_id?: { contains: string; mode: string };
      }>;
    } = {
      admin_status: status,
    };

    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          transaction_id: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          invoice_id: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
    if (sortBy === 'user.name') {
      orderBy = {
        user: {
          name: sortOrder as 'asc' | 'desc',
        },
      };
    } else {
      orderBy[sortBy] = sortOrder as 'asc' | 'desc';
    }

    // Fetch transactions with pagination
    const [transactions, totalCount] = await Promise.all([
      db.addFund.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currency: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.addFund.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching pending transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending transactions', details: String(error) },
      { status: 500 }
    );
  }
}
