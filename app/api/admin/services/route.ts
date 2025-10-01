import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null,
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit') || '10';
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // Add filter parameter
    const limit = parseInt(limitParam);

    // Determine deletedAt filter based on filter parameter
    let deletedAtFilter;
    if (filter === 'trash') {
      deletedAtFilter = { not: null }; // Show only soft-deleted services
    } else if (filter === 'all_with_trash') {
      deletedAtFilter = undefined; // Show all services including trash
    } else {
      deletedAtFilter = null; // Show only non-deleted services
    }

    // If limit is high (>=500), return all services (for bulk modify or "All" view)
    if (limit >= 500) {
      const whereClause: Record<string, unknown> = {
      ...(deletedAtFilter !== undefined && { deletedAt: deletedAtFilter }), // Use dynamic filter based on request
      ...(search && search.trim()
        ? {
            OR: [
              // Search by service name
              {
                name: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              // Search by service description
              {
                description: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              // Search by service ID (if search term is a number)
              ...(isNaN(Number(search.trim())) ? [] : [{
                id: {
                  equals: Number(search.trim()),
                },
              }]),
              // Search by category ID (if search term is a number)
              ...(isNaN(Number(search.trim())) ? [] : [{
                categoryId: {
                  equals: Number(search.trim()),
                },
              }]),
              // Search by category name
              {
                category: {
                  category_name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {})
      };

      // Get all services
      const services = await db.service.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          category: true,
          serviceType: true,
        },
      });

      // Get all categories (including empty ones) for "All" view
      const allCategories = await db.category.findMany({
        where: {
          hideCategory: 'no', // Only show categories that are not hidden
        },
        orderBy: [
          { id: 'asc' }, // Order by ID first (1, 2, 3...)
          { position: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      return NextResponse.json(
        {
          data: services || [],
          total: services.length,
          page: 1,
          limit: services.length,
          totalPages: 1,
          totalCategories: allCategories.length,
          allCategories: allCategories, // Include all categories (including empty ones)
          hasNext: false,
          hasPrev: false,
          success: true,
        },
        { status: 200 }
      );
    }

    // Categories pagination - limit categories, not services (for regular pagination)
    const categoryLimit = limit;
    const categorySkip = (page - 1) * categoryLimit;
    // First get paginated categories
    const [paginatedCategories, totalCategories] = await Promise.all([
      db.category.findMany({
        skip: categorySkip,
        take: categoryLimit,
        orderBy: [
          { id: 'asc' }, // Order by ID first (1, 2, 3...)
          { position: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      db.category.count(),
    ]);

    // Get all services for the paginated categories
    const categoryIds = paginatedCategories.map(cat => cat.id);

    const whereClause: Record<string, unknown> = {
      ...(deletedAtFilter !== undefined && { deletedAt: deletedAtFilter }), // Use dynamic filter based on request
      categoryId: {
        in: categoryIds,
      },
      ...(search && search.trim()
        ? {
            OR: [
              // Search by service name
              {
                name: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              // Search by service description
              {
                description: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              // Search by service ID (if search term is a number)
              ...(isNaN(Number(search.trim())) ? [] : [{
                id: {
                  equals: Number(search.trim()),
                },
              }]),
              // Search by category ID (if search term is a number)
              ...(isNaN(Number(search.trim())) ? [] : [{
                categoryId: {
                  equals: Number(search.trim()),
                },
              }]),
              // Search by category name
              {
                category: {
                  category_name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
              // Search by provider
              {
                provider: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {})
    };

    const services = await db.service.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        serviceType: true,
      },
    });

    return NextResponse.json(
      {
        data: services || [],
        total: services.length, // Total services in current page
        page,
        totalPages: Math.ceil(totalCategories / categoryLimit),
        totalCategories,
        limit: limitParam,
        allCategories: paginatedCategories || [], // Include paginated categories
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
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
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

    // Add serviceTypeId if provided and valid, otherwise use Default service type
    const serviceTypeIdInt = toInt(serviceTypeId);
    if (serviceTypeIdInt !== undefined) {
      createData.serviceTypeId = serviceTypeIdInt;
    } else {
      // If no service type is specified, assign the Default service type
      const defaultServiceType = await db.servicetype.findFirst({
        where: { name: 'Default' }
      });
      
      if (defaultServiceType) {
        createData.serviceTypeId = defaultServiceType.id;
      }
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
