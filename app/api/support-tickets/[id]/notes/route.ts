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

    if (!updatedTicket) {
      return NextResponse.json(
        { error: 'Ticket not found after note creation' },
        { status: 404 }
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
      messages: updatedTicket.messages.map((msg: any) => ({
        id: msg.id.toString(),
        type: msg.messageType,
        author: msg.messageType === 'system' ? 'System' : (msg.user.name === 'Admin User' ? 'Admin' : (msg.user.name || msg.user.email)),
        authorRole: msg.isFromAdmin ? 'admin' : 'user',
        content: msg.message,
        createdAt: msg.createdAt.toISOString(),
        attachments: msg.attachments ? JSON.parse(msg.attachments) : []
      })),
      notes: updatedTicket.notes.map((note: any) => ({
        id: note.id.toString(),
        content: note.content,
        author: note.user.name || 'Admin',
        createdAt: note.createdAt.toISOString(),
        isPrivate: note.isPrivate
      })),
      user: updatedTicket.user
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