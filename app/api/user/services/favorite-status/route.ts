import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required.' },
      { status: 400 }
    );
  }

  try {
    const favCategories = await db.favrouteCat.findMany({
      where: { userId },
      select: {
        services: {
          select: { id: true },
        },
      },
    });

    const favoriteServiceIds = favCategories
      .flatMap((category) => category.services)
      .map((service) => service.id);

    return NextResponse.json({ favoriteServiceIds });
  } catch (error) {
    console.error('Error fetching favorite service IDs:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
