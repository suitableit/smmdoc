import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

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

    // Create refill and cancel tasks based on order status
    const tasks = [];

    for (const order of orders) {
      // Create refill tasks for completed/partial orders
      if (['completed', 'partial'].includes(order.status) && (order.service as any)?.status === 'active') {
        tasks.push({
          id: `refill_${order.id}`,
          originalOrderId: order.id,
          originalOrder: order,
          type: 'refill' as const,
          status: 'pending' as const,
          reason: order.status === 'partial' ? 'Partial delivery - refill remaining quantity' : 'Service delivery completed - refill available',
          refillType: order.status === 'partial' ? 'remaining' : 'full',
          customQuantity: order.status === 'partial' ? order.remains : order.qty,
          processedBy: undefined,
          createdAt: new Date(order.updatedAt).toISOString(),
          updatedAt: new Date(order.updatedAt).toISOString(),
        });
      }

      // Create cancel tasks for pending/processing/in_progress orders
      if (['pending', 'processing', 'in_progress'].includes(order.status)) {
        const progress = order.qty > 0 ? ((order.qty - order.remains) / order.qty) * 100 : 0;
        let refundType = 'full';
        let customRefundAmount = order.price;

        if (order.status === 'processing' && progress > 0) {
          refundType = 'partial';
          customRefundAmount = order.price * 0.8; // 80% refund if processing started
        } else if (order.status === 'in_progress') {
          refundType = 'partial';
          customRefundAmount = order.price * Math.max(0.5, (100 - progress) / 100); // Proportional refund
        }

        tasks.push({
          id: `cancel_${order.id}`,
          originalOrderId: order.id,
          originalOrder: order,
          type: 'cancel' as const,
          status: 'pending' as const,
          reason: `Order cancellation requested - Status: ${order.status}`,
          refundType,
          customRefundAmount,
          processedBy: undefined,
          createdAt: new Date(order.createdAt).toISOString(),
          updatedAt: new Date(order.updatedAt).toISOString(),
        });
      }
    }

    // Calculate statistics
    const cancelTasks = tasks.filter(t => t.type === 'cancel');
    const refillTasks = tasks.filter(t => t.type === 'refill');

    const stats = {
      totalCancellations: cancelTasks.length,
      pendingCancellations: cancelTasks.filter(t => t.status === 'pending').length,
      completedCancellations: cancelTasks.filter(t => (t as any).status === 'completed').length,
      refundProcessed: cancelTasks.filter(t => ['completed', 'refunded'].includes(t.status)).length,
      totalRefillRequests: refillTasks.length,
      pendingRefills: refillTasks.filter(t => t.status === 'pending').length,
      completedRefills: refillTasks.filter(t => (t as any).status === 'completed').length,
      totalRefundAmount: cancelTasks
        .filter(t => ['completed', 'refunded'].includes(t.status))
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
