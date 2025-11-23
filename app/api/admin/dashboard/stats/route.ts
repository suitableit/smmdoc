import { requireAdmin } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await requireAdmin();

    const totalOrders = await db.newOrders.count();

    const totalUsers = await db.users.count({
      where: { role: 'user' }
    });

    const totalServices = await db.services.count();

    const totalCategories = await db.categories.count();

    const orders = await db.newOrders.findMany({
      where: {
        status: {
          in: ['completed', 'processing']
        }
      },
      select: {
        usdPrice: true
      }
    });

    const totalRevenue = orders.reduce((acc, order) => acc + order.usdPrice, 0);

    const recentOrders = await db.newOrders.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    const pendingOrders = await db.newOrders.count({
      where: { status: 'pending' }
    });

    const processingOrders = await db.newOrders.count({
      where: { status: 'processing' }
    });

    const completedOrders = await db.newOrders.count({
      where: { status: 'completed' }
    });

    const cancelledOrders = await db.newOrders.count({
      where: { status: 'cancelled' }
    });

    const partialOrders = await db.newOrders.count({
      where: { status: 'partial' }
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysOrders = await db.newOrders.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const todaysOrdersWithProfit = await db.newOrders.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        },
        status: {
          in: ['completed', 'processing']
        }
      },
      select: {
        profit: true
      }
    });

    const todaysProfit = todaysOrdersWithProfit.reduce((acc, order) => acc + (order.profit || 0), 0);

    const newUsersToday = await db.users.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        },
        role: 'user'
      }
    });

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const dailyOrders = await db.newOrders.groupBy({
      by: ['createdAt'],
      _count: {
        id: true
      },
      where: {
        createdAt: {
          gte: lastWeek
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedDailyOrders = dailyOrders.map(order => ({
      date: order.createdAt.toISOString().split('T')[0],
      orders: order._count.id
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          totalOrders,
          totalUsers,
          totalServices,
          totalCategories,
          totalRevenue,
          recentOrders,
          ordersByStatus: {
            pending: pendingOrders,
            processing: processingOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            partial: partialOrders
          },
          dailyOrders: formattedDailyOrders,
          todaysOrders,
          todaysProfit,
          newUsersToday
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching dashboard stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
