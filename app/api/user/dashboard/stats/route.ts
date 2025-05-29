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
    
    // Get user with funds
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        addFunds: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }
    
    // Calculate user balance
    const userBalance = user.addFunds.reduce((acc, fund) => acc + (fund.amount || 0), 0);
    
    // Get total orders by user
    const totalOrders = await db.newOrder.count({
      where: { userId: session.user.id }
    });
    
    // Get total spent
    const orders = await db.newOrder.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['completed', 'processing']
        }
      },
      select: {
        usdPrice: true,
        bdtPrice: true,
        currency: true
      }
    });
    
    // Calculate total spent based on user's currency
    const totalSpent = orders.reduce((acc, order) => {
      if (user.currency === 'USD') {
        return acc + order.usdPrice;
      } else {
        return acc + order.bdtPrice;
      }
    }, 0);
    
    // Get orders by status
    const pendingOrders = await db.newOrder.count({
      where: { 
        userId: session.user.id,
        status: 'pending' 
      }
    });
    
    const processingOrders = await db.newOrder.count({
      where: { 
        userId: session.user.id,
        status: 'processing' 
      }
    });
    
    const completedOrders = await db.newOrder.count({
      where: { 
        userId: session.user.id,
        status: 'completed' 
      }
    });
    
    const cancelledOrders = await db.newOrder.count({
      where: { 
        userId: session.user.id,
        status: 'cancelled' 
      }
    });
    
    // Get recent orders
    const recentOrders = await db.newOrder.findMany({
      where: {
        userId: session.user.id
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        service: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            category_name: true
          }
        }
      }
    });
    
    // Get favorite categories
    const favoriteCategories = await db.favrouteCat.findMany({
      where: {
        userId: session.user.id
      },
      take: 5,
      include: {
        services: {
          select: {
            id: true,
            name: true
          },
          take: 3
        }
      }
    });
    
    return NextResponse.json(
      {
        success: true,
        data: {
          balance: userBalance,
          currency: user.currency,
          dollarRate: user.dollarRate,
          totalOrders,
          totalSpent,
          recentOrders,
          favoriteCategories,
          ordersByStatus: {
            pending: pendingOrders,
            processing: processingOrders,
            completed: completedOrders,
            cancelled: cancelledOrders
          }
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