import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          data: null,
          success: false,
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          error: 'Service ID is required',
          data: null,
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if service exists before deleting
    const existingService = await db.service.findUnique({
      where: { id: Number(id) },
      select: { id: true, name: true }
    });

    if (!existingService) {
      return NextResponse.json(
        {
          error: 'Service not found',
          data: null,
          success: false,
        },
        { status: 404 }
      );
    }

    // Delete the service
    await db.service.delete({
      where: {
        id: Number(id),
      },
    });

    return NextResponse.json(
      {
        error: null,
        message: 'Service deleted successfully',
        data: null,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete service: ' + (error instanceof Error ? error.message : 'Unknown error'),
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}
