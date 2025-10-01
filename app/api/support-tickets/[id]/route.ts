import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { getTicketSettings } from '@/lib/utils/ticket-settings';

// Helper function to capitalize status for display
const capitalizeStatus = (status: string): string => {
  if (status === 'closed') return 'Closed';
  return status;
};

// Validation schema for updating support tickets
const updateTicketSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
  adminReply: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
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

    // Check if ticket system is enabled
    const ticketSettings = await getTicketSettings();
    if (!ticketSettings.ticketSystemEnabled) {
      return NextResponse.json(
        { error: 'Ticket system is currently disabled' },
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

    // Check if user is admin or ticket owner
    const user = await db.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { role: true }
    });

    const whereClause = { id: ticketId } as any;
    
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
            image: true,
          }
        },
        repliedByUser: {
          select: {
            id: true,
            name: true,
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        notes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
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

    // Transform the ticket data to match frontend expectations
    // For user-facing API, hide admin names and show generic labels
    let messages = ticket.messages.map((msg: Record<string, unknown>) => {
      let authorName;
      if (msg.messageType === 'system') {
        authorName = 'System';
      } else if (msg.isFromAdmin) {
        // Hide admin names for users - show generic 'Support Admin' label
        authorName = 'Support Admin';
      } else {
        // Show user's own name
        authorName = (msg.user as any).name || (msg.user as any).email;
      }
      
      return {
        id: String(msg.id),
        type: msg.messageType,
        author: authorName,
        authorRole: msg.isFromAdmin ? 'admin' : 'user',
        content: msg.message,
        createdAt: (msg.createdAt as Date).toISOString(),
        attachments: msg.attachments ? JSON.parse(msg.attachments as string) : [],
        userImage: msg.isFromAdmin ? null : (msg.user as any).image // Hide admin images too
      };
    });

    // If no messages exist but ticket has initial message, create initial message entry
    if (messages.length === 0 && ticket.message) {
      messages = [{
        id: 'initial',
        type: 'customer',
        author: ticket.user.name || ticket.user.email,
        authorRole: 'user',
        content: ticket.message,
        createdAt: ticket.createdAt.toISOString(),
        attachments: ticket.attachments ? JSON.parse(ticket.attachments) : [],
        userImage: ticket.user.image
      }];
    }

    const transformedTicket = {
      id: ticket.id.toString(),
      subject: ticket.subject,
      createdAt: ticket.createdAt.toISOString(),
      lastUpdated: ticket.updatedAt.toISOString(),
      status: ticket.status,
      ticketType: ticket.ticketType,
      aiSubcategory: ticket.aiSubcategory,
      systemMessage: ticket.systemMessage,
      orderIds: ticket.orderIds ? JSON.parse(ticket.orderIds) : [],
      messages: messages,
      notes: ticket.notes.map((note: Record<string, unknown>) => {
        let authorName;
       if ((note.user as any).role === 'admin') {
         // Hide admin names for users - show generic 'Support Admin' label
         authorName = 'Support Admin';
       } else {
         // Show user's own name
         authorName = (note.user as any).name || (note.user as any).email;
       }
        
        return {
          id: String(note.id),
          content: note.content,
          author: authorName,
          createdAt: (note.createdAt as Date).toISOString(),
          isPrivate: note.isPrivate
        };
      }),
      user: ticket.user
    };

    return NextResponse.json(transformedTicket);

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

    // Ticket system is always enabled

    const resolvedParams = await params;
    const ticketId = parseInt(resolvedParams.id);
    
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

    // Check if ticket exists and get ownership info
    const existingTicket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true, status: true }
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const isAdmin = user?.role === 'admin';
    const isOwner = existingTicket.userId === parseInt(session.user.id);

    const body = await request.json();
    const { generateSystemMessage = true, ...validatedData } = body;
    
    // Validate the data using the schema (excluding generateSystemMessage)
    const parsedData = updateTicketSchema.parse(validatedData);

    // Check permissions based on what's being updated
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Users can only close their own tickets, admins can do everything
    if (!isAdmin && isOwner) {
      // Users can only update status to 'closed'
      if (parsedData.status && parsedData.status !== 'closed') {
        return NextResponse.json(
          { error: 'Users can only close their own tickets' },
          { status: 403 }
        );
      }
      // Users cannot update adminReply or priority
      if (parsedData.adminReply || parsedData.priority) {
        return NextResponse.json(
          { error: 'Only admins can update admin reply or priority' },
          { status: 403 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (parsedData.status) {
      updateData.status = parsedData.status;
    }
    
    if (parsedData.priority) {
      updateData.priority = parsedData.priority;
    }
    
    if (parsedData.adminReply) {
      updateData.adminReply = parsedData.adminReply;
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

    // Create a system message for status change only if explicitly requested
    if (parsedData.status && existingTicket && parsedData.status !== existingTicket.status && generateSystemMessage) {
      await db.ticketMessage.create({
        data: {
          ticketId: ticketId,
          userId: parseInt(session.user.id),
          message: `Ticket status changed from ${capitalizeStatus(existingTicket.status)} to ${capitalizeStatus(parsedData.status)}`,
          messageType: 'system',
          isFromAdmin: true
        }
      });
    }

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

    // Ticket system is always enabled

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