import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all';

    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        dateFilter = {
          createdAt: {
            gte: todayStart
          }
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = {
          createdAt: {
            gte: weekAgo
          }
        };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = {
          createdAt: {
            gte: monthAgo
          }
        };
        break;
      default:
        break;
    }

    const [
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      cancelledTransactions,
      suspiciousTransactions,
      totalVolumeResult,
      todayTransactions,
      recentTransactions
    ] = await Promise.all([
      db.addFunds.count({ where: dateFilter }),
      
      db.addFunds.count({ 
        where: { ...dateFilter, admin_status: 'Pending' } 
      }),
      
      db.addFunds.count({ 
        where: { ...dateFilter, admin_status: 'Success' } 
      }),
      
      db.addFunds.count({ 
        where: { ...dateFilter, admin_status: 'Cancelled' } 
      }),
      
      db.addFunds.count({ 
        where: { ...dateFilter, admin_status: 'Suspicious' } 
      }),
      
      db.addFunds.aggregate({
        where: { ...dateFilter, admin_status: 'Success' },
        _sum: { usd_amount: true }
      }),
      
      (() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return db.addFunds.count({
          where: {
            createdAt: {
              gte: todayStart
            }
          }
        });
      })(),
      
      db.addFunds.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          usd_amount: true,
          admin_status: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    const totalVolume = totalVolumeResult._sum.usd_amount || 0;

    const statusBreakdown = {
      pending: pendingTransactions,
      completed: completedTransactions,
      cancelled: cancelledTransactions,
      suspicious: suspiciousTransactions,
      Success: completedTransactions,
      Pending: pendingTransactions,
      Cancelled: cancelledTransactions,
      Suspicious: suspiciousTransactions
    };

    const percentages = {
      pending: totalTransactions > 0 ? Math.round((pendingTransactions / totalTransactions) * 100) : 0,
      completed: totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0,
      cancelled: totalTransactions > 0 ? Math.round((cancelledTransactions / totalTransactions) * 100) : 0,
      suspicious: totalTransactions > 0 ? Math.round((suspiciousTransactions / totalTransactions) * 100) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        totalTransactions,
        pendingTransactions,
        completedTransactions,
        cancelledTransactions,
        suspiciousTransactions,
        totalVolume,
        todayTransactions,
        statusBreakdown,
        percentages,
        recentTransactions: recentTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          status: t.admin_status,
          createdAt: t.createdAt.toISOString(),
          user: t.user
        })),
        period
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transaction stats: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null 
      },
      { status: 500 }
    );
  }
}
