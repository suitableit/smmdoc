import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Helper function to process refill requests
async function processRefillRequest(orderIds: string[], userId: number) {
  try {
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const orderId of orderIds) {
      try {
        // Check if order exists and belongs to the user
        const order = await db.newOrder.findUnique({
          where: { id: parseInt(orderId) },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                refill: true,
                refillDays: true
              }
            }
          }
        });

        if (!order || order.userId !== userId) {
          results.push({ orderId, success: false, message: 'Order not found or access denied' });
          failureCount++;
          continue;
        }

        if (order.status !== 'completed') {
          results.push({ orderId, success: false, message: 'Only completed orders can be refilled' });
          failureCount++;
          continue;
        }

        if (!order.service.refill) {
          results.push({ orderId, success: false, message: 'Service does not support refill' });
          failureCount++;
          continue;
        }

        // Check if refill request already exists
        const existingRequest = await db.refillRequest.findFirst({
          where: {
            orderId: parseInt(orderId),
            status: { in: ['pending', 'approved'] }
          }
        });

        if (existingRequest) {
          results.push({ orderId, success: false, message: 'Refill request already exists' });
          failureCount++;
          continue;
        }

        // Create refill request
        await db.refillRequest.create({
          data: {
            orderId: parseInt(orderId),
            userId: userId,
            reason: 'Automated refill request from AI support ticket',
            status: 'pending'
          }
        });

        // Update order status to Refill Started
        await db.newOrder.update({
          where: { id: parseInt(orderId) },
          data: { status: 'Refill Started' }
        });

        results.push({ orderId, success: true, message: 'Refill request created successfully' });
        successCount++;
      } catch (orderError) {
        console.error(`Error processing refill for order ${orderId}:`, orderError);
        results.push({ orderId, success: false, message: 'System error processing this order' });
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      message: `Processed ${successCount} refill requests successfully, ${failureCount} failed`,
      details: results
    };
  } catch (error) {
    console.error('Error processing refill requests:', error);
    return { success: false, message: 'System error during refill processing' };
  }
}

// Helper function to process cancel requests
async function processCancelRequest(orderIds: string[], userId: number) {
  try {
    let successCount = 0;
    let failureCount = 0;
    const results = [];

    for (const orderId of orderIds) {
      try {
        // Check if order exists and belongs to the user
        const order = await db.newOrder.findUnique({
          where: { id: parseInt(orderId) },
          include: {
            service: {
              select: {
                id: true,
                name: true,
                cancel: true
              }
            }
          }
        });

        if (!order || order.userId !== userId) {
          results.push({ orderId, success: false, message: 'Order not found or access denied' });
          failureCount++;
          continue;
        }

        if (!['pending', 'processing', 'in progress'].includes(order.status.toLowerCase())) {
          results.push({ orderId, success: false, message: 'Only pending/processing orders can be cancelled' });
          failureCount++;
          continue;
        }

        if (!order.service.cancel) {
          results.push({ orderId, success: false, message: 'Service does not support cancellation' });
          failureCount++;
          continue;
        }

        // Check if cancel request already exists
        const existingRequest = await db.cancelRequest.findFirst({
          where: {
            orderId: parseInt(orderId),
            status: { in: ['pending', 'approved'] }
          }
        });

        if (existingRequest) {
          results.push({ orderId, success: false, message: 'Cancel request already exists' });
          failureCount++;
          continue;
        }

        // Create cancel request
        await db.cancelRequest.create({
          data: {
            orderId: parseInt(orderId),
            userId: userId,
            reason: 'Automated cancel request from AI support ticket',
            status: 'pending'
          }
        });

        // Update order status to Canceled
        await db.newOrder.update({
          where: { id: parseInt(orderId) },
          data: { status: 'Canceled' }
        });

        results.push({ orderId, success: true, message: 'Cancel request created successfully' });
        successCount++;
      } catch (orderError) {
        console.error(`Error processing cancel for order ${orderId}:`, orderError);
        results.push({ orderId, success: false, message: 'System error processing this order' });
        failureCount++;
      }
    }

    return {
      success: successCount > 0,
      message: `Processed ${successCount} cancel requests successfully, ${failureCount} failed`,
      details: results
    };
  } catch (error) {
    console.error('Error processing cancel requests:', error);
    return { success: false, message: 'System error during cancel processing' };
  }
}

// Process Speed Up request
async function processSpeedUpRequest(orderIds: string[], userId: number) {
  try {
    const results = [];
    
    for (const orderId of orderIds) {
      // Check if order exists and belongs to user
      const order = await db.newOrder.findFirst({
        where: {
          id: parseInt(orderId),
          userId: userId
        },
        include: {
          service: true
        }
      });
      
      if (!order) {
        results.push({ orderId, success: false, message: 'Order not found or access denied' });
        continue;
      }
      
      // Check if order status allows speed up (not completed, cancelled, or refunded)
      if (['Completed', 'Cancelled', 'Refunded'].includes(order.status)) {
        results.push({ orderId, success: false, message: 'Order cannot be sped up in current status' });
        continue;
      }
      
      // Update order status to Speed Up Approved
        await db.newOrder.update({
          where: { id: parseInt(orderId) },
          data: { status: 'Speed Up Approved' }
        });
      
      results.push({ orderId, success: true, message: 'Speed up request approved' });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return {
      success: successCount > 0,
      message: successCount > 0 
        ? `Speed up approved for ${successCount} order(s)${failureCount > 0 ? `, ${failureCount} failed` : ''}` 
        : 'Speed up not available for any orders'
    };
  } catch (error) {
    console.error('Error processing speed up requests:', error);
    return { success: false, message: 'System error during speed up processing' };
  }
}

// Process Restart request
async function processRestartRequest(orderIds: string[], userId: number) {
  try {
    const results = [];
    
    for (const orderId of orderIds) {
      // Check if order exists and belongs to user
      const order = await db.newOrder.findFirst({
        where: {
          id: parseInt(orderId),
          userId: userId
        },
        include: {
          service: true
        }
      });
      
      if (!order) {
        results.push({ orderId, success: false, message: 'Order not found or access denied' });
        continue;
      }
      
      // Check if order can be restarted (partial, processing, or in progress)
      if (!['Partial', 'Processing', 'In progress'].includes(order.status)) {
        results.push({ orderId, success: false, message: 'Order cannot be restarted in current status' });
        continue;
      }
      
      // Update order status to Restarted
        await db.newOrder.update({
          where: { id: parseInt(orderId) },
          data: { status: 'Restarted' }
        });
      
      results.push({ orderId, success: true, message: 'Order restarted successfully' });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return {
      success: successCount > 0,
      message: successCount > 0 
        ? `${successCount} order(s) restarted${failureCount > 0 ? `, ${failureCount} failed` : ''}` 
        : 'Restart failed for all orders'
    };
  } catch (error) {
    console.error('Error processing restart requests:', error);
    return { success: false, message: 'System error during restart processing' };
  }
}

// Process Fake Complete request
async function processFakeCompleteRequest(orderIds: string[], userId: number) {
  try {
    const results = [];
    
    for (const orderId of orderIds) {
      // Check if order exists and belongs to user
      const order = await db.newOrder.findFirst({
        where: {
          id: parseInt(orderId),
          userId: userId
        },
        include: {
          service: true
        }
      });
      
      if (!order) {
        results.push({ orderId, success: false, message: 'Order not found or access denied' });
        continue;
      }
      
      // Check if order is not already completed
      if (order.status === 'Completed') {
        results.push({ orderId, success: false, message: 'Order is already completed' });
        continue;
      }
      
      // Check admin rules - for now, allow fake complete for orders that are stuck
      const allowedStatuses = ['Pending', 'Processing', 'In progress', 'Partial'];
      if (!allowedStatuses.includes(order.status)) {
        results.push({ orderId, success: false, message: 'Order cannot be marked as fake complete' });
        continue;
      }
      
      // Update order status to Completed with fake complete flag
        await db.newOrder.update({
          where: { id: parseInt(orderId) },
          data: { 
            status: 'Marked as Completed (Fake Complete)',
            // Add a note or flag to indicate this was fake completed
            // This might require a schema update to add a 'fakeComplete' boolean field
          }
        });
      
      results.push({ orderId, success: true, message: 'Order marked as completed (Fake Complete)' });
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;
    
    return {
      success: successCount > 0,
      message: successCount > 0 
        ? `${successCount} order(s) marked as completed${failureCount > 0 ? `, ${failureCount} failed` : ''}` 
        : 'Fake complete failed for all orders'
    };
  } catch (error) {
    console.error('Error processing fake complete requests:', error);
    return { success: false, message: 'System error during fake complete processing' };
  }
}


// Validation schema for creating support tickets
const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  ticketType: z.enum(['Human', 'AI']).default('Human'),
  aiSubcategory: z.string().optional(),
  humanTicketSubject: z.string().optional(),
  orderIds: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachments: z.array(z.string()).optional(),
}).refine((data) => {
  // Order IDs are required for all tickets (both Human and AI)
  if (!data.orderIds || data.orderIds.length === 0) {
    throw new z.ZodError([{
      code: 'custom',
      path: ['orderIds'],
      message: 'Order ID is required for all tickets'
    }]);
  }
    
    // Validate order ID format
    const orderIds = data.orderIds.map(id => id.trim()).filter(id => id);
    
    if (orderIds.length === 0) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['orderIds'],
        message: 'At least one valid order ID is required'
      }]);
    }
    
    if (orderIds.length > 10) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['orderIds'],
        message: 'Maximum 10 order IDs allowed per ticket'
      }]);
    }
    
    const invalidIds = orderIds.filter(id => !/^\d+$/.test(id));
    if (invalidIds.length > 0) {
      throw new z.ZodError([{
        code: 'custom',
        path: ['orderIds'],
        message: `Invalid order ID format: ${invalidIds.join(', ')}. Order IDs should be numeric.`
      }]);
    }
  
  return true;
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
    const ticketSettings = await db.ticket_settings.findFirst();
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
          in: ['Open', 'in_progress']
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

    // Validate order ownership for all tickets
    const orderIds = validatedData.orderIds ? validatedData.orderIds.map(id => id.trim()).filter(id => id) : [];
    
    if (orderIds.length > 0) {
      // Check if all order IDs belong to the current user
      const userOrders = await db.newOrder.findMany({
        where: {
          id: { in: orderIds.map(id => parseInt(id)) },
          userId: parseInt(session.user.id)
        },
        select: { id: true }
      });
      
      const foundOrderIds = userOrders.map(order => order.id.toString());
      const invalidOrderIds = orderIds.filter(id => !foundOrderIds.includes(id));
      
      if (invalidOrderIds.length > 0) {
        return NextResponse.json(
          { error: `Order ID(s) not found or do not belong to you: ${invalidOrderIds.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Process AI tickets automatically
    let systemMessage = '';
    let ticketStatus = 'Open';
    
    if (validatedData.ticketType === 'AI' && validatedData.aiSubcategory) {
      if (orderIds.length > 0) {
        try {
          if (validatedData.aiSubcategory === 'Refill') {
            // Process refill request
            const refillResult = await processRefillRequest(orderIds, parseInt(session.user.id));
            systemMessage = refillResult.success 
              ? '✅ Refill Request successful.'
              : '❌ Refill request failed. Because the service is not allowed to refill.';
          } else if (validatedData.aiSubcategory === 'Cancel') {
            // Process cancel request
            const cancelResult = await processCancelRequest(orderIds, parseInt(session.user.id));
            systemMessage = cancelResult.success 
              ? '✅ Cancel Request successful.'
              : '❌ Cancel request failed. Order may not be eligible for cancellation.';
          } else if (validatedData.aiSubcategory === 'Speed Up') {
            // Process speed up request
            const speedUpResult = await processSpeedUpRequest(orderIds, parseInt(session.user.id));
            systemMessage = speedUpResult.success 
              ? '⚡ Speed Up Approved. Your order processing has been prioritized.'
              : '❌ Speed Up Not Available. Order may not be eligible for speed up.';
          } else if (validatedData.aiSubcategory === 'Restart') {
            // Process restart request
            const restartResult = await processRestartRequest(orderIds, parseInt(session.user.id));
            systemMessage = restartResult.success 
              ? '🔁 Restarted. Your order has been restarted and will be processed again.'
              : '❌ Restart Failed. Order may not be eligible for restart.';
          } else if (validatedData.aiSubcategory === 'Fake Complete') {
            // Process fake complete request
            const fakeCompleteResult = await processFakeCompleteRequest(orderIds, parseInt(session.user.id));
            systemMessage = fakeCompleteResult.success 
              ? '🎭 Marked as Completed (Fake Complete). This action has been logged for admin review.'
              : '❌ Fake Complete Failed. Order may not be eligible or is already completed.';
          }
        } catch (error) {
          console.error('Error processing AI ticket:', error);
          systemMessage = `Processing failed due to system error. Please contact support.`;
        }
      } else {
        systemMessage = 'No valid order IDs provided for processing.';
      }
    }

    // Create the support ticket
    const ticket = await db.supportTicket.create({
      data: {
        userId: parseInt(session.user.id),
        subject: validatedData.subject,
        message: validatedData.message,
        category: validatedData.category,
        subcategory: validatedData.subcategory,
        ticketType: validatedData.ticketType,
        aiSubcategory: validatedData.aiSubcategory,
        systemMessage: systemMessage || null,
        orderIds: validatedData.orderIds ? JSON.stringify(validatedData.orderIds) : null,
        priority: validatedData.priority,
        attachments: validatedData.attachments ? JSON.stringify(validatedData.attachments) : null,
        status: ticketStatus,
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

    // Create initial message record for the ticket
    await db.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        userId: parseInt(session.user.id),
        message: validatedData.message,
        messageType: 'customer',
        isFromAdmin: false,
        attachments: validatedData.attachments ? JSON.stringify(validatedData.attachments) : null,
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