import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/orders/refill-orders - Get orders eligible for refill
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause for refill-eligible orders
    const whereClause: any = {
      status: {
        in: ['completed', 'partial'] // Only completed or partial orders can be refilled
      }
    };

    // Add status filter if specified
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          id: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          service: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
    }

    // Get refill-eligible orders
    const [orders, totalCount] = await Promise.all([
      db.newOrder.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              currency: true,
              balance: true
            }
          },
          service: {
            select: {
              id: true,
              name: true,
              rate: true,
              min_order: true,
              max_order: true,
              status: true
            }
          },
          category: {
            select: {
              id: true,
              category_name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.newOrder.count({
        where: whereClause
      })
    ]);

    // Filter orders that are actually eligible for refill
    const eligibleOrders = orders.filter(order => {
      // Check if service is still active
      if (order.service.status !== 'active') return false;
      
      // For partial orders, check if there are remaining items
      if (order.status === 'partial' && order.remains > 0) return true;
      
      // For completed orders, allow refill (business logic decision)
      if (order.status === 'completed') return true;
      
      return false;
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate stats
    const stats = await db.newOrder.aggregate({
      where: {
        status: {
          in: ['completed', 'partial']
        }
      },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    });

    const statusBreakdown = await db.newOrder.groupBy({
      by: ['status'],
      where: {
        status: {
          in: ['completed', 'partial']
        }
      },
      _count: {
        status: true
      }
    });

    return NextResponse.json({
      success: true,
      data: eligibleOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        totalEligible: stats._count.id,
        totalValue: stats._sum.price || 0,
        completed: statusBreakdown.find(s => s.status === 'completed')?._count.status || 0,
        partial: statusBreakdown.find(s => s.status === 'partial')?._count.status || 0
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching refill-eligible orders:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching refill-eligible orders',
        success: false,
        data: null 
      },
      { status: 500 }
    );
  }
}
