import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    const { category_name, position, hideCategory } = body;
    if (!id || !category_name) {
      return NextResponse.json({
        error: 'Category ID and name are required',
        data: null,
        success: false,
      });
    }

    // Prepare update data
    const updateData: {
      category_name: string;
      position?: 'top' | 'bottom';
      hideCategory?: 'yes' | 'no';
    } = {
      category_name: category_name,
    };

    // Add position if provided
    if (position && (position === 'top' || position === 'bottom')) {
      updateData.position = position as 'top' | 'bottom';
    }

    // Add hideCategory if provided
    if (hideCategory !== undefined && (hideCategory === 'yes' || hideCategory === 'no')) {
      updateData.hideCategory = hideCategory as 'yes' | 'no';
    }

    // Update the category in the database
    await db.category.update({
      where: {
        id: Number(id),
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
      error: 'Failed to update categories' + error,
      data: null,
      success: false,
    });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({
        error: 'Category ID is required',
        data: null,
        success: false,
      });
    }
    const result = await db.category.findUnique({
      where: {
        id: Number(id),
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
