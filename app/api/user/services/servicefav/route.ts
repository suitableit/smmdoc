// app/api/user/services/servicefav/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { serviceId, userId, action } = await req.json();

    if (!serviceId || !userId) {
      return NextResponse.json(
        { error: 'Service ID and User ID are required' },
        { status: 400 }
      );
    }

    // Find the user's Favorites category
    const favoritesCategory = await db.favrouteCat.findFirst({
      where: {
        userId,
        name: 'Favorites',
      },
      include: {
        services: {
          where: {
            id: serviceId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!favoritesCategory) {
      // If the category doesn't exist, create it
      const newCategory = await db.favrouteCat.create({
        data: {
          userId,
          name: 'Favorites',
          services: {
            connect: { id: serviceId },
          },
        },
      });
      return NextResponse.json(
        {
          message: 'Created favorites category and added service',
          isFavorite: true,
          newCategoryId: newCategory.id,
        },
        { status: 201 }
      );
    }

    if (action === 'add') {
      // Check if already favorited
      const isAlreadyFavorited = favoritesCategory.services.some(
        (service) => service.id === serviceId
      );

      if (isAlreadyFavorited) {
        return NextResponse.json(
          { message: 'Already in favorites', isFavorite: true },
          { status: 200 }
        );
      }

      // Add to favorites
      await db.favrouteCat.update({
        where: { id: favoritesCategory.id },
        data: {
          services: {
            connect: { id: serviceId },
          },
        },
      });

      return NextResponse.json(
        { message: 'Added to favorites', isFavorite: true },
        { status: 200 }
      );
    } else if (action === 'remove') {
      // Remove from favorites
      await db.favrouteCat.update({
        where: { id: favoritesCategory.id },
        data: {
          services: {
            disconnect: { id: serviceId },
          },
        },
      });

      return NextResponse.json(
        { message: 'Removed from favorites', isFavorite: false },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing favorite:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
