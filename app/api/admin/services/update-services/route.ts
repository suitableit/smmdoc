import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const body = await request.json();
    if (!body) {
      return NextResponse.json({
        error: 'Service data is required',
        data: null,
        success: false,
      });
    }
    const {
      categoryId,
      name,
      description,
      rate,
      min_order,
      max_order,
      avg_time,
      updateText,
    } = body;
    if (!id || !categoryId) {
      return NextResponse.json({
        error: 'Service & Category ID and name are required',
        data: null,
        success: false,
      });
    }
    // Update the category in the database
    await db.service.update({
      where: {
        id: id,
      },
      data: {
        categoryId: categoryId,
        name: name,
        description: description,
        rate: Number(rate),
        min_order: Number(min_order),
        max_order: Number(max_order),
        avg_time: avg_time,
        updateText: updateText,
      },
    });
    return NextResponse.json({
      error: null,
      message: 'Service updated successfully',
      data: null,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update services' + error,
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
        error: 'Service ID is required',
        data: null,
        success: false,
      });
    }
    const result = await db.service.findUnique({
      where: {
        id: id,
      },
      include: {
        category: true,
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
