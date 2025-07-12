import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/user/refill-requests - Create a new refill request
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Please login.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId || !reason) {
      return NextResponse.json(
        {
          error: 'Order ID and reason are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Get the order and verify it belongs to the user
    const order = await db.newOrder.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            refill: true,
            refillDays: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Verify order belongs to the user
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

    // Check if order is completed
    if (order.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Only completed orders can be refilled',
          success: false,
          data: null
        },
        { status: 400 }
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

    // Check if refill request already exists for this order
    const existingRequest = await db.refillRequest.findFirst({
      where: {
        orderId: parseInt(orderId),
        status: {
          in: ['pending', 'approved']
        }
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: 'A refill request already exists for this order',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check refill time limit (if refillDays is set)
    if (order.service.refillDays) {
      const daysSinceCompletion = Math.floor(
        (new Date().getTime() - new Date(order.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceCompletion > order.service.refillDays) {
        return NextResponse.json(
          {
            error: `Refill requests must be made within ${order.service.refillDays} days of order completion`,
            success: false,
            data: null
          },
          { status: 400 }
        );
      }
    }

    // Create refill request
    const refillRequest = await db.refillRequest.create({
      data: {
        orderId: parseInt(orderId),
        userId: session.user.id,
        reason: reason.trim(),
        status: 'pending'
      },
      include: {
        order: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: refillRequest,
      message: 'Refill request submitted successfully',
      error: null
    });

  } catch (error) {
    console.error('Error creating refill request:', error);
    return NextResponse.json(
      {
        error: 'Failed to create refill request',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// GET /api/user/refill-requests - Get user's refill requests
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Please login.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';

    // Build where clause
    const whereClause: any = {
      userId: session.user.id
    };

    if (status !== 'all') {
      whereClause.status = status;
    }

    // Get total count
    const totalRequests = await db.refillRequest.count({
      where: whereClause
    });

    // Get refill requests
    const refillRequests = await db.refillRequest.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            service: {
              select: {
                id: true,
                name: true
              }
            },
            category: {
              select: {
                id: true,
                category_name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate pagination
    const totalPages = Math.ceil(totalRequests / limit);

    return NextResponse.json({
      success: true,
      data: refillRequests,
      pagination: {
        total: totalRequests,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching refill requests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch refill requests',
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
