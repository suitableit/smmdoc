import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
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
      prisma.order.count(),
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
