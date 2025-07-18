import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/service-types/[id] - Get specific service type
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const serviceType = await db.serviceType.findUnique({
      where: { id },
      include: {
        services: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!serviceType) {
      return NextResponse.json(
        {
          error: 'Service type not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...serviceType,
        serviceCount: serviceType._count.services
      },
      error: null
    });

  } catch (error) {
    console.error('Error fetching service type:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch service type: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/service-types/[id] - Update service type
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, status } = body;

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

    // Check if service type exists
    const existingType = await db.serviceType.findUnique({
      where: { id: params.id }
    });

    if (!existingType) {
      return NextResponse.json(
        {
          error: 'Service type not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Check if name is already taken by another service type
    const duplicateType = await db.serviceType.findFirst({
      where: { 
        name: name.trim(),
        id: { not: params.id }
      }
    });

    if (duplicateType) {
      return NextResponse.json(
        {
          error: 'Service type with this name already exists',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    const updatedServiceType = await db.serviceType.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        status: status || 'active'
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedServiceType,
      message: 'Service type updated successfully',
      error: null
    });

  } catch (error) {
    console.error('Error updating service type:', error);
    return NextResponse.json(
      {
        error: 'Failed to update service type: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/service-types/[id] - Delete service type
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if service type exists and get service count
    const serviceType = await db.serviceType.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!serviceType) {
      return NextResponse.json(
        {
          error: 'Service type not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Check if there are services using this type
    if (serviceType._count.services > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete service type. ${serviceType._count.services} service(s) are using this type. Please reassign or delete those services first.`,
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    await db.serviceType.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Service type deleted successfully',
      error: null
    });

  } catch (error) {
    console.error('Error deleting service type:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete service type: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}
