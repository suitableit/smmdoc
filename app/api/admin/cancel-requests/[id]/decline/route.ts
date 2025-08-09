import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/cancel-requests/:id/decline - Decline a cancel request
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id!) },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required', success: false },
        { status: 403 }
      );
    }

    const { id } = await params;
    const requestId = parseInt(id);
    if (isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request ID', success: false },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { adminNotes } = body;

    if (!adminNotes || typeof adminNotes !== 'string' || adminNotes.trim().length === 0) {
      return NextResponse.json(
        { error: 'Admin notes are required for declining a request', success: false },
        { status: 400 }
      );
    }

    // Check if cancel request exists and is pending
    const existingRequest = await db.cancelRequest.findUnique({
      where: { id: requestId },
      include: {
        order: {
          include: {
            service: true,
            user: true
          }
        }
      }
    });

    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Cancel request not found', success: false },
        { status: 404 }
      );
    }

    if (existingRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending cancel requests can be declined', success: false },
        { status: 400 }
      );
    }

    // Update the cancel request status to declined
    const updatedRequest = await db.cancelRequest.update({
      where: { id: requestId },
      data: {
        status: 'declined',
        adminNotes: adminNotes.trim(),
        processedBy: parseInt(session.user.id!),
        processedAt: new Date()
      },
      include: {
        order: {
          include: {
            service: true,
            user: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Cancel request declined successfully',
      success: true,
      data: updatedRequest
    });

  } catch (error) {
    console.error('Error declining cancel request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}