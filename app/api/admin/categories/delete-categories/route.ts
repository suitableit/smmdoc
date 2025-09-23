import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    console.log('Delete category request - ID parameter:', id);
    
    if (!id || id.trim() === '') {
      console.log('Category ID is missing or empty');
      return NextResponse.json(
        {
          error: 'Category ID is required',
          data: null,
          success: false,
        },
        { status: 400 }
      );
    }

    // Parse and validate the ID
    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      console.log('Category ID is not a valid number:', id);
      return NextResponse.json(
        {
          error: 'Category ID must be a valid number',
          data: null,
          success: false,
        },
        { status: 400 }
      );
    }

    console.log('Parsed category ID:', categoryId);

    // Get category before deletion for response
    const category = await db.category.findUnique({
      where: {
        id: categoryId,
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
      console.log('Category not found with ID:', categoryId);
      return NextResponse.json(
        {
          error: 'Category not found',
          data: null,
          success: false,
        },
        { status: 404 }
      );
    }

    console.log('Found category to delete:', category.category_name);

    // Delete the category
    await db.category.delete({
      where: {
        id: categoryId,
      },
    });

    console.log('Category deleted successfully:', category.category_name);

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
