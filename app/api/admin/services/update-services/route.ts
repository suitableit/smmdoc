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
      perqty,
      avg_time,
      updateText,
      serviceTypeId,
      refill,
      cancel,
      refillDays,
      refillDisplay,
      personalizedService,
      serviceSpeed,
      mode,
    } = body;
    if (!id || !categoryId) {
      return NextResponse.json({
        error: 'Service & Category ID and name are required',
        data: null,
        success: false,
      });
    }
    // Update the service in the database
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
        perqty: Number(perqty),
        avg_time: avg_time,
        updateText: updateText,
        serviceTypeId: serviceTypeId || null,
        refill: refill || false,
        cancel: cancel || false,
        refillDays: refillDays || 30,
        refillDisplay: refillDisplay || 24,
        personalizedService: personalizedService || false,
        serviceSpeed: serviceSpeed || 'medium',
        mode: mode || 'manual',
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
