import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/orders/stats - Get order statistics for admin dashboard
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
    const period = searchParams.get('period') || '30'; // days
    const userId = searchParams.get('userId'); // optional filter by user
    
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    
    // Build where clause
    const whereClause: any = {
      createdAt: {
        gte: startDate
      }
    };
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    // Get overall statistics
    const [
      totalStats,
      statusStats,
      dailyStats,
      topServices,
      topUsers,
      revenueStats
    ] = await Promise.all([
      // Total orders and revenue
      db.newOrder.aggregate({
        where: whereClause,
        _count: {
          id: true
        },
        _sum: {
          price: true,
          qty: true
        },
        _avg: {
          price: true
        }
      }),
      
      // Orders by status
      db.newOrder.groupBy({
        by: ['status'],
        where: whereClause,
        _count: {
          status: true
        },
        _sum: {
          price: true
        }
      }),
      
      // Daily order trends (last 30 days)
      db.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as orders,
          SUM(price) as revenue,
          COUNT(DISTINCT userId) as unique_users
        FROM NewOrder 
        WHERE createdAt >= ${startDate}
        ${userId ? db.$queryRaw`AND userId = ${userId}` : db.$queryRaw``}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
        LIMIT 30
      `,
      
      // Top services by order count
      db.newOrder.groupBy({
        by: ['serviceId'],
        where: whereClause,
        _count: {
          serviceId: true
        },
        _sum: {
          price: true,
          qty: true
        },
        orderBy: {
          _count: {
            serviceId: 'desc'
          }
        },
        take: 10
      }),
      
      // Top users by order count (if not filtering by specific user)
      userId ? [] : db.newOrder.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: {
          userId: true
        },
        _sum: {
          price: true
        },
        orderBy: {
          _count: {
            userId: 'desc'
          }
        },
        take: 10
      }),
      
      // Revenue by currency
      db.newOrder.groupBy({
        by: ['currency'],
        where: whereClause,
        _count: {
          currency: true
        },
        _sum: {
          price: true
        }
      })
    ]);
    
    // Get service details for top services
    const serviceIds = topServices.map(s => s.serviceId);
    const services = serviceIds.length > 0 ? await db.service.findMany({
      where: {
        id: {
          in: serviceIds
        }
      },
      select: {
        id: true,
        name: true,
        rate: true,
        category: {
          select: {
            category_name: true
          }
        }
      }
    }) : [];
    
    // Get user details for top users (if not filtering by specific user)
    const userIds = topUsers.map(u => u.userId);
    const users = userIds.length > 0 ? await db.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true
      }
    }) : [];
    
    // Combine service data with statistics
    const topServicesWithDetails = topServices.map(stat => {
      const service = services.find(s => s.id === stat.serviceId);
      return {
        ...stat,
        service: service || { id: stat.serviceId, name: 'Unknown Service' }
      };
    });
    
    // Combine user data with statistics
    const topUsersWithDetails = topUsers.map(stat => {
      const user = users.find(u => u.id === stat.userId);
      return {
        ...stat,
        user: user || { id: stat.userId, name: 'Unknown User', email: 'unknown@example.com' }
      };
    });
    
    // Calculate growth rates (compare with previous period)
    const previousPeriodStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStats = await db.newOrder.aggregate({
      where: {
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        },
        ...(userId && { userId })
      },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    });
    
    const orderGrowth = previousPeriodStats._count.id > 0 
      ? ((totalStats._count.id - previousPeriodStats._count.id) / previousPeriodStats._count.id) * 100
      : 0;
      
    const revenueGrowth = (previousPeriodStats._sum.price || 0) > 0 
      ? (((totalStats._sum.price || 0) - (previousPeriodStats._sum.price || 0)) / (previousPeriodStats._sum.price || 0)) * 100
      : 0;
    
    const statistics = {
      period: {
        days: periodDays,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      },
      overview: {
        totalOrders: totalStats._count.id,
        totalRevenue: totalStats._sum.price || 0,
        totalQuantity: totalStats._sum.qty || 0,
        averageOrderValue: totalStats._avg.price || 0,
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      statusBreakdown: statusStats.map(stat => ({
        status: stat.status,
        count: stat._count.status,
        revenue: stat._sum.price || 0,
        percentage: totalStats._count.id > 0 ? Math.round((stat._count.status / totalStats._count.id) * 100) : 0
      })),
      dailyTrends: dailyStats,
      topServices: topServicesWithDetails,
      topUsers: topUsersWithDetails,
      revenueByCurrency: revenueStats.map(stat => ({
        currency: stat.currency,
        orders: stat._count.currency,
        revenue: stat._sum.price || 0
      }))
    };
    
    return NextResponse.json({
      success: true,
      data: statistics,
      error: null
    });
    
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch order statistics: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
