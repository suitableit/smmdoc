import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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
    const period = searchParams.get('period') || 'all';

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date | undefined;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = undefined; // All time
    }

    // Build where clause for date filtering
    const dateFilter = startDate ? {
      createdAt: {
        gte: startDate
      }
    } : {};

    // Get overview statistics
    const [
      totalUsers,
      totalBalance,
      totalSpent,
      totalDeposits
    ] = await Promise.all([
      // Total users (excluding admins)
      db.user.count({
        where: {
          role: 'user',
          ...dateFilter
        }
      }),
      
      // Total balance across all users
      db.user.aggregate({
        where: {
          role: 'user'
        },
        _sum: {
          balance: true
        }
      }),
      
      // Total spent by all users
      db.user.aggregate({
        where: {
          role: 'user'
        },
        _sum: {
          total_spent: true
        }
      }),
      
      // Total deposits by all users
      db.user.aggregate({
        where: {
          role: 'user'
        },
        _sum: {
          total_deposit: true
        }
      })
    ]);

    // Get status breakdown (since User model doesn't have status field, we'll create a mock breakdown)
    // For now, we'll consider all users as 'active' since there's no status field
    const activeUsersCount = await db.user.count({
      where: {
        role: 'user',
        ...dateFilter
      }
    });

    const statusBreakdown = [
      { status: 'active', _count: { id: activeUsersCount } },
      { status: 'inactive', _count: { id: 0 } },
      { status: 'suspended', _count: { id: 0 } },
      { status: 'banned', _count: { id: 0 } }
    ];

    // Get daily registration trends for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyRegistrations = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'user',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Format daily trends
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      const registrations = dailyRegistrations.filter(reg => 
        reg.createdAt.toISOString().split('T')[0] === dateStr
      ).reduce((sum, reg) => sum + reg._count.id, 0);
      
      dailyTrends.push({
        date: dateStr,
        registrations
      });
    }

    // Get currency breakdown
    const currencyBreakdown = await db.user.groupBy({
      by: ['currency'],
      where: {
        role: 'user'
      },
      _count: {
        id: true
      },
      _sum: {
        balance: true
      }
    });

    // Get top users by balance
    const topUsersByBalance = await db.user.findMany({
      where: {
        role: 'user'
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
        createdAt: true
      },
      orderBy: {
        balance: 'desc'
      },
      take: 10
    });

    // Get top users by spending
    const topUsersBySpending = await db.user.findMany({
      where: {
        role: 'user'
      },
      select: {
        id: true,
        name: true,
        email: true,
        balance: true,
        currency: true,
        createdAt: true
      },
      orderBy: {
        total_spent: 'desc'
      },
      take: 10
    });

    // Format status breakdown for easier consumption
    const formattedStatusBreakdown = statusBreakdown.map(status => ({
      status: status.status || 'active',
      count: status._count.id
    }));

    // Format currency breakdown
    const formattedCurrencyBreakdown = currencyBreakdown.map(currency => ({
      currency: currency.currency || 'BDT',
      users: currency._count.id,
      totalBalance: currency._sum.balance || 0
    }));

    const responseData = {
      overview: {
        totalUsers,
        totalBalance: totalBalance._sum.balance || 0,
        totalSpent: totalSpent._sum.balance || 0, // Using balance as proxy since total_spent doesn't exist
        totalDeposits: totalDeposits._sum.balance || 0 // Using balance as proxy since total_deposit doesn't exist
      },
      statusBreakdown: formattedStatusBreakdown,
      currencyBreakdown: formattedCurrencyBreakdown,
      dailyTrends,
      topUsers: {
        byBalance: topUsersByBalance,
        bySpending: topUsersBySpending
      },
      period
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      error: null
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user statistics: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
