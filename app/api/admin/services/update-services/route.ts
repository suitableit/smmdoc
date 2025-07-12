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
    if (!id) {
      return NextResponse.json({
        error: 'Service ID is required',
        data: null,
        success: false,
      });
    }
    // Helper function to convert string boolean to actual boolean
    const toBool = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    };

    // Helper function to convert string number to actual number
    const toNumber = (value: unknown, defaultValue: number = 0): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
      }
      return defaultValue;
    };

    // Update the service in the database with proper type conversion
    await db.service.update({
      where: {
        id: id,
      },
      data: {
        categoryId: categoryId || '',
        name: name || '',
        description: description || '',
        rate: toNumber(rate, 0),
        min_order: toNumber(min_order, 0),
        max_order: toNumber(max_order, 0),
        perqty: toNumber(perqty, 1000),
        avg_time: avg_time || '',
        updateText: updateText || '',
        serviceTypeId: serviceTypeId || null,
        refill: toBool(refill),
        cancel: toBool(cancel),
        refillDays: toNumber(refillDays, 30),
        refillDisplay: toNumber(refillDisplay, 24),
        personalizedService: toBool(personalizedService),
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
