import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Task status/type definitions to allow broader status comparisons in statistics
type TaskStatus = 'pending' | 'completed' | 'refunded';
type TaskType = 'refill' | 'cancel';
type Task = {
  id: string;
  originalOrderId: number;
  originalOrder: any;
  type: TaskType;
  status: TaskStatus;
  reason: string;
  // Cancel task specific fields
  refundType?: 'full' | 'partial';
  customRefundAmount?: number;
  // Refill task specific fields
  refillType?: 'full' | 'remaining';
  customQuantity?: number;
  processedBy?: any;
  createdAt: string;
  updatedAt: string;
};

// GET /api/admin/orders/refill-cancel - Get all refill and cancel tasks
export async function GET() {
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
            status: true,
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
    const tasks: Task[] = [];

    for (const order of orders) {
      // Create refill tasks for completed/partial orders
      if (['completed', 'partial'].includes(order.status) && order.service?.status === 'active') {
        tasks.push({
          id: `refill_${order.id}`,
          originalOrderId: order.id,
          originalOrder: order,
          type: 'refill' as const,
          status: 'pending' as TaskStatus,
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
        const refundType: 'full' | 'partial' =
          (order.status === 'processing' && progress > 0) || order.status === 'in_progress'
            ? 'partial'
            : 'full';
        const customRefundAmount =
          order.status === 'processing' && progress > 0
            ? order.price * 0.8 // 80% refund if processing started
            : order.status === 'in_progress'
              ? order.price * Math.max(0.5, (100 - progress) / 100) // Proportional refund
              : order.price;

        tasks.push({
          id: `cancel_${order.id}`,
          originalOrderId: order.id,
          originalOrder: order,
          type: 'cancel' as const,
          status: 'pending' as TaskStatus,
          reason: `Order cancellation requested - Status: ${order.status}`,
          refundType,
          customRefundAmount,
          processedBy: undefined,
          createdAt: new Date(order.createdAt).toISOString(),
          updatedAt: new Date(order.updatedAt).toISOString(),
        } as Task);
      }
    }

    // Calculate statistics
    const cancelTasks = tasks.filter(t => t.type === 'cancel');
    const refillTasks = tasks.filter(t => t.type === 'refill');

    const stats = {
      totalCancellations: cancelTasks.length,
      pendingCancellations: cancelTasks.filter(t => t.status === 'pending').length,
      completedCancellations: cancelTasks.filter(t => t.status === 'completed').length,
      refundProcessed: cancelTasks.filter(t => ['completed', 'refunded'].includes(t.status)).length,
      totalRefillRequests: refillTasks.length,
      pendingRefills: refillTasks.filter(t => t.status === 'pending').length,
      completedRefills: refillTasks.filter(t => t.status === 'completed').length,
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
