import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Fetch counts in parallel
    const [completedOrders, activeServices, activeUsers, totalUsers, totalOrders] = await Promise.all([
      db.newOrder.count({
        where: { status: 'completed' },
      }),
      db.service.count({
        where: { status: 'active', deletedAt: null },
      }),
      db.user.count({
        where: { role: 'user', status: 'active' },
      }),
      db.user.count({
        where: { role: 'user' },
      }),
      db.newOrder.count(),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          completedOrders,
          activeServices,
          activeUsers,
          totalUsers,
          totalOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching homepage stats',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}