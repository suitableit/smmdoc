import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/service-types - Get all service types
export async function GET(req: NextRequest) {
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

    const serviceTypes = await db.serviceType.findMany({
      include: {
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data to include service count
    const transformedData = serviceTypes.map(type => ({
      ...type,
      serviceCount: type._count.services
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      error: null
    });

  } catch (error) {
    console.error('Error fetching service types:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch service types: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
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
    const { name, description } = body;

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

    // Check if service type already exists
    const existingType = await db.serviceType.findUnique({
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

    const serviceType = await db.serviceType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
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
