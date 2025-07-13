import { getCurrentUser } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getCurrentUser();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    // Get user with all necessary fields
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        balance: true,
        total_deposit: true,
        total_spent: true,
        currency: true,
        addFunds: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }
    
    // Use the actual balance field from the database
    const userBalance = user.balance || 0;
    const totalDeposit = user.total_deposit || 0;
    const totalSpent = user.total_spent || 0;
    
    // Get total orders by user
    const totalOrders = await db.newOrder.count({
      where: { userId: session.user.id }
    });
    
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
    
    // Get recent orders with service and category details
    const recentOrders = await db.newOrder.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        service: {
          select: {
            name: true,
            category: {
              select: {
                category_name: true
              }
            }
          }
        }
      }
    });

    // Get favorite categories with services
    const favoriteCategories = await db.category.findMany({
      where: {
        services: {
          some: {
            newOrders: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      },
      include: {
        services: {
          take: 3,
          select: {
            id: true,
            name: true
          }
        }
      },
      take: 5
    });

    // Get recent transactions
    const recentTransactions = await db.addFund.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    // Return all stats
    return NextResponse.json({
      success: true,
      data: {
        balance: userBalance,
        totalDeposit: totalDeposit,
        totalSpent: totalSpent,
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders
        },
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          status: order.status,
          bdtPrice: order.bdtPrice,
          createdAt: order.createdAt,
          link: order.link,
          service: {
            name: order.service.name
          },
          category: {
            category_name: order.service.category.category_name
          }
        })),
        favoriteCategories: favoriteCategories.map(category => ({
          id: category.id,
          name: category.category_name,
          services: category.services
        })),
        recentTransactions
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch user stats', error: String(error) },
      { status: 500 }
    );
  }
}