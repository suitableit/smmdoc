import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string   }> }
) {
  try {
    const session = await auth();
    
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

    const { id  } = await params;
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

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { 
          error: 'Please provide a detailed reason (minimum 10 characters)',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    const order = await db.newOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            cancel: true,
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

    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { 
          error: 'You can only request cancellation for your own orders',
          success: false,
          data: null 
        },
        { status: 403 }
      );
    }

    if (!order.service.cancel) {
      return NextResponse.json(
        { 
          error: 'This service does not support cancellation',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    if (!['pending', 'processing', 'in_progress'].includes(order.status)) {
      return NextResponse.json(
        { 
          error: 'Only pending or processing orders can be cancelled',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    const orderDate = new Date(order.createdAt);
    const currentDate = new Date();
    const hoursDifference = Math.floor((currentDate.getTime() - orderDate.getTime()) / (1000 * 3600));

    if (hoursDifference > 24) {
      return NextResponse.json(
        { 
          error: 'Cancellation period has expired. Orders can only be cancelled within 24 hours of placement.',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    const existingRequest = await db.cancelRequest.findFirst({
      where: {
        orderId: parseInt(id),
        status: 'pending'
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { 
          error: 'A cancellation request for this order is already pending',
          success: false,
          data: null 
        },
        { status: 400 }
      );
    }

    const refundAmount = order.price;

    const cancelRequest = await db.cancelRequest.create({
      data: {
        orderId: parseInt(id),
        userId: session.user.id,
        reason: reason.trim(),
        status: 'pending',
        refundAmount: refundAmount,
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        cancelRequest,
        estimatedRefund: refundAmount,
        message: 'Cancellation request submitted successfully. Our team will review it within 24 hours.'
      },
      error: null
    });

  } catch (error) {
    console.error('Error creating cancel request:', error);
    return NextResponse.json(
      {
        error: 'Failed to create cancel request: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
