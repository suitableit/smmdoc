import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          data: null,
          success: false,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fromCategoryId, toCategoryId } = body;

    if (!fromCategoryId || !toCategoryId) {
      return NextResponse.json(
        {
          error: 'Both fromCategoryId and toCategoryId are required',
          data: null,
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if both categories exist
    const [fromCategory, toCategory] = await Promise.all([
      db.category.findUnique({ where: { id: fromCategoryId } }),
      db.category.findUnique({ where: { id: toCategoryId } })
    ]);

    if (!fromCategory) {
      return NextResponse.json(
        {
          error: 'Source category not found',
          data: null,
          success: false,
        },
        { status: 404 }
      );
    }

    if (!toCategory) {
      return NextResponse.json(
        {
          error: 'Target category not found',
          data: null,
          success: false,
        },
        { status: 404 }
      );
    }

    // Move all services from source category to target category
    const updateResult = await db.service.updateMany({
      where: { categoryId: fromCategoryId },
      data: { categoryId: toCategoryId }
    });

    return NextResponse.json(
      {
        error: null,
        message: `Successfully moved ${updateResult.count} service(s) to ${toCategory.category_name}`,
        data: { movedCount: updateResult.count },
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error moving services:', error);
    return NextResponse.json(
      {
        error: 'Failed to move services: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
