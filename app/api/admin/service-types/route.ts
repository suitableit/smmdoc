import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { SERVICE_TYPE_CONFIGS } from '@/lib/serviceTypes';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get service counts for each packageType from the database
    const serviceCounts = await prisma.service.groupBy({
      by: ['packageType'],
      _count: {
        id: true,
      },
    });

    // Create a map for quick lookup
    const serviceCountMap = new Map(
      serviceCounts.map(item => [item.packageType, item._count.id])
    );

    // Return only the predefined service types with their counts
    const serviceTypes = Object.entries(SERVICE_TYPE_CONFIGS).map(([key, config]) => {
      const packageType = parseInt(key);
      const serviceCount = serviceCountMap.get(packageType) || 0;
      
      return {
        id: packageType,
        name: config.name,
        description: config.description,
        serviceCount: serviceCount,
      };
    });

    return NextResponse.json({ serviceTypes });
  } catch (error) {
    console.error('Error fetching service types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/service-types - Create new service type
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
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

    const body = await req.json();
    const { 
      name, 
      description,
      packageType,
      requiresLink,
      requiresQuantity,
      requiresComments,
      requiresUsername,
      requiresPosts,
      requiresDelay,
      requiresMin,
      requiresMax,
      supportsDripfeed,
      supportsRefill,
      supportsCancel,
      isSubscription,
      isAutoService,
      maxQuantity,
      minQuantity,
      status
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          error: 'Service type name is required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (packageType && (packageType < 1 || packageType > 15)) {
      return NextResponse.json(
        {
          error: 'Package type must be between 1 and 15',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if service type already exists
    const existingType = await db.servicetype.findUnique({
      where: { name: name.trim() }
    });

    if (existingType) {
      return NextResponse.json(
        {
          error: 'Service type with this name already exists',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const serviceType = await db.servicetype.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        packageType: packageType || 1,
        requiresLink: requiresLink ?? true,
        requiresQuantity: requiresQuantity ?? true,
        requiresComments: requiresComments ?? false,
        requiresUsername: requiresUsername ?? false,
        requiresPosts: requiresPosts ?? false,
        requiresDelay: requiresDelay ?? false,
        requiresMin: requiresMin ?? false,
        requiresMax: requiresMax ?? false,
        supportsDripfeed: supportsDripfeed ?? false,
        supportsRefill: supportsRefill ?? false,
        supportsCancel: supportsCancel ?? false,
        isSubscription: isSubscription ?? false,
        isAutoService: isAutoService ?? false,
        maxQuantity: maxQuantity || null,
        minQuantity: minQuantity || null,
        status: status || 'active'
      }
    });

    return NextResponse.json({
      success: true,
      data: serviceType,
      message: 'Service type created successfully',
      error: null
    });

  } catch (error) {
    console.error('Error creating service type:', error);
    return NextResponse.json(
      {
        error: 'Failed to create service type: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
