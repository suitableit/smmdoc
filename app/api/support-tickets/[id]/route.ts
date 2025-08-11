import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for updating support tickets
const updateTicketSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
  adminReply: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single support ticket
export async function GET(
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

    const ticketId = parseInt(params.id);
    
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Check if user is admin or ticket owner
    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    });

    const whereClause: any = { id: ticketId };
    
    // If not admin, only show user's own tickets
    if (user?.role !== 'admin') {
      whereClause.userId = parseInt(session.user.id);
    }

    const ticket = await db.supportTicket.findUnique({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        repliedByUser: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket
    });

  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update support ticket (admin only for status/reply, user for additional info)
export async function PUT(
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

    const ticketId = parseInt(params.id);
    
    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can update tickets' },
        { status: 403 }
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
    const validatedData = updateTicketSchema.parse(body);

    // Prepare update data
    const updateData: any = {};
    
    if (validatedData.status) {
      updateData.status = validatedData.status;
    }
    
    if (validatedData.priority) {
      updateData.priority = validatedData.priority;
    }
    
    if (validatedData.adminReply) {
      updateData.adminReply = validatedData.adminReply;
      updateData.repliedAt = new Date();
      updateData.repliedBy = parseInt(session.user.id);
    }

    // Update the ticket
    const updatedTicket = await db.supportTicket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        repliedByUser: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: updatedTicket
    });

  } catch (error) {
    console.error('Error updating support ticket:', error);
    
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

// DELETE - Delete support ticket (admin only)
export async function DELETE(
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
        { error: 'Only admins can delete tickets' },
        { status: 403 }
      );
    }

    const ticketId = parseInt(params.id);
    
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

    // Delete the ticket
    await db.supportTicket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting support ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}