import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await requireAuth();

    const user = await db.users.findUnique({
      where: { id: session.user.id },
      select: {
        balance: true,
        total_deposit: true,
        total_spent: true,
        currency: true,
        dollarRate: true,
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found', data: null },
        { status: 404 }
      );
    }
    
    const userBalance = user.balance || 0;
    const totalDeposit = user.total_deposit || 0;
    const totalSpent = user.total_spent || 0;
    
    const totalOrders = await db.newOrders.count({
      where: { userId: session.user.id }
    });
    
    const pendingOrders = await db.newOrders.count({
      where: { 
        userId: session.user.id,
        status: 'pending' 
      }
    });
    
    const processingOrders = await db.newOrders.count({
      where: { 
        userId: session.user.id,
        status: 'processing' 
      }
    });
    
    const completedOrders = await db.newOrders.count({
      where: { 
        userId: session.user.id,
        status: 'completed' 
      }
    });
    
    const cancelledOrders = await db.newOrders.count({
      where: { 
        userId: session.user.id,
        status: 'cancelled' 
      }
    });
    
    const recentOrders = await db.newOrders.findMany({
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

    const favoriteCategories = await db.categories.findMany({
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

    const recentTransactions = await db.addFunds.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    return NextResponse.json({
      success: true,
      data: {
        balance: userBalance,
        currency: user.currency,
        dollarRate: user.dollarRate,
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
          createdAt: order.createdAt,
          link: order.link,
          qty: order.qty,
          usdPrice: order.usdPrice,
          providerStatus: order.providerStatus,
          service: {
            name: order.service.name
          },
          category: {
            category_name: order.service.category.category_name
          },
          user: {
            dollarRate: user.dollarRate
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
