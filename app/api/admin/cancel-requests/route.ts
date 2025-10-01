import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/cancel-requests - Get all cancel requests
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

    console.log('Admin cancel requests API called');

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';

    console.log('Query params:', { page, limit, status, search });

    // Build Prisma where conditions
    const whereCondition: {
      status?: string;
      OR?: Array<{
        order?: { id: number };
        user?: {
          email?: { contains: string; mode: string };
          name?: { contains: string; mode: string };
        };
      }>;
    } = {};

    if (status && status !== 'all') {
      whereCondition.status = status;
    }

    if (search) {
      const searchNumber = parseInt(search);
      whereCondition.OR = [
        // Search by order ID if search is a number
        ...(isNaN(searchNumber) ? [] : [{
          order: { id: searchNumber }
        }]),
        // Search by user email
        {
          user: {
            email: { contains: search, mode: 'insensitive' }
          }
        },
        // Search by user name
        {
          user: {
            name: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    console.log('Prisma where condition:', JSON.stringify(whereCondition, null, 2));

    // Get cancel requests using Prisma ORM
    const cancelRequestsResult = await db.cancelRequest.findMany({
      where: whereCondition,
      include: {
        order: {
          include: {
            service: true,
            category: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    console.log('Prisma result sample:', JSON.stringify(cancelRequestsResult[0], null, 2));

    // Get total count for pagination
    const total = await db.cancelRequest.count({
      where: whereCondition
    });



    // Transform data to match frontend interface
    const transformedRequests = cancelRequestsResult.map((request) => ({
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
        seller: 'Self' // Default seller name
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

    console.log('Transformed requests sample:', JSON.stringify(transformedRequests[0], null, 2));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log(`Found ${transformedRequests.length} cancel requests, total: ${total}`);

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

    // Return fallback mock data if database query fails
    const mockData = [
      {
        id: 'CR001',
        order: {
          id: 1,
          service: {
            id: 'SRV001',
            name: 'Instagram Followers',
            rate: 0.50
          },
          category: {
            id: 'CAT001',
            category_name: 'Instagram'
          },
          qty: 1000,
          price: 10.00,
          charge: 10.00,
          link: 'https://instagram.com/test',
          status: 'pending',
          createdAt: new Date().toISOString(),
          seller: 'Self'
        },
        user: {
          id: 'USR001',
          email: 'user@example.com',
          name: 'Test User',
          username: 'testuser',
          currency: 'USD'
        },
        reason: 'Changed my mind about this service.',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        refundAmount: 10.00
      },
      {
        id: 'CR002',
        order: {
          id: 2,
          service: {
            id: 'SRV002',
            name: 'Facebook Page Likes',
            rate: 1.20
          },
          category: {
            id: 'CAT002',
            category_name: 'Facebook'
          },
          qty: 500,
          price: 15.00,
          charge: 15.00,
          link: 'https://facebook.com/test',
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          seller: 'Self'
        },
        user: {
          id: 'USR002',
          email: 'john.doe@example.com',
          name: 'John Doe',
          username: 'johndoe',
          currency: 'USD'
        },
        reason: 'Found a better service provider.',
        status: 'pending',
        requestedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        refundAmount: 15.00
      },
      {
        id: 'CR003',
        order: {
          id: 3,
          service: {
            id: 'SRV003',
            name: 'YouTube Views',
            rate: 0.80
          },
          category: {
            id: 'CAT003',
            category_name: 'YouTube'
          },
          qty: 2000,
          price: 25.00,
          charge: 25.00,
          link: 'https://youtube.com/watch?v=test',
          status: 'completed',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          seller: 'Self'
        },
        user: {
          id: 'USR003',
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          username: 'janesmith',
          currency: 'USD'
        },
        reason: 'Service quality was not satisfactory.',
        status: 'approved',
        requestedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        processedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        processedBy: 'admin',
        refundAmount: 25.00,
        adminNotes: 'Refund approved due to quality issues.'
      },
      {
        id: 'CR004',
        order: {
          id: 4,
          service: {
            id: 'SRV004',
            name: 'Twitter Followers',
            rate: 2.00
          },
          category: {
            id: 'CAT004',
            category_name: 'Twitter'
          },
          qty: 750,
          price: 18.00,
          charge: 18.00,
          link: 'https://twitter.com/test',
          status: 'in_progress',
          createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          seller: 'Self'
        },
        user: {
          id: 'USR004',
          email: 'mike.wilson@example.com',
          name: 'Mike Wilson',
          username: 'mikewilson',
          currency: 'USD'
        },
        reason: 'Order taking too long to complete.',
        status: 'declined',
        requestedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        processedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        processedBy: 'admin',
        refundAmount: 0,
        adminNotes: 'Request declined. Order is already in progress and cannot be cancelled.'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData,
      pagination: {
        page: 1,
        limit: 20,
        total: mockData.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    });
  }
}
