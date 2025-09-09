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

// POST - Add a new note to a contact message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const messageId = parseInt(id);
    
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = noteSchema.parse(body);

    // Check if the contact message exists
    const contactMessage = await db.contactMessage.findUnique({
      where: { id: messageId },
      select: { id: true }
    });

    if (!contactMessage) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Create the note
    await db.contactNote.create({
      data: {
        messageId: messageId,
        userId: session.user.id,
        content: validatedData.content,
        isPrivate: true
      }
    });

    // Fetch the complete updated contact message with all notes
    const updatedMessage = await db.contactMessage.findUnique({
      where: { id: messageId },
      include: {
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

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Contact message not found after note creation' },
        { status: 404 }
      );
    }

    // Transform the response to match the expected format
    const transformedMessage = {
      ...updatedMessage,
      notes: updatedMessage.notes.map(note => ({
        id: note.id.toString(),
        content: note.content,
        author: note.user.name || note.user.username || 'Admin',
        createdAt: note.createdAt.toISOString(),
        isPrivate: note.isPrivate
      }))
    };

    return NextResponse.json(transformedMessage);

  } catch (error) {
    console.error('Error adding contact note:', error);
    
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