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
    await db.category.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(
      {
        error: null,
        message: 'Category deleted successfully',
        data: null,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log('Error deleting category', error);
    return NextResponse.json(
      {
        error: 'Failed to delete categories' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
