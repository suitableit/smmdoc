import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/orders/cancel-orders - Get orders eligible for cancellation
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

    // Build where clause for cancellation-eligible orders
    const whereClause: any = {
      status: {
        in: ['pending', 'processing', 'in_progress'] // Only these statuses can be cancelled
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

    // Get cancellation-eligible orders
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

    const totalPages = Math.ceil(totalCount / limit);

    // Calculate stats
    const stats = await db.newOrder.aggregate({
      where: {
        status: {
          in: ['pending', 'processing', 'in_progress']
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
          in: ['pending', 'processing', 'in_progress']
        }
      },
      _count: {
        status: true
      }
    });

    // Calculate potential refund amounts
    const totalRefundValue = orders.reduce((sum, order) => {
      // Calculate refund based on order progress
      const progress = order.qty > 0 ? ((order.qty - order.remains) / order.qty) * 100 : 0;
      let refundPercentage = 1; // Default full refund
      
      if (order.status === 'processing' && progress > 0) {
        refundPercentage = 0.8; // 80% refund if processing started
      } else if (order.status === 'in_progress') {
        refundPercentage = Math.max(0.5, (100 - progress) / 100); // Proportional refund
      }
      
      return sum + (order.price * refundPercentage);
    }, 0);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        totalCancellable: stats._count.id,
        totalValue: stats._sum.price || 0,
        totalRefundValue: totalRefundValue,
        pending: statusBreakdown.find(s => s.status === 'pending')?._count.status || 0,
        processing: statusBreakdown.find(s => s.status === 'processing')?._count.status || 0,
        inProgress: statusBreakdown.find(s => s.status === 'in_progress')?._count.status || 0
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching cancellation-eligible orders:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching cancellation-eligible orders',
        success: false,
        data: null 
      },
      { status: 500 }
    );
  }
}
