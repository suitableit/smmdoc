import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    // Base where clause - only return active services
    const whereClause = {
      status: 'active', // Only return active services
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {})
    };

    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
        },
      }),
      db.service.count({ where: whereClause }),
    ]);
    
    return NextResponse.json(
      {
        data: services || [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in services API:", error);
    // Return empty data array instead of error to avoid crashing the client
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        message: 'Error fetching services',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}
