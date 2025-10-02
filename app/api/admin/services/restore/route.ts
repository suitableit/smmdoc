import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Find the service
    const service = await db.service.findUnique({
      where: { id: parseInt(id) },
      include: {
        provider: true
      }
    });

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if service is actually in trash (inactive with a provider)
    if (service.status !== 'inactive' || !service.provider) {
      return NextResponse.json(
        { success: false, message: 'Service is not in trash' },
        { status: 400 }
      );
    }

    // Check if the provider is active (can only restore if provider is active)
    if (service.provider.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Cannot restore service: Provider is not active' },
        { status: 400 }
      );
    }

    // Restore the service by setting status to active
    await db.service.update({
      where: { id: parseInt(id) },
      data: {
        status: 'active',
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Service restored successfully'
    });

  } catch (error) {
    console.error('Error restoring service:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}