/* eslint-disable @typescript-eslint/no-unused-vars */

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const favoriteCategories = await db.favrouteCat.findMany({
      include: {
        services: true,
      },
    });
    return NextResponse.json({ data: favoriteCategories });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorite categories' },
      { status: 500 }
    );
  }
}
