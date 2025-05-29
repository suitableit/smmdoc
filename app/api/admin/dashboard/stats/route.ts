import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 403 }
      );
    }
    
    // Get total orders
    const totalOrders = await db.newOrder.count();
    
    // Get total users
    const totalUsers = await db.user.count({
      where: { role: 'user' }
    });
    
    // Get total services
    const totalServices = await db.service.count();
    
    // Get total categories
    const totalCategories = await db.category.count();
    
    // Get total revenue
    const orders = await db.newOrder.findMany({
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
    
    // Get recent orders
    const recentOrders = await db.newOrder.findMany({
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
    
    // Get orders by status
    const pendingOrders = await db.newOrder.count({
      where: { status: 'pending' }
    });
    
    const processingOrders = await db.newOrder.count({
      where: { status: 'processing' }
    });
    
    const completedOrders = await db.newOrder.count({
      where: { status: 'completed' }
    });
    
    const cancelledOrders = await db.newOrder.count({
      where: { status: 'cancelled' }
    });
    
    // Get daily orders for the last 7 days
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const dailyOrders = await db.newOrder.groupBy({
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
    
    // Format daily orders for chart
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
            cancelled: cancelledOrders
          },
          dailyOrders: formattedDailyOrders
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