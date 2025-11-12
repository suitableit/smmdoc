import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

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
    const roleFilter = searchParams.get('role') || 'user';

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
        startDate = undefined;
    }

    const dateFilter = startDate ? {
      createdAt: {
        gte: startDate
      }
    } : {};

    const [
      totalUsers,
      totalBalance,
      totalSpent,
      totalDeposits
    ] = await Promise.all([
      db.user.count({
        where: {
          role: roleFilter as any,
          ...dateFilter
        }
      }),

      db.user.aggregate({
        where: {
          role: roleFilter as any
        },
        _sum: {
          balance: true
        }
      }),

      db.user.aggregate({
        where: {
          role: roleFilter as any
        },
        _sum: {
          total_spent: true
        }
      }),

      db.user.aggregate({
        where: {
          role: roleFilter as any
        },
        _sum: {
          total_deposit: true
        }
      })
    ]);

    const [verifiedActiveUsers, verifiedSuspendedUsers, verifiedBannedUsers, unverifiedUsers] = await Promise.all([
      db.user.count({
        where: {
          role: roleFilter as any,
          emailVerified: { not: null },
          status: 'active',
          ...dateFilter
        }
      }),
      db.user.count({
        where: {
          role: roleFilter as any,
          emailVerified: { not: null },
          status: 'suspended',
          ...dateFilter
        }
      }),
      db.user.count({
        where: {
          role: roleFilter as any,
          emailVerified: { not: null },
          status: 'banned',
          ...dateFilter
        }
      }),
      db.user.count({
        where: {
          role: roleFilter as any,
          emailVerified: null,
          ...dateFilter
        }
      })
    ]);

    const completeStatusBreakdown = [
      { status: 'active', _count: { id: verifiedActiveUsers } },
      { status: 'suspended', _count: { id: verifiedSuspendedUsers } },
      { status: 'banned', _count: { id: verifiedBannedUsers } },
      { status: 'pending', _count: { id: unverifiedUsers } }
    ];

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const dailyRegistrations = await db.user.groupBy({
      by: ['createdAt'],
      where: {
        role: roleFilter as any,
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

    const currencyBreakdown = await db.user.groupBy({
      by: ['currency'],
      where: {
        role: roleFilter as any
      },
      _count: {
        id: true
      },
      _sum: {
        balance: true
      }
    });

    const topUsersByBalance = await db.user.findMany({
      where: {
        role: roleFilter as any
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

    const topUsersBySpending = await db.user.findMany({
      where: {
        role: roleFilter as any
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

    const formattedStatusBreakdown = completeStatusBreakdown.map(status => ({
      status: status.status || 'active',
      count: status._count.id
    }));

    const formattedCurrencyBreakdown = currencyBreakdown.map(currency => ({
      currency: currency.currency || 'BDT',
      users: currency._count.id,
      totalBalance: currency._sum.balance || 0
    }));

    const responseData = {
      overview: {
        totalUsers,
        totalBalance: (totalBalance._sum as any).balance || 0,
        totalSpent: (totalSpent._sum as any).balance || 0,
        totalDeposits: (totalDeposits._sum as any).balance || 0
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
