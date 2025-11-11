import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Homepage Stats API Called ===');
    
    const allUsers = await db.user.findMany({
      take: 5,
      select: {
        id: true,
        role: true,
        status: true,
      },
    });
    console.log('Sample users from database:', allUsers);

    const allUsersCount = await db.user.count();
    console.log('Total users count (all):', allUsersCount);

    const usersWithRoleUser = await db.user.count({
      where: { role: 'user' },
    });
    console.log('Users with role "user":', usersWithRoleUser);

    const activeUsersWithRoleUser = await db.user.count({
      where: { role: 'user', status: 'active' },
    });
    console.log('Active users with role "user":', activeUsersWithRoleUser);

    const allOrders = await db.newOrder.count();
    console.log('Total orders count:', allOrders);

    const completedOrdersCount = await db.newOrder.count({
      where: { status: 'completed' },
    });
    console.log('Completed orders count:', completedOrdersCount);

    const activeServicesCount = await db.service.count({
      where: { status: 'active', deletedAt: null },
    });
    console.log('Active services count:', activeServicesCount);

    const [completedOrders, activeServices, activeUsers, totalUsers, totalOrders] = await Promise.all([
      db.newOrder.count({
        where: { status: 'completed' },
      }).catch(err => {
        console.error('Error counting completed orders:', err);
        return 0;
      }),
      db.service.count({
        where: { status: 'active', deletedAt: null },
      }).catch(err => {
        console.error('Error counting active services:', err);
        return 0;
      }),
      db.user.count({
        where: { role: 'user', status: 'active' },
      }).catch(err => {
        console.error('Error counting active users:', err);
        return 0;
      }),
      db.user.count().catch(err => {
        console.error('Error counting total users:', err);
        return 0;
      }),
      db.newOrder.count().catch(err => {
        console.error('Error counting total orders:', err);
        return 0;
      }),
    ]);

    const responseData = {
      success: true,
      data: {
        completedOrders: completedOrders ?? 0,
        activeServices: activeServices ?? 0,
        activeUsers: activeUsers ?? 0,
        totalUsers: totalUsers ?? 0,
        totalOrders: totalOrders ?? 0,
      },
    };

    console.log('=== Homepage Stats - Final Response ===');
    console.log('Raw counts from Promise.all:', {
      completedOrders,
      activeServices,
      activeUsers,
      totalUsers,
      totalOrders,
    });
    console.log('Response data:', responseData);
    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('=== Error fetching homepage stats ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        message: 'Error fetching homepage stats',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: {
          completedOrders: 0,
          activeServices: 0,
          activeUsers: 0,
          totalUsers: 0,
          totalOrders: 0,
        },
      },
      { status: 500 }
    );
  }
}