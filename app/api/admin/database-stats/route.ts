import { auth } from '@/auth';
import { db as prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get database statistics
    const [
      totalServices,
      totalCategories,
      totalOrders,
      totalUsers
    ] = await Promise.all([
      prisma.service.count(),
      prisma.category.count(),
      prisma.newOrder.count(),
      prisma.user.count()
    ]);

    const stats = {
      totalServices,
      totalCategories,
      totalOrders,
      totalUsers,
      activeConnections: 1, // This would need to be implemented based on your DB setup
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting database stats:', error);
    return NextResponse.json(
      { error: 'Failed to get database stats' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
