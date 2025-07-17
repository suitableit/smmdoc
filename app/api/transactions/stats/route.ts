import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // all, today, week, month

    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'today':
        dateFilter = {
          createdAt: {
            gte: new Date(now.setHours(0, 0, 0, 0))
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
        // No date filter for 'all'
        break;
    }

    // Get comprehensive stats
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
      // Total transactions
      db.addFund.count({ where: dateFilter }),
      
      // Pending transactions
      db.addFund.count({ 
        where: { ...dateFilter, admin_status: 'Pending' } 
      }),
      
      // Completed transactions
      db.addFund.count({ 
        where: { ...dateFilter, admin_status: 'Success' } 
      }),
      
      // Cancelled transactions
      db.addFund.count({ 
        where: { ...dateFilter, admin_status: 'Cancelled' } 
      }),
      
      // Suspicious transactions
      db.addFund.count({ 
        where: { ...dateFilter, admin_status: 'Suspicious' } 
      }),
      
      // Total volume (completed transactions only)
      db.addFund.aggregate({
        where: { ...dateFilter, admin_status: 'Success' },
        _sum: { amount: true }
      }),
      
      // Today's transactions
      db.addFund.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Recent transactions for quick overview
      db.addFund.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
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

    const totalVolume = totalVolumeResult._sum.amount || 0;

    // Calculate status breakdown
    const statusBreakdown = {
      pending: pendingTransactions,
      completed: completedTransactions,
      cancelled: cancelledTransactions,
      suspicious: suspiciousTransactions,
      // Legacy format for compatibility
      Success: completedTransactions,
      Pending: pendingTransactions,
      Cancelled: cancelledTransactions,
      Suspicious: suspiciousTransactions
    };

    // Calculate percentage distributions
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
