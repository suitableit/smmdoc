import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for notes
const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000, 'Note too long'),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// POST - Add internal note to support ticket (admin only)
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
    const ticket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      select: { id: true }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = noteSchema.parse(body);

    // Create the internal note
    const note = await db.ticketNote.create({
      data: {
        ticketId: ticketId,
        userId: parseInt(session.user.id),
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    // Fetch the complete updated ticket with all notes
    const updatedTicket = await db.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true,
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
                role: true,
                username: true,
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
                username: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found after note creation' },
        { status: 404 }
      );
    }

    // Get user statistics
    const [totalTickets, openTickets] = await Promise.all([
      db.supportTicket.count({
        where: { userId: updatedTicket.userId }
      }),
      db.supportTicket.count({
        where: {
          userId: updatedTicket.userId,
          status: { not: 'closed' }
        }
      })
    ]);

    // Transform the ticket data to match frontend expectations
    const transformedTicket = {
      id: updatedTicket.id.toString(),
      userId: updatedTicket.userId.toString(),
      username: updatedTicket.user?.username || updatedTicket.user?.name || 'N/A',
      userEmail: updatedTicket.user?.email || 'N/A',
      subject: updatedTicket.subject,
      createdAt: updatedTicket.createdAt.toISOString(),
      lastUpdated: updatedTicket.updatedAt.toISOString(),
      status: updatedTicket.status,
      isRead: updatedTicket.isRead,
      timeSpent: 0,
      ticketType: updatedTicket.ticketType,
      aiSubcategory: updatedTicket.aiSubcategory,
      humanTicketSubject: updatedTicket.humanTicketSubject,
      systemMessage: updatedTicket.systemMessage,
      ticketStatus: updatedTicket.ticketStatus,
      orderIds: updatedTicket.orderIds ? JSON.parse(updatedTicket.orderIds) : [],
      userInfo: {
        fullName: updatedTicket.user?.name || 'N/A',
        username: updatedTicket.user?.username,
        email: updatedTicket.user?.email || 'N/A',
        phone: 'N/A',
        company: 'N/A',
        address: 'N/A',
        registeredAt: updatedTicket.user?.createdAt?.toISOString() || 'N/A',
        totalTickets,
        openTickets
      },
      messages: updatedTicket.messages.map((msg: any) => {
        let authorName;
        if (msg.messageType === 'system') {
          authorName = 'System';
        } else if (msg.isFromAdmin || msg.user?.role === 'admin') {
          authorName = 'Admin';
        } else {
          authorName = msg.user?.name || msg.user?.email || 'Unknown';
        }
        
        return {
          id: msg.id.toString(),
          type: msg.messageType,
          author: authorName,
          authorRole: msg.isFromAdmin ? 'admin' : 'user',
          content: msg.message,
          createdAt: msg.createdAt.toISOString(),
          attachments: msg.attachments ? JSON.parse(msg.attachments) : [],
          userImage: msg.user?.image,
          user: {
            ...msg.user,
            username: msg.messageType === 'system' && msg.isFromAdmin && msg.user?.role === 'admin' ? msg.user.username : 
                     msg.messageType === 'system' ? 'system' : msg.user?.username
          }
        };
      }),
      notes: updatedTicket.notes.map((note: any) => ({
        id: note.id.toString(),
        content: note.content,
        author: note.user?.username || note.user?.name || 'Admin',
        createdAt: note.createdAt.toISOString(),
        isPrivate: note.isPrivate
      }))
    };

    return NextResponse.json(transformedTicket);

  } catch (error) {
    console.error('Error adding internal note:', error);
    
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

// GET - Get all internal notes for a ticket (admin only)
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

    // Get all notes for the ticket
    const notes = await db.ticketNote.findMany({
      where: { ticketId },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error('Error fetching internal notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}