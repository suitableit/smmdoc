import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '500';
    const search = searchParams.get('search') || '';

    // Handle "all" option for limit - allow unlimited like smmgen.com for better UX
    const isShowAll = limitParam === 'all';
    const limit = isShowAll ? undefined : parseInt(limitParam);
    const skip = isShowAll ? undefined : (page - 1) * limit!;
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
        ...(isShowAll ? {} : { skip, take: limit }),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          serviceType: true,
        },
      }),
      db.service.count({ where: whereClause }),
    ]);

    return NextResponse.json(
      {
        data: services || [],
        total,
        page,
        totalPages: isShowAll ? 1 : Math.ceil(total / limit),
        isShowAll,
        limit: limitParam,
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

    // Helper function to convert string to integer for IDs
    const toInt = (value: unknown): number | undefined => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = parseInt(value);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    // Prepare create data - only include fields that are provided and valid
    const createData: any = {
      name: name || '',
      description: description || '',
      rate: toNumber(rate, 0),
      min_order: toNumber(min_order, 0),
      max_order: toNumber(max_order, 0),
      perqty: toNumber(perqty, 1000),
      avg_time: avg_time || '',
      updateText: updateText || '',
      refill: toBool(refill),
      cancel: toBool(cancel),
      refillDays: toNumber(refillDays, 30),
      refillDisplay: toNumber(refillDisplay, 24),
      personalizedService: toBool(personalizedService),
      serviceSpeed: serviceSpeed || 'medium',
      mode: mode || 'manual',
      userId: session.user.id,
    };

    // Add categoryId if provided and valid
    const categoryIdInt = toInt(categoryId);
    if (categoryIdInt !== undefined) {
      createData.categoryId = categoryIdInt;
    }

    // Add serviceTypeId if provided and valid
    const serviceTypeIdInt = toInt(serviceTypeId);
    if (serviceTypeIdInt !== undefined) {
      createData.serviceTypeId = serviceTypeIdInt;
    }

    // Create the service in the database with proper type conversion
    const newService = await db.service.create({
      data: createData,
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
