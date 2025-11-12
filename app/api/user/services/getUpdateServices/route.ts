import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check module settings for services list access control
    const moduleSettings = await db.moduleSettings.findFirst();
    const servicesListPublic = moduleSettings?.servicesListPublic ?? true;

    // If services list is private, require authentication
    if (!servicesListPublic) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required to access services list' },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    const whereClause = {
      // Only return active services
      status: 'active',
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
        : {}),
      // only fetch services with updateText
      updateText: {
        not: null,
      },
    };
    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
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
