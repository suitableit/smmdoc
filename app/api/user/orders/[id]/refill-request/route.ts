import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/user/orders/:id/refill-request - Customer refill request
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Please login.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { reason } = body;

    if (!id) {
      return NextResponse.json(
        { 
          error: 'Order ID is required',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Find the order and verify ownership
    const order = await db.newOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            refill: true,
            refillDays: true,
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { 
          error: 'Order not found',
          success: false,
          data: null 
        },
        { status: 404 }
      );
    }

    // Verify order ownership
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'You can only request refill for your own orders',
          success: false,
          data: null 
        },
        { status: 403 }
      );
    }

    // Check if service supports refill
    if (!order.service.refill) {
      return NextResponse.json(
        { 
          error: 'This service does not support refill',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Check if order is eligible for refill (completed or partial)
    if (!['completed', 'partial'].includes(order.status)) {
      return NextResponse.json(
        { 
          error: 'Only completed or partial orders are eligible for refill',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Check refill time limit
    const refillDays = order.service.refillDays || 30;
    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const daysDifference = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 3600 * 24));

    if (daysDifference > refillDays) {
      return NextResponse.json(
        { 
          error: `Refill period has expired. Refill is only available for ${refillDays} days after order completion.`,
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Check if refill request already exists
    const existingRequest = await db.refillRequest.findFirst({
      where: {
        orderId: parseInt(id),
        status: 'pending'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { 
          error: 'A refill request for this order is already pending',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    // Create refill request
    const refillRequest = await db.refillRequest.create({
      data: {
        orderId: parseInt(id),
        userId: session.user.id,
        reason: reason || 'Customer requested refill due to drop in count',
        status: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        refillRequest,
        message: 'Refill request submitted successfully. Our team will review it within 24 hours.'
      },
      error: null
    });

  } catch (error) {
    console.error('Error creating refill request:', error);
    return NextResponse.json(
      {
        error: 'Failed to create refill request: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
