import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    const whereClause = search
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
      : {};

    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      db.service.count({ where: whereClause }),
    ]);
    return NextResponse.json(
      {
        data: services,
        total,
        page,
        totalPages: Math.ceil(total / limit),
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
