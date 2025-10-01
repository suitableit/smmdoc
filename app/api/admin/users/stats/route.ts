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
    const roleFilter = searchParams.get('role') || 'user'; // Default to 'user', can be 'moderator', 'admin', etc.

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
      // Total users with specified role
      db.user.count({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator',
          ...dateFilter
        }
      }),

      // Total balance across users with specified role
      db.user.aggregate({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator'
        },
        _sum: {
          balance: true
        }
      }),

      // Total spent by users with specified role
      db.user.aggregate({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator'
        },
        _sum: {
          total_spent: true
        }
      }),

      // Total deposits by users with specified role
      db.user.aggregate({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator'
        },
        _sum: {
          total_deposit: true
        }
      })
    ]);

    // Get status breakdown - count users by their effective status (considering emailVerified)
    const [verifiedActiveUsers, verifiedSuspendedUsers, verifiedBannedUsers, unverifiedUsers] = await Promise.all([
      // Verified active users
      db.user.count({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator',
          emailVerified: { not: null },
          status: 'active',
          ...dateFilter
        }
      }),
      // Verified suspended users
      db.user.count({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator',
          emailVerified: { not: null },
          status: 'suspended',
          ...dateFilter
        }
      }),
      // Verified banned users
      db.user.count({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator',
          emailVerified: { not: null },
          status: 'banned',
          ...dateFilter
        }
      }),
      // Unverified users (all count as pending)
      db.user.count({
        where: {
          role: roleFilter as 'user' | 'admin' | 'moderator',
          emailVerified: null,
          ...dateFilter
        }
      })
    ]);

    // Create complete status breakdown with proper pending count
    const completeStatusBreakdown = [
      { status: 'active', _count: { id: verifiedActiveUsers } },
      { status: 'suspended', _count: { id: verifiedSuspendedUsers } },
      { status: 'banned', _count: { id: verifiedBannedUsers } },
      { status: 'pending', _count: { id: unverifiedUsers } }
    ];

    // Get daily registration trends for the last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyRegistrations = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        role: roleFilter as 'user' | 'admin' | 'moderator',
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
        role: roleFilter as 'user' | 'admin' | 'moderator'
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
        role: roleFilter as 'user' | 'admin' | 'moderator'
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
        role: roleFilter as 'user' | 'admin' | 'moderator'
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
    const formattedStatusBreakdown = completeStatusBreakdown.map(status => ({
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
        totalSpent: totalSpent._sum.total_spent || 0,
        totalDeposits: totalDeposits._sum.total_deposit || 0
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
