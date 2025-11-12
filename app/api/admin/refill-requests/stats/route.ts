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

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      declinedRequests,
      completedRequests
    ] = await Promise.all([
      db.refillRequest.count(),
      
      db.refillRequest.count({
        where: { status: 'pending' }
      }),
      
      db.refillRequest.count({
        where: { status: 'approved' }
      }),
      
      db.refillRequest.count({
        where: { status: 'declined' }
      }),
      
      db.refillRequest.count({
        where: { status: 'completed' }
      })
    ]);

    const eligibleOrdersCount = await db.newOrder.count({
      where: {
        status: 'completed',
        service: {
          refill: true
        }
      }
    });

    const stats = {
      totalRequests,
      pendingRequests,
      approvedRequests,
      declinedRequests,
      completedRequests,
      eligibleOrdersCount
    };

    return NextResponse.json({
      success: true,
      data: stats,
      error: null
    });

  } catch (error) {
    console.error('Error fetching refill request stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch refill request statistics',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
