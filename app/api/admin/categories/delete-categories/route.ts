import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        {
          error: 'Category ID is required',
          data: null,
          success: false,
        },
        { status: 400 }
      );
    }

    // Get category before deletion for response
    const category = await db.category.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: 'Category not found',
          data: null,
          success: false,
        },
        { status: 404 }
      );
    }

    // Delete the category
    await db.category.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json(
      {
        error: null,
        message: 'Category deleted successfully',
        data: category, // Return the deleted category for UI updates
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete category: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
