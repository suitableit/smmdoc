import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== 'admin' && session.user.role !== 'moderator')) {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin or Moderator privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    console.log('Admin cancel requests API called');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';

    console.log('Query params:', { page, limit, status, search });

    const whereCondition: any = {};

    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    if (search) {
      const searchNumber = parseInt(search);
      whereCondition.OR = [
        ...(isNaN(searchNumber) ? [] : [{
          order: { id: searchNumber }
        }]),
        {
          user: {
            email: { contains: search, mode: 'insensitive' }
          }
        },
        {
          user: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    console.log('Prisma where condition:', JSON.stringify(whereCondition, null, 2));

    // First, get cancel requests without relations to avoid Prisma errors
    const cancelRequestsResult = await db.cancelRequests.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Then fetch relations separately for each request to handle missing relations gracefully
    const cancelRequestsWithRelations = await Promise.all(
      cancelRequestsResult.map(async (request) => {
        try {
          const [order, user] = await Promise.all([
            db.newOrders.findUnique({
              where: { id: request.orderId },
              include: {
                service: true,
                category: true
              }
            }).catch((err) => {
              console.error(`Error loading order ${request.orderId} for cancel request ${request.id}:`, err);
              return null;
            }),
            db.users.findUnique({
              where: { id: request.userId }
            }).catch((err) => {
              console.error(`Error loading user ${request.userId} for cancel request ${request.id}:`, err);
              return null;
            })
          ]);

          // Check if order has required relations
          if (order && (!order.service || !order.category)) {
            console.warn(`Order ${order.id} is missing service or category relation for cancel request ${request.id}`);
          }

          return {
            ...request,
            order,
            user
          };
        } catch (error) {
          console.error(`Error loading relations for cancel request ${request.id}:`, error);
          return {
            ...request,
            order: null,
            user: null
          };
        }
      })
    );

    console.log(`Found ${cancelRequestsWithRelations.length} cancel requests from database`);
    
    // Log details about each request to debug
    if (cancelRequestsWithRelations.length > 0) {
      cancelRequestsWithRelations.forEach((req, index) => {
        console.log(`Request ${index + 1}:`, {
          id: req.id,
          orderId: req.orderId,
          userId: req.userId,
          status: req.status,
          hasOrder: !!req.order,
          hasUser: !!req.user,
          orderIdFromRelation: req.order?.id,
          userIdFromRelation: req.user?.id,
          createdAt: req.createdAt
        });
      });
    } else {
      // If no results, let's check if there are any cancel requests at all
      const totalAllRequests = await db.cancelRequests.count({});
      console.log(`Total cancel requests in database (no filters): ${totalAllRequests}`);
      
      if (totalAllRequests > 0) {
        // Get a sample of all requests to see what's in the DB
        const sampleRequests = await db.cancelRequests.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderId: true,
            userId: true,
            status: true,
            createdAt: true
          }
        });
        console.log('Sample of all cancel requests in DB:', sampleRequests);
      }
    }

    const total = await db.cancelRequests.count({
      where: whereCondition
    });

    console.log(`Total cancel requests matching criteria: ${total}`);

    // Check for requests with missing relations
    const requestsWithMissingRelations = cancelRequestsWithRelations.filter(
      (request) => !request.order || !request.user
    );
    
    if (requestsWithMissingRelations.length > 0) {
      console.warn(`Warning: ${requestsWithMissingRelations.length} requests have missing relations:`, 
        requestsWithMissingRelations.map(r => ({ id: r.id, orderId: r.orderId, userId: r.userId }))
      );
    }

    const transformedRequests = cancelRequestsWithRelations
      .filter((request) => {
        if (!request.order) {
          console.error(`Request ${request.id} has no order relation (orderId: ${request.orderId})`);
          return false;
        }
        if (!request.user) {
          console.error(`Request ${request.id} has no user relation (userId: ${request.userId})`);
          return false;
        }
        return true;
      })
      .map((request) => ({
      id: request.id,
      order: {
        id: request.order.id,
        service: {
          id: request.order.service.id,
          name: request.order.service.name,
          rate: Number(request.order.service.rate)
        },
        category: {
          id: request.order.category.id,
          category_name: request.order.category.category_name
        },
        qty: Number(request.order.qty),
        price: Number(request.order.price),
        charge: Number(request.order.charge || request.order.price),
        link: request.order.link,
        status: request.order.status,
        createdAt: request.order.createdAt.toISOString(),
        seller: 'Self'
      },
      user: {
        id: request.user.id,
        email: request.user.email,
        name: request.user.name || request.user.email,
        username: request.user.email?.split('@')[0],
        currency: request.user.currency || 'USD'
      },
      reason: request.reason,
      status: request.status,
      requestedAt: request.createdAt.toISOString(),
      processedAt: request.processedAt?.toISOString(),
      processedBy: request.processedBy,
      refundAmount: Number(request.refundAmount || request.order.price),
      adminNotes: request.adminNotes
    }));

    if (transformedRequests.length > 0) {
      console.log('Transformed requests sample:', JSON.stringify(transformedRequests[0], null, 2));
    } else {
      console.log('No cancel requests found after transformation');
    }

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log(`Returning ${transformedRequests.length} transformed cancel requests, total in DB: ${total}`);

    return NextResponse.json({
      success: true,
      data: transformedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching cancel requests:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch cancel requests: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    );
  }
}
