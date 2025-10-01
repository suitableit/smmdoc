import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';
    const serviceId = searchParams.get('serviceId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the where clause
    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    };

    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Add service filter if provided
    if (serviceId) {
      whereClause.serviceId = serviceId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { 
          id: {
            equals: isNaN(parseInt(search)) ? undefined : parseInt(search)
          }
        },
        { link: { contains: search } },
        {
          service: {
            name: { contains: search }
          }
        },
        {
          category: {
            category_name: { contains: search }
          }
        }
      ].filter(condition => {
        // Remove undefined conditions
        return Object.values(condition)[0] !== undefined;
      });
    }

    // Get total count for pagination
    const totalOrders = await db.newOrder.count({
      where: whereClause
    });

    // Get orders with pagination and enhanced data
    const orders = await db.newOrder.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            rate: true,
            min_order: true,
            max_order: true,
            avg_time: true,
            status: true,
            refill: true,
            cancel: true
          }
        },
        category: {
          select: {
            id: true,
            category_name: true
          }
        },
        cancelRequests: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate user order statistics
    const stats = await db.newOrder.aggregate({
      where: { userId: session.user.id },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    });

    // Get status breakdown
    const statusCounts = await db.newOrder.groupBy({
      by: ['status'],
      where: { userId: session.user.id },
      _count: {
        status: true
      }
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        stats: {
          totalOrders: stats._count.id,
          totalSpent: stats._sum.price || 0,
          statusBreakdown: statusCounts.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {} as Record<string, number>)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}