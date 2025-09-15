import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Helper function to capitalize status for display
const capitalizeStatus = (status: string): string => {
  if (status === 'closed') return 'Closed';
  return status;
};

// Validation schema for status update
const statusUpdateSchema = z.object({
  status: z.enum(['Open', 'Answered', 'Customer Reply', 'On Hold', 'In Progress', 'Closed'])
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH - Update ticket status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Check if ticket exists
    const existingTicket = await db.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { generateSystemMessage = true, ...statusData } = body;
    
    // Validate status using schema
    const { status } = statusUpdateSchema.parse(statusData);

    // Update the ticket status
    const updatedTicket = await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        updatedAt: new Date(),
        // If closing the ticket, mark as read
        ...(status === 'closed' && { isRead: true })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Create a system message for status change only if explicitly requested
    if (status !== existingTicket.status && generateSystemMessage) {
      await db.ticketMessage.create({
        data: {
          ticketId: ticketId,
          userId: parseInt(session.user.id),
          message: `Ticket status changed from ${capitalizeStatus(existingTicket.status)} to ${capitalizeStatus(status)}`,
          messageType: 'system',
          isFromAdmin: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Error updating ticket status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}