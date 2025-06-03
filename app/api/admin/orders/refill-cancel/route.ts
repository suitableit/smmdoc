import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

// GET /api/admin/orders/refill-cancel - Get all refill and cancel tasks
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

    // For now, we'll simulate refill and cancel tasks based on orders
    // In a real implementation, you would have separate RefillRequest and CancelRequest tables
    
    // Get orders that could have refill/cancel requests
    const orders = await db.newOrder.findMany({
      where: {
        OR: [
          { status: 'completed' }, // Eligible for refill
          { status: 'partial' },   // Eligible for refill
          { status: 'processing' }, // Eligible for cancel
          { status: 'pending' },    // Eligible for cancel
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            rate: true,
          }
        },
        category: {
          select: {
            id: true,
            category_name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit for performance
    });

    // Simulate refill and cancel tasks
    // In a real implementation, these would come from dedicated tables
    const tasks = orders.slice(0, 10).map((order, index) => {
      const isCancel = index % 3 === 0; // Every 3rd item is a cancel request
      const statuses = ['pending', 'processing', 'completed', 'cancelled'];
      const status = statuses[index % statuses.length];
      
      return {
        id: `${isCancel ? 'cancel' : 'refill'}_${order.id}_${Date.now() + index}`,
        originalOrderId: order.id,
        originalOrder: order,
        type: isCancel ? 'cancel' : 'refill',
        status: status,
        reason: isCancel ? 'User requested cancellation' : 'Service delivery incomplete',
        refillType: !isCancel ? (index % 2 === 0 ? 'full' : 'remaining') : undefined,
        refundType: isCancel ? (index % 2 === 0 ? 'full' : 'partial') : undefined,
        customQuantity: !isCancel && index % 3 === 0 ? Math.floor(order.qty * 0.5) : undefined,
        customRefundAmount: isCancel && index % 3 === 0 ? order.price * 0.8 : undefined,
        processedBy: status !== 'pending' ? session.user.email : undefined,
        createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(), // Spread over days
        updatedAt: new Date(Date.now() - (index * 12 * 60 * 60 * 1000)).toISOString(),
      };
    });

    // Calculate statistics
    const stats = {
      totalCancellations: tasks.filter(t => t.type === 'cancel').length,
      pendingCancellations: tasks.filter(t => t.type === 'cancel' && t.status === 'pending').length,
      completedCancellations: tasks.filter(t => t.type === 'cancel' && t.status === 'completed').length,
      refundProcessed: tasks.filter(t => t.type === 'cancel' && ['completed', 'refunded'].includes(t.status)).length,
      totalRefillRequests: tasks.filter(t => t.type === 'refill').length,
      pendingRefills: tasks.filter(t => t.type === 'refill' && t.status === 'pending').length,
      completedRefills: tasks.filter(t => t.type === 'refill' && t.status === 'completed').length,
      totalRefundAmount: tasks
        .filter(t => t.type === 'cancel' && ['completed', 'refunded'].includes(t.status))
        .reduce((sum, t) => sum + (t.customRefundAmount || t.originalOrder.price), 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        stats,
        total: tasks.length,
        message: 'Refill and cancel tasks retrieved successfully'
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching refill/cancel tasks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch refill and cancel tasks: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
