import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.category.findMany({
      orderBy: [
        {
          position: 'asc', // 'top' comes before 'bottom' (top = 0, bottom = 1 in enum order)
        },
        {
          updatedAt: 'desc', // Within same position, most recently updated first
        },
        {
          createdAt: 'desc', // Then by creation date
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        error: null,
        data: result,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch categories: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
