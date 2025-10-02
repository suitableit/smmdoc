import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/refill-requests/stats - Get refill request statistics
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

    // Get refill request statistics
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      declinedRequests,
      completedRequests
    ] = await Promise.all([
      // Total refill requests
      db.refillRequest.count(),
      
      // Pending requests
      db.refillRequest.count({
        where: { status: 'pending' }
      }),
      
      // Approved requests
      db.refillRequest.count({
        where: { status: 'approved' }
      }),
      
      // Declined requests
      db.refillRequest.count({
        where: { status: 'declined' }
      }),
      
      // Completed requests
      db.refillRequest.count({
        where: { status: 'completed' }
      })
    ]);

    // Get eligible orders for refill (completed orders with refill enabled services)
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
