import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/refill-requests - Get all refill requests
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // Build where clause
    let whereClause: any = {};

    if (status !== 'all') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { orderId: { equals: parseInt(search) || 0 } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalRequests = await db.refillRequest.count({
      where: whereClause,
    });

    // Get refill requests with pagination
    const refillRequests = await db.refillRequest.findMany({
      where: whereClause,
      include: {
        order: {
          select: {
            id: true,
            qty: true,
            price: true,
            usdPrice: true,
            bdtPrice: true,
            link: true,
            status: true,
            createdAt: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            currency: true,
          }
        },
        processedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Calculate pagination info
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
        error: 'Failed to fetch refill requests: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/refill-requests - Create refill request (for admin)
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        {
          error: 'Order ID is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Find the order
    const order = await db.newOrder.findUnique({
      where: { id: parseInt(orderId) },
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

    // Create refill request
    const refillRequest = await db.refillRequest.create({
      data: {
        orderId: parseInt(orderId),
        userId: order.userId,
        reason: reason || 'Admin created refill request',
        status: 'pending',
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        refillRequest,
        message: 'Refill request created successfully'
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
