import { auth } from '@/auth';
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

    // Get memory usage
    const memoryUsage = process.memoryUsage();
    
    const stats = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      heapUsedPercentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error getting memory stats:', error);
    return NextResponse.json(
      { error: 'Failed to get memory stats' },
      { status: 500 }
    );
  }
}
