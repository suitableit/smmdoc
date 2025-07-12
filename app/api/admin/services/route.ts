import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    const whereClause = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const [services, total] = await Promise.all([
      db.service.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
        },
      }),
      db.service.count({ where: whereClause }),
    ]);
    
    return NextResponse.json(
      {
        data: services || [],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in services API:", error);
    // Return empty data array instead of error to avoid crashing the client
    return NextResponse.json(
      {
        data: [],
        total: 0,
        page: 1,
        totalPages: 1,
        message: 'Error fetching services',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          data: null,
          success: false,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    if (!body) {
      return NextResponse.json(
        {
          error: 'Service data is required',
          data: null,
          success: false,
        },
        { status: 400 }
      );
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

    // Allow empty fields for service creation

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

    // Create the service in the database with proper type conversion
    const newService = await db.service.create({
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
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        error: null,
        message: 'Service created successfully',
        data: newService,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      {
        error: 'Failed to create service: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
