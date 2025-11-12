import { auth } from '@/auth';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth-helpers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();

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
    const filter = searchParams.get('filter') || 'all';
    const serviceTypeFilter = searchParams.get('serviceType') || '';
    const packageTypeFilter = searchParams.get('packageType') || '';
    const limit = parseInt(limitParam);

    let deletedAtFilter;
    if (filter === 'trash') {
      deletedAtFilter = { not: null };
    } else if (filter === 'all_with_trash') {
      deletedAtFilter = undefined;
    } else {
      deletedAtFilter = null;
    }

    if (limit >= 500) {
      const whereClause = {
        ...(deletedAtFilter !== undefined && { deletedAt: deletedAtFilter }),
        ...(serviceTypeFilter && serviceTypeFilter.trim() && {
          serviceType: {
            name: {
              contains: serviceTypeFilter.trim(),
              mode: 'insensitive',
            },
          },
        }),
        ...(packageTypeFilter && packageTypeFilter.trim() && !isNaN(Number(packageTypeFilter.trim())) && {
          packageType: Number(packageTypeFilter.trim()),
        }),
        ...(search && search.trim()
          ? {
              OR: [
                {
                  name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
                {
                  description: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
                ...(isNaN(Number(search.trim())) ? [] : [{
                  id: {
                    equals: Number(search.trim()),
                  },
                }]),
                ...(isNaN(Number(search.trim())) ? [] : [{
                  categoryId: {
                    equals: Number(search.trim()),
                  },
                }]),
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

      const allCategories = await db.category.findMany({
        where: {
          hideCategory: 'no',
        },
        orderBy: [
          { id: 'asc' },
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
          allCategories: allCategories,
          hasNext: false,
          hasPrev: false,
          success: true,
        },
        { status: 200 }
      );
    }

    const categoryLimit = limit;
    const categorySkip = (page - 1) * categoryLimit;
    const [paginatedCategories, totalCategories] = await Promise.all([
      db.category.findMany({
        skip: categorySkip,
        take: categoryLimit,
        orderBy: [
          { id: 'asc' },
          { position: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      db.category.count(),
    ]);

    const categoryIds = paginatedCategories.map(cat => cat.id);

    const whereClause = {
      ...(deletedAtFilter !== undefined && { deletedAt: deletedAtFilter }),
      categoryId: {
        in: categoryIds,
      },
      ...(serviceTypeFilter && serviceTypeFilter.trim() && {
        serviceType: {
          name: {
            contains: serviceTypeFilter.trim(),
            mode: 'insensitive',
          },
        },
      }),
      ...(packageTypeFilter && packageTypeFilter.trim() && !isNaN(Number(packageTypeFilter.trim())) && {
        packageType: Number(packageTypeFilter.trim()),
      }),
      ...(search && search.trim()
        ? {
            OR: [
              {
                name: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: search.trim(),
                  mode: 'insensitive',
                },
              },
              ...(isNaN(Number(search.trim())) ? [] : [{
                id: {
                  equals: Number(search.trim()),
                },
              }]),
              ...(isNaN(Number(search.trim())) ? [] : [{
                categoryId: {
                  equals: Number(search.trim()),
                },
              }]),
              {
                category: {
                  category_name: {
                    contains: search.trim(),
                    mode: 'insensitive',
                  },
                },
              },
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
        total: services.length,
        page,
        totalPages: Math.ceil(totalCategories / categoryLimit),
        totalCategories,
        limit: limitParam,
        allCategories: paginatedCategories || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in services API:", error);
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
    console.log('POST /api/admin/services - Request received');
    const session = await getCurrentUser();
    console.log('Session:', session ? `${session.user.email} ${session.user.role}` : 'Not found');
    
    if (!session || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt - Session:', session ? 'exists but not admin' : 'not found');
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
    console.log('Request body received:', JSON.stringify(body, null, 2));
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
      serviceSpeed,
      mode,
      orderLink,
      packageType,
      providerServiceId,
      dripfeedEnabled,
      subscriptionMin,
      subscriptionMax,
      subscriptionDelay,
      autoPostsMin,
      autoPostsMax,
      autoDelay,
      customComments,
      isSecret,
    } = body;


    const toBool = (value: unknown): boolean => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
    };

    const toNumber = (value: unknown, defaultValue: number = 0): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = Number(value);
        return isNaN(num) ? defaultValue : num;
      }
      return defaultValue;
    };

    const toInt = (value: unknown): number | undefined => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const num = parseInt(value);
        return isNaN(num) ? undefined : num;
      }
      return undefined;
    };

    const createData: any = {
      name: name || '',
      description: description || '',
      rate: toNumber(rate, 0),
      min_order: toNumber(min_order, 0),
      max_order: toNumber(max_order, 0),
      perqty: toNumber(perqty, 1000),
      avg_time: avg_time || '0-1 hours',
      updateText: updateText || '',
      refill: toBool(refill),
      cancel: toBool(cancel),
      refillDays: toNumber(refillDays, 30),
      refillDisplay: toNumber(refillDisplay, 24),
      serviceSpeed: serviceSpeed || 'medium',
      mode: mode || 'manual',
      orderLink: orderLink || 'link',
      userId: session.user.id,
      packageType: toNumber(packageType, 1),
      providerServiceId: providerServiceId || null,
      dripfeedEnabled: toBool(dripfeedEnabled),
      subscriptionMin: toInt(subscriptionMin) || null,
      subscriptionMax: toInt(subscriptionMax) || null,
      subscriptionDelay: toInt(subscriptionDelay) || null,
      autoPostsMin: toInt(autoPostsMin) || null,
      autoPostsMax: toInt(autoPostsMax) || null,
      autoDelay: toInt(autoDelay) || null,
      customComments: customComments || null,
      isSecret: toBool(isSecret),
    };

    const categoryIdInt = toInt(categoryId);
    if (categoryIdInt !== undefined) {
      createData.categoryId = categoryIdInt;
    }

    const serviceTypeIdInt = toInt(serviceTypeId);
    if (serviceTypeIdInt !== undefined) {
      createData.serviceTypeId = serviceTypeIdInt;
    } else {
      const defaultServiceType = await db.servicetype.findFirst({
        where: { name: 'Default' }
      });
      
      if (defaultServiceType) {
        createData.serviceTypeId = defaultServiceType.id;
      }
    }

    console.log('Creating service with data:', JSON.stringify(createData, null, 2));
    const newService = await db.service.create({
      data: createData,
    });
    console.log('Service created successfully:', newService.id);

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
