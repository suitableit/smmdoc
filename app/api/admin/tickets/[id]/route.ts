import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for updating tickets
const updateTicketSchema = z.object({
  status: z.enum(['Open', 'in_progress', 'resolved', 'closed', 'on_hold']).optional(),
  isRead: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single support ticket (admin)
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

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          }
        },
        repliedByUser: {
          select: {
            id: true,
            name: true,
          }
        },
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true,
              }
            }
          }
        },
        notes: {
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              }
            }
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

    // Calculate user ticket statistics
    const [totalTickets, openTickets] = await Promise.all([
      // Count total tickets for this user
      db.supportTicket.count({
        where: { userId: ticket.userId }
      }),
      // Count open tickets for this user (status: 'pending' or 'Open')
      db.supportTicket.count({
        where: {
          userId: ticket.userId,
          OR: [
            { status: 'pending' },
            { status: 'Open' }
          ]
        }
      })
    ]);

    // Transform the ticket data to match frontend expectations
    const transformedTicket = {
      ...ticket,
      id: ticket.id.toString(),
      createdAt: ticket.createdAt.toISOString(),
      lastUpdated: ticket.updatedAt.toISOString(), // Map updatedAt to lastUpdated
      userInfo: {
        id: ticket.user?.id,
        name: ticket.user?.name,
        username: ticket.user?.username,
        email: ticket.user?.email,
        totalTickets,
        openTickets
      },
      messages: ticket.messages.map((msg: any) => ({
        id: msg.id,
        type: msg.messageType, // Map messageType to type
        author: msg.messageType === 'system' ? 'System' : msg.user.name,
        authorRole: msg.messageType === 'system' ? 'system' : (msg.isFromAdmin ? 'admin' : 'user'),
        content: msg.message, // Map message to content
        createdAt: msg.createdAt,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
        isEdited: false,
        userImage: msg.user.image,
        user: {
          ...msg.user,
          // For system messages created by admins, show the admin username
          // For legacy system messages, fall back to 'system'
          username: msg.messageType === 'system' && msg.isFromAdmin && msg.user.role === 'admin' ? msg.user.username : 
                   msg.messageType === 'system' ? 'system' : msg.user.username
        }
      })),
      notes: ticket.notes.map((note: any) => ({
        id: note.id.toString(),
        content: note.content,
        author: note.user.username || note.user.name,
        createdAt: note.createdAt.toISOString(),
        isPrivate: note.isPrivate
      }))
    };

    return NextResponse.json({
      success: true,
      ticket: transformedTicket
    });

  } catch (error) {
    console.error('Error fetching admin ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update support ticket (admin only)
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
    const validatedData = updateTicketSchema.parse(body);

    // Prepare update data
    const updateData: any = {
      lastUpdated: new Date()
    };
    
    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
    }
    
    if (validatedData.isRead !== undefined) {
      updateData.isRead = validatedData.isRead;
    }
    
    if (validatedData.priority !== undefined) {
      updateData.priority = validatedData.priority;
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
    console.error('Error updating admin ticket:', error);
    
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

    // Delete related records first (if any)
    await db.supportTicket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting admin ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}