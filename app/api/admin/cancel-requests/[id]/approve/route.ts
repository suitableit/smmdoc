import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/admin/cancel-requests/:id/approve - Approve a cancel request
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
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required', success: false },
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
    const { refundAmount, adminNotes } = body;

    if (!refundAmount || refundAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid refund amount is required', success: false },
        { status: 400 }
      );
    }

    // Admin notes are optional - no validation required

    // Check if the cancel request exists and is pending
    const existingRequest = await db.cancelRequest.findUnique({
      where: {
        id: requestId
      },
      include: {
        order: true,
        user: true
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
        { error: 'Only pending cancel requests can be approved', success: false },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // Update the cancel request status to approved
      const updatedRequest = await tx.cancelRequest.update({
        where: {
          id: requestId
        },
        data: {
          status: 'approved',
          refundAmount: parseFloat(refundAmount.toString()),
          adminNotes: adminNotes ? adminNotes.trim() : null,
          processedAt: new Date(),
          processedBy: parseInt(session.user.id)
        },
        include: {
          order: {
            include: {
              service: true,
              user: true
            }
          },
          user: true
        }
      });

      // Update the order status to cancelled
      await tx.newOrder.update({
        where: {
          id: existingRequest.orderId
        },
        data: {
          status: 'cancelled'
        }
      });

      // Process refund by adding the amount to user's balance
      const refundAmountFloat = parseFloat(refundAmount.toString());
      await tx.user.update({
        where: {
          id: existingRequest.userId
        },
        data: {
          balance: {
            increment: refundAmountFloat
          }
        }
      });

      return updatedRequest;
    });

    console.log(`Admin ${session.user.email} approved cancel request ${requestId}`, {
      requestId,
      orderId: existingRequest.orderId,
      refundAmount,
      adminNotes,
      userRefunded: existingRequest.userId
    });

    return NextResponse.json({
      success: true,
      message: 'Cancel request approved successfully. User balance has been refunded.',
      data: result
    });

  } catch (error) {
    console.error('Error approving cancel request:', error);
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