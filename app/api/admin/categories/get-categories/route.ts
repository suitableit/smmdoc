import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const result = await db.category.findMany({
      orderBy: [
        {
          position: 'asc', // 'top' comes before 'bottom'
        },
        {
          createdAt: 'desc', // Within same position, newer first
        },
      ],
      include: {
        user: {
          select: {
            id: true,
            name: true,
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
    return NextResponse.json(
      {
        error: 'Failed to fetch categories' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
