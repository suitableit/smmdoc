import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for replies
const replySchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  attachments: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - Add reply to support ticket
export async function POST(
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

    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { userId: true, status: true }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isAdmin = user?.role === 'admin';
    const isOwner = ticket.userId === parseInt(session.user.id);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot reply to closed ticket' },
        { status: 400 }
      );
    }

    // Handle FormData for file uploads
    let message: string;
    let attachments: string | undefined;

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      message = formData.get('message') as string;
      attachments = formData.get('attachments') as string;
    } else {
      const body = await request.json();
      const validatedData = replySchema.parse(body);
      message = validatedData.message;
      attachments = validatedData.attachments;
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create the reply message
    const reply = await db.ticketMessage.create({
      data: {
        ticketId: ticketId,
        userId: parseInt(session.user.id),
        message: message.trim(),
        messageType: isAdmin ? 'staff' : 'customer',
        isFromAdmin: isAdmin,
        attachments: attachments || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    });

    // Update ticket status and last updated time
    const newStatus = isAdmin ? 'Answered' : 'Customer Reply';
    await db.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        repliedAt: new Date(),
        repliedBy: parseInt(session.user.id)
      }
    });

    // Fetch the complete updated ticket with all messages
    const updatedTicket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            image: true
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                image: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Failed to fetch updated ticket' },
        { status: 500 }
      );
    }

    // Transform the ticket data to match frontend expectations
    const transformedTicket = {
      id: updatedTicket.id.toString(),
      subject: updatedTicket.subject,
      createdAt: updatedTicket.createdAt.toISOString(),
      lastUpdated: updatedTicket.updatedAt.toISOString(),
      status: updatedTicket.status,
      ticketType: updatedTicket.ticketType,
      aiSubcategory: updatedTicket.aiSubcategory,
      systemMessage: updatedTicket.systemMessage,
      ticketStatus: updatedTicket.ticketStatus,
      orderIds: updatedTicket.orderIds ? JSON.parse(updatedTicket.orderIds) : [],
      messages: updatedTicket.messages.map(msg => ({
        id: msg.id.toString(),
        type: msg.messageType === 'staff' ? 'staff' : msg.messageType === 'system' ? 'system' : 'customer',
        author: msg.user?.name || 'Unknown',
        authorRole: msg.user?.role,
        content: msg.message,
        createdAt: msg.createdAt.toISOString(),
        userImage: msg.user?.image,
        attachments: msg.attachments ? JSON.parse(msg.attachments) : []
      }))
    };

    return NextResponse.json(transformedTicket);

  } catch (error) {
    console.error('Error adding reply:', error);
    
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