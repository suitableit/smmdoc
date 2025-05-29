import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';
    
    // Build the where clause
    let whereClause: any = {
      userId: session.user.id,
    };
    
    // Add status filter if provided
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { link: { contains: search } },
        { 
          service: {
            name: { contains: search }
          }
        },
        {
          category: {
            category_name: { contains: search }
          }
        }
      ];
    }

    // Get total count for pagination
    const totalOrders = await db.newOrder.count({
      where: whereClause
    });
    
    // Get orders with pagination
    const orders = await db.newOrder.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            name: true,
            rate: true,
            min_order: true,
            max_order: true,
            perqty: true
          }
        },
        category: {
          select: {
            category_name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return NextResponse.json(
      { 
        success: true, 
        data: orders, 
        pagination: {
          total: totalOrders,
          page,
          limit,
          totalPages: Math.ceil(totalOrders / limit)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching orders', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 