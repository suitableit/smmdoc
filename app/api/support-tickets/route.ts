import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for creating support tickets
const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  orderIds: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachments: z.string().optional(),
});

// POST - Create new support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if ticket system is enabled
    const ticketSettings = await db.ticketSettings.findFirst();
    if (!ticketSettings?.ticketSystemEnabled) {
      return NextResponse.json(
        { error: 'Ticket system is currently disabled' },
        { status: 403 }
      );
    }

    // Check user's pending tickets limit
    const pendingTicketsCount = await db.supportTicket.count({
      where: {
        userId: parseInt(session.user.id),
        status: {
          in: ['pending', 'in_progress']
        }
      }
    });

    const maxPendingTickets = parseInt(ticketSettings.maxPendingTickets || '3');
    if (pendingTicketsCount >= maxPendingTickets) {
      return NextResponse.json(
        { error: `You have reached the maximum limit of ${maxPendingTickets} pending tickets` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validatedData = createTicketSchema.parse(body);

    // Create the support ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId: parseInt(session.user.id),
        subject: validatedData.subject,
        message: validatedData.message,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        orderIds: validatedData.orderIds,
        priority: validatedData.priority,
        attachments: validatedData.attachments,
        status: 'pending',
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

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        category: ticket.category,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating support ticket:', error);
    
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

// GET - Fetch user's support tickets
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: parseInt(session.user.id),
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Get tickets with pagination
    const [tickets, totalCount] = await Promise.all([
      db.supportTicket.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
          repliedByUser: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }),
      db.supportTicket.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      }
    });

  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}