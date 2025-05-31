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

    // Check if the service exists
    const serviceExists = await db.service.findUnique({
      where: { id: serviceId },
    });

    if (!serviceExists) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if the user exists
    const userExists = await db.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if the service is already favorited
    const existingFavorite = await db.favoriteService.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    if (action === 'add') {
      if (existingFavorite) {
        return NextResponse.json(
          { message: 'Already in favorites', isFavorite: true },
          { status: 200 }
        );
      }

      // Add to favorites
      await db.favoriteService.create({
        data: {
          userId,
          serviceId,
        },
      });

      return NextResponse.json(
        { message: 'Added to favorites', isFavorite: true },
        { status: 200 }
      );
    } else if (action === 'remove') {
      if (!existingFavorite) {
        return NextResponse.json(
          { message: 'Not in favorites', isFavorite: false },
          { status: 200 }
        );
      }

      // Remove from favorites
      await db.favoriteService.delete({
        where: {
          userId_serviceId: {
            userId,
            serviceId,
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
