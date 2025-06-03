import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    
    // Base where clause - only return active services
    const whereClause = {
      status: 'active', // Only return active services
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  lte: 'insensitive',
                },
              },
              {
                description: {
                  contains: search,
                  lte: 'insensitive',
                },
              },
            ],
          }
        : {})
    };
    
    const [services] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
    return NextResponse.json(
      {
        data: services,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Error fetching services',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
