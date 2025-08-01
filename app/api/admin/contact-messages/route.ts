import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get contact messages for admin
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'All';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get contact messages with filters
    console.log('🔍 Fetching contact messages with filters:', { status, search, limit, offset });

    // Build where clause
    const where: any = {};
    if (status !== 'All') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { subject: { contains: search } },
        { message: { contains: search } },
        { user: { username: { contains: search } } },
        { user: { email: { contains: search } } }
      ];
    }

    // Simple query without joins first
    const messages = await db.$queryRaw`
      SELECT * FROM contact_messages
      ORDER BY createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    console.log('📋 Found messages:', (messages as any[]).length);

    // Get message counts for status tabs
    const totalResult = await db.$queryRaw`SELECT COUNT(*) as count FROM contact_messages` as any[];
    const unreadResult = await db.$queryRaw`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'Unread'` as any[];
    const readResult = await db.$queryRaw`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'Read'` as any[];
    const repliedResult = await db.$queryRaw`SELECT COUNT(*) as count FROM contact_messages WHERE status = 'Replied'` as any[];

    const total = Number(totalResult[0]?.count || 0);
    const unread = Number(unreadResult[0]?.count || 0);
    const read = Number(readResult[0]?.count || 0);
    const replied = Number(repliedResult[0]?.count || 0);
    const counts = { total, unread, read, replied };
    console.log('📊 Message counts:', counts);

    // Format messages for the UI
    const formattedMessages = (messages as any[]).map((msg: any) => ({
      id: msg.id,
      user: msg.username || 'Unknown User',
      email: msg.email || 'No Email',
      category: msg.categoryName || 'Unknown Category',
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
      adminReply: msg.adminReply,
      repliedAt: msg.repliedAt,
      repliedBy: msg.repliedByUsername,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        messages: formattedMessages,
        counts: {
          total: Number(counts.total) || 0,
          unread: Number(counts.unread) || 0,
          read: Number(counts.read) || 0,
          replied: Number(counts.replied) || 0
        },
        pagination: {
          page,
          limit,
          total: formattedMessages.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting contact messages:', error);
    return NextResponse.json(
      { error: 'Failed to get contact messages' },
      { status: 500 }
    );
  }
}

// POST - Bulk operations on contact messages
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, messageIds } = await request.json();

    if (!action || !messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Action and message IDs are required' },
        { status: 400 }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    for (const messageId of messageIds) {
      try {
        switch (action) {
          case 'markAsRead':
            const readResult = await contactDB.updateContactMessageStatus(messageId, 'Read');
            if (readResult) successCount++;
            else errorCount++;
            break;

          case 'markAsUnread':
            const unreadResult = await contactDB.updateContactMessageStatus(messageId, 'Unread');
            if (unreadResult) successCount++;
            else errorCount++;
            break;

          case 'delete':
            const deleteResult = await contactDB.deleteContactMessage(messageId);
            if (deleteResult) successCount++;
            else errorCount++;
            break;

          default:
            errorCount++;
            break;
        }
      } catch (error) {
        console.error(`Error processing message ${messageId}:`, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk operation completed. ${successCount} successful, ${errorCount} failed.`,
      results: {
        successCount,
        errorCount,
        totalProcessed: messageIds.length
      }
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
