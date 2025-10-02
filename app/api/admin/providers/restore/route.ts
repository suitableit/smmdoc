import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/auth';
import { db } from '@/lib/db';

// POST - Restore provider from trash
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();

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

    const body = await req.json();
    const { providerId } = body;

    // Validate providerId
    if (!providerId || typeof providerId !== 'number') {
      return NextResponse.json(
        {
          error: 'Valid Provider ID is required.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Check if provider exists and is in trash
    const provider = await db.api_providers.findUnique({
      where: { id: providerId }
    });

    if (!provider) {
      return NextResponse.json(
        {
          error: 'Provider not found.',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    if (provider.status !== 'trash') {
      return NextResponse.json(
        {
          error: 'Provider is not in trash.',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Restore provider by setting status to active
    await db.api_providers.update({
      where: { id: providerId },
      data: { 
        status: 'active',
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Provider restored successfully!',
      data: null,
      error: null
    });

  } catch (error) {
    console.error('Error restoring provider:', error);
    return NextResponse.json(
      {
        error: 'Failed to restore provider: ' + (error instanceof Error ? error.message : 'Unknown error'),
        success: false,
        data: null
      },
      { status: 500 }
    );
  }
}