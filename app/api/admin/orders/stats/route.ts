import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/orders/stats - Get order statistics for admin dashboard
export async function GET(req: NextRequest) {
  try {
    console.log('Stats API called');
    const session = await auth();
    console.log('Stats session:', session?.user?.email, session?.user?.role);

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      console.log('Stats unauthorized access attempt');
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
    const period = searchParams.get('period') || 'all'; // days or 'all'
    const userId = searchParams.get('userId'); // optional filter by user

    // Build where clause
    const whereClause: any = {};

    // Only add date filter if period is not 'all'
    if (period !== 'all') {
      const periodDays = parseInt(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      whereClause.createdAt = {
        gte: startDate
      };
    }

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
      
      // Daily order trends (last 30 days or all time)
      period === 'all' ?
        (userId ? 
          db.$queryRaw`
            SELECT
              DATE(createdAt) as date,
              COUNT(*) as orders,
              SUM(price) as revenue,
              COUNT(DISTINCT userId) as unique_users
            FROM NewOrder
            WHERE userId = ${userId}
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
            LIMIT 30
          ` :
          db.$queryRaw`
            SELECT
              DATE(createdAt) as date,
              COUNT(*) as orders,
              SUM(price) as revenue,
              COUNT(DISTINCT userId) as unique_users
            FROM NewOrder
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
            LIMIT 30
          `
        ) :
        (userId ?
          db.$queryRaw`
            SELECT
              DATE(createdAt) as date,
              COUNT(*) as orders,
              SUM(price) as revenue,
              COUNT(DISTINCT userId) as unique_users
            FROM NewOrder
            WHERE createdAt >= ${new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)}
            AND userId = ${userId}
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
            LIMIT 30
          ` :
          db.$queryRaw`
            SELECT
              DATE(createdAt) as date,
              COUNT(*) as orders,
              SUM(price) as revenue,
              COUNT(DISTINCT userId) as unique_users
            FROM NewOrder
            WHERE createdAt >= ${new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)}
            GROUP BY DATE(createdAt)
            ORDER BY date DESC
            LIMIT 30
          `
        ),
      
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
    
    // Calculate growth rates (compare with previous period) - only if period is specified
    let orderGrowth = 0;
    let revenueGrowth = 0;
    const periodInfo: any = {
      type: period === 'all' ? 'all-time' : 'period',
      endDate: new Date().toISOString()
    };

    if (period !== 'all') {
      const periodDays = parseInt(period);
      const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
      const previousPeriodStart = new Date(startDate.getTime() - periodDays * 24 * 60 * 60 * 1000);

      periodInfo.days = periodDays;
      periodInfo.startDate = startDate.toISOString();

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

      orderGrowth = previousPeriodStats._count.id > 0
        ? ((totalStats._count.id - previousPeriodStats._count.id) / previousPeriodStats._count.id) * 100
        : 0;

      revenueGrowth = (previousPeriodStats._sum.price || 0) > 0
        ? (((totalStats._sum.price || 0) - (previousPeriodStats._sum.price || 0)) / (previousPeriodStats._sum.price || 0)) * 100
        : 0;
    }

    console.log('Total stats:', totalStats);
    console.log('Status stats:', statusStats);

    // Convert BigInt values to Numbers for JSON serialization
    const convertBigIntToNumber = (value: any): number => {
      return typeof value === 'bigint' ? Number(value) : (value || 0);
    };

    const statistics = {
      period: periodInfo,
      overview: {
        totalOrders: convertBigIntToNumber(totalStats._count.id),
        totalRevenue: convertBigIntToNumber(totalStats._sum.price),
        totalQuantity: convertBigIntToNumber(totalStats._sum.qty),
        averageOrderValue: convertBigIntToNumber(totalStats._avg.price),
        orderGrowth: Math.round(orderGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      },
      statusBreakdown: statusStats.map(stat => ({
        status: stat.status,
        count: convertBigIntToNumber(stat._count.status),
        revenue: convertBigIntToNumber(stat._sum.price),
        percentage: totalStats._count.id > 0 ? Math.round((convertBigIntToNumber(stat._count.status) / convertBigIntToNumber(totalStats._count.id)) * 100) : 0
      })),
      dailyTrends: Array.isArray(dailyStats) ? dailyStats.map((stat: any) => ({
        date: stat.date,
        orders: convertBigIntToNumber(stat.orders),
        revenue: convertBigIntToNumber(stat.revenue),
        unique_users: convertBigIntToNumber(stat.unique_users)
      })) : [],
      topServices: topServicesWithDetails.map(stat => ({
        ...stat,
        _count: {
          serviceId: convertBigIntToNumber(stat._count.serviceId)
        },
        _sum: {
          price: convertBigIntToNumber(stat._sum.price),
          qty: convertBigIntToNumber(stat._sum.qty)
        }
      })),
      topUsers: topUsersWithDetails.map(stat => ({
        ...stat,
        _count: {
          userId: convertBigIntToNumber(stat._count.userId)
        },
        _sum: {
          price: convertBigIntToNumber(stat._sum.price)
        }
      })),
      revenueByCurrency: revenueStats.map(stat => ({
        currency: stat.currency,
        orders: convertBigIntToNumber(stat._count.currency),
        revenue: convertBigIntToNumber(stat._sum.price)
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
