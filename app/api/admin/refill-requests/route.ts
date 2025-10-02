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
    const whereClause: any = {};

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

    // Get refill requests with pagination - safe approach without relations
    let refillRequests: any[] = [];

    try {
      refillRequests = await db.refillRequest.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      });

      // Manually fetch related data to avoid relation errors
      for (const request of refillRequests) {
        // Fetch order data with service information
        if (request.orderId) {
          try {
            const order = await db.newOrder.findUnique({
              where: { id: request.orderId },
              select: {
                id: true,
                qty: true,
                price: true,
                usdPrice: true,
                bdtPrice: true,
                link: true,
                status: true,
                createdAt: true,
                serviceId: true,
              }
            });

            // Fetch service data for the order
            if (order && order.serviceId) {
              try {
                const service = await db.service.findUnique({
                  where: { id: order.serviceId },
                  select: {
                    id: true,
                    name: true,
                    rate: true,
                    refill: true,
                  }
                });
                (order as any).service = service;
              } catch (error) {
                console.warn(`Service not found for order ${order.id}`);
                (order as any).service = null;
              }
            }

            (request as any).order = order;
          } catch (error) {
            console.warn(`Order not found for refill request ${request.id}`);
            (request as any).order = null;
          }
        }

        // Fetch user data
        if (request.userId) {
          try {
            const user = await db.user.findUnique({
              where: { id: request.userId },
              select: {
                id: true,
                name: true,
                email: true,
                currency: true,
              }
            });
            (request as any).user = user;
          } catch (error) {
            console.warn(`User not found for refill request ${request.id}`);
            (request as any).user = null;
          }
        }

        // Fetch processed by user data
        if (request.processedBy) {
          try {
            const processedByUser = await db.user.findUnique({
              where: { id: request.processedBy },
              select: {
                id: true,
                name: true,
                email: true,
              }
            });
            (request as any).processedByUser = processedByUser;
          } catch (error) {
            console.warn(`Processed by user not found for refill request ${request.id}`);
            (request as any).processedByUser = null;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching refill requests:', error);
      refillRequests = [];
    }

    // Remove duplicates based on order ID to prevent React key conflicts
    const uniqueRefillRequests = refillRequests.filter((request, index, self) =>
      index === self.findIndex(r => r.orderId === request.orderId)
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalRequests / limit);

    return NextResponse.json({
      success: true,
      data: uniqueRefillRequests,
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
