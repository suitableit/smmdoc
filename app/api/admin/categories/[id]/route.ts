import { currentUser } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    const { id } = await params;
    const body = await request.json();
    const { category_name, position, hideCategory } = body;

    if (!id || !category_name) {
      return NextResponse.json({
        error: 'Category ID and name are required',
        data: null,
        success: false,
      });
    }
    
    // Handle position logic - only for the current user's categories
    if (position === 'top') {
      // If position is 'top', update all existing 'top' categories to 'bottom'
      // but exclude the current category being updated
      await db.category.updateMany({
        where: {
          position: 'top',
          userId: user?.id ?? '',
          id: {
            not: id,
          },
        },
        data: {
          position: 'bottom',
        },
      });
    }

    // Prepare update data
    let updateData: any = {
      category_name: category_name,
    };

    // Add position if provided
    if (position) {
      updateData.position = position;
    }

    // Add hideCategory if provided
    if (hideCategory !== undefined) {
      updateData.hideCategory = hideCategory;
    }

    // Update the category in the database
    await db.category.update({
      where: {
        id: id,
      },
      data: updateData,
    });
    
    return NextResponse.json({
      error: null,
      message: 'Category updated successfully',
      data: null,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update category: ' + error,
      data: null,
      success: false,
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({
        error: 'Category ID is required',
        data: null,
        success: false,
      });
    }
    
    const result = await db.category.findUnique({
      where: {
        id: id,
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
        error: 'Failed to fetch category: ' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
