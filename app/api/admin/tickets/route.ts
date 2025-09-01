import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Validation schema for bulk operations
const bulkOperationSchema = z.object({
  ticketIds: z.array(z.string()),
  operation: z.enum(['mark_read', 'mark_unread', 'delete_selected'])
});

// Helper function to map database status to frontend status
function mapDatabaseStatusToFrontend(dbStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': 'Open',
    'in_progress': 'In Progress',
    'resolved': 'Answered',
    'closed': 'Closed',
    'on_hold': 'On Hold'
  };
  
  // If the status is already in the correct frontend format, return it directly
  const frontendStatuses = ['Open', 'Answered', 'Customer Reply', 'On Hold', 'In Progress', 'Closed'];
  if (frontendStatuses.includes(dbStatus)) {
    return dbStatus;
  }
  
  return statusMap[dbStatus] || 'Open';
}

// GET - Fetch all support tickets (admin only)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (status && status !== 'all') {
      // Map frontend status to database status
      const statusMap: { [key: string]: string } = {
        'open': 'pending',
        'answered': 'in_progress',
        'customer_reply': 'pending',
        'on_hold': 'on_hold',
        'in_progress': 'in_progress',
        'closed': 'closed'
      };
      where.status = statusMap[status] || status;
    }

    if (search) {
      where.OR = [
        {
          subject: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            username: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ];
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
          }
        }
      }),
      db.supportTicket.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Transform tickets to match frontend interface
    const transformedTickets = tickets.map(ticket => ({
      id: ticket.id.toString(),
      userId: ticket.userId.toString(),
      username: ticket.user?.username || 'N/A',
      name: ticket.user?.name || 'Unknown User',
      subject: ticket.subject,
      createdAt: ticket.createdAt.toISOString(),
      lastUpdated: ticket.updatedAt ? ticket.updatedAt.toISOString() : ticket.createdAt.toISOString(),
      status: mapDatabaseStatusToFrontend(ticket.status),
      isRead: ticket.isRead,
    }));

    return NextResponse.json({
      success: true,
      tickets: transformedTickets,
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });

  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Handle bulk operations (admin only)
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { ticketIds, operation } = bulkOperationSchema.parse(body);

    const ticketIdsAsNumbers = ticketIds.map(id => parseInt(id));

    let updateData: any = {};
    let message = '';

    switch (operation) {
      case 'mark_read':
        updateData = { isRead: true };
        message = `${ticketIds.length} tickets marked as read`;
        break;
      case 'mark_unread':
        updateData = { isRead: false };
        message = `${ticketIds.length} tickets marked as unread`;
        break;
      case 'delete_selected':
        await db.supportTicket.deleteMany({
          where: {
            id: {
              in: ticketIdsAsNumbers
            }
          }
        });
        return NextResponse.json({
          success: true,
          message: `${ticketIds.length} tickets deleted`
        });
    }

    // Update tickets
    await db.supportTicket.updateMany({
      where: {
        id: {
          in: ticketIdsAsNumbers
        }
      },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    
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