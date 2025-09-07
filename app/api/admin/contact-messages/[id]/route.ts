import { auth } from '@/auth';
import { contactDB } from '@/lib/contact-db';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get specific contact message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const messageId = parseInt(resolvedParams.id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Check if notes should be included
    const { searchParams } = new URL(request.url);
    const includeNotes = searchParams.get('include_notes') === 'true';

    // Get the contact message
    const message = await contactDB.getContactMessageById(messageId, includeNotes);

    if (!message) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Format message for the UI
    const formattedMessage = {
      id: message.id,
      userId: message.userId,
      subject: message.subject,
      message: message.message,
      status: message.status,
      categoryId: message.categoryId,
      attachments: message.attachments,
      adminReply: message.adminReply,
      repliedAt: message.repliedAt,
      repliedBy: message.repliedBy,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      user: message.user,
      category: message.category,
      repliedByUser: message.repliedByUser,
      notes: message.notes || []
    };

    // Mark as read if it's unread
    if (message.status === 'Unread') {
      await contactDB.updateContactMessageStatus(messageId, 'Read');
      formattedMessage.status = 'Read';
    }

    return NextResponse.json({
      success: true,
      message: formattedMessage
    });

  } catch (error) {
    console.error('Error getting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to get contact message' },
      { status: 500 }
    );
  }
}

// PUT - Update contact message (reply, status change)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const messageId = parseInt(resolvedParams.id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    const { action, status, adminReply } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    let result = false;

    switch (action) {
      case 'updateStatus':
        if (!status) {
          return NextResponse.json(
            { error: 'Status is required for status update' },
            { status: 400 }
          );
        }
        result = await contactDB.updateContactMessageStatus(messageId, status);
        break;

      case 'reply':
        if (!adminReply || !adminReply.trim()) {
          return NextResponse.json(
            { error: 'Admin reply is required' },
            { status: 400 }
          );
        }
        result = await contactDB.replyToContactMessage(
          messageId,
          adminReply.trim(),
          session.user.id
        );

        // Send notification to user
        try {
          const contactMessage = await contactDB.getContactMessageById(messageId);
          if (contactMessage && contactMessage.user) {
            const { sendMail } = await import('@/lib/nodemailer');
            const { contactEmailTemplates } = await import('@/lib/email-templates');
            const { sendSMS } = await import('@/lib/sms');
            const { smsTemplates } = await import('@/lib/sms');
            
            const userEmail = contactMessage.user.email;
            const userName = (contactMessage.user as any).name || contactMessage.user.username || 'User';
            const userPhone = (contactMessage.user as any).phone;
            
            // Send email notification to user
            if (userEmail) {
              const emailTemplate = contactEmailTemplates.adminReplyToUser({
                userName,
                subject: contactMessage.subject,
                adminReply: adminReply.trim(),
                adminName: session.user.name || session.user.username || 'Admin',
                messageId: messageId
              });
              
              await sendMail({
                sendTo: userEmail,
                subject: emailTemplate.subject,
                html: emailTemplate.html
              });
            }
            
            // Send SMS notification to user (if phone number available)
             if (userPhone) {
               const { isValidBangladeshiPhone } = await import('@/lib/sms');
               if (isValidBangladeshiPhone(userPhone)) {
                 const smsMessage = smsTemplates.adminReplyToUserSMS(contactMessage.subject);
                 await sendSMS({
                   to: userPhone,
                   message: smsMessage
                 });
               }
             }
          }
        } catch (notificationError) {
          console.error('Error sending user notification:', notificationError);
          // Don't fail the main request if notification fails
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update contact message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: action === 'reply' ? 'Reply sent successfully' : 'Status updated successfully'
    });

  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { error: 'Failed to update contact message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const messageId = parseInt(resolvedParams.id);
    if (isNaN(messageId)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Check if message exists
    const message = await contactDB.getContactMessageById(messageId);
    if (!message) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    // Delete the message
    const result = await contactDB.deleteContactMessage(messageId);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to delete contact message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting contact message:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact message' },
      { status: 500 }
    );
  }
}
