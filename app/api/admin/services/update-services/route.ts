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

    // Helper function to convert string to integer for IDs
    const toInt = (value: unknown): number | undefined => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = parseInt(value);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Prepare update data - only include fields that are provided
    const updateData: any = {};

    if (categoryId !== undefined && categoryId !== null && categoryId !== '') {
      updateData.categoryId = toInt(categoryId);
    }
    if (name !== undefined && name !== null && name !== '') {
      updateData.name = name;
    }
    if (description !== undefined && description !== null && description !== '') {
      updateData.description = description;
    }
    if (rate !== undefined && rate !== null && rate !== '') {
      updateData.rate = toNumber(rate, 0);
    }
    if (min_order !== undefined && min_order !== null && min_order !== '') {
      updateData.min_order = toNumber(min_order, 0);
    }
    if (max_order !== undefined && max_order !== null && max_order !== '') {
      updateData.max_order = toNumber(max_order, 0);
    }
    if (perqty !== undefined && perqty !== null && perqty !== '') {
      updateData.perqty = toNumber(perqty, 1000);
    }
    if (avg_time !== undefined && avg_time !== null && avg_time !== '') {
      updateData.avg_time = avg_time;
    }
    if (updateText !== undefined && updateText !== null && updateText !== '') {
      updateData.updateText = updateText;
    }
    if (serviceTypeId !== undefined && serviceTypeId !== null && serviceTypeId !== '') {
      updateData.serviceTypeId = toInt(serviceTypeId);
    }
    if (refill !== undefined && refill !== null) {
      updateData.refill = toBool(refill);
    }
    if (cancel !== undefined && cancel !== null) {
      updateData.cancel = toBool(cancel);
    }
    if (refillDays !== undefined && refillDays !== null && refillDays !== '') {
      updateData.refillDays = toNumber(refillDays, 30);
    }
    if (refillDisplay !== undefined && refillDisplay !== null && refillDisplay !== '') {
      updateData.refillDisplay = toNumber(refillDisplay, 24);
    }
    if (personalizedService !== undefined && personalizedService !== null) {
      updateData.personalizedService = toBool(personalizedService);
    }
    if (serviceSpeed !== undefined && serviceSpeed !== null && serviceSpeed !== '') {
      updateData.serviceSpeed = serviceSpeed;
    }
    if (mode !== undefined && mode !== null && mode !== '') {
      updateData.mode = mode;
    }

    // Update the service in the database with proper type conversion
    await db.service.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
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
        id: parseInt(id),
      },
      include: {
        category: true,
        serviceType: true,
      },
    });

    if (!result) {
      return NextResponse.json({
        error: 'Service not found',
        data: null,
        success: false,
      });
    }

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
        error: 'Failed to fetch service: ' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
