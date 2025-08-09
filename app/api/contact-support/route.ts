import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Contact Support POST - Session user:', session.user);

    const { subject, category, message, attachments } = await request.json();

    // Validate required fields
    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Import contact db
    const { contactDB } = await import('@/lib/contact-db');

    // Check if contact system is enabled
    const contactSettings = await contactDB.getContactSettings();
    if (!contactSettings?.contactSystemEnabled) {
      return NextResponse.json(
        { error: 'Contact system is currently disabled' },
        { status: 403 }
      );
    }

    // Check user's pending contact limit (skip if unlimited)
    const maxPendingContactsStr = contactSettings.maxPendingContacts || '3';

    if (maxPendingContactsStr.toLowerCase() !== 'unlimited') {
      const userPendingCount = await contactDB.countContactMessages({
        userId: session.user.id,
        status: ['Unread', 'Read']
      });
      const maxPendingContacts = parseInt(maxPendingContactsStr);

      if (userPendingCount >= maxPendingContacts) {
        return NextResponse.json(
          {
            error: `You have reached the maximum limit of ${maxPendingContacts} pending contacts. Please wait for a response to your previous messages.`
          },
          { status: 429 }
        );
      }
    }

    // Validate category exists
    const categories = await contactDB.getContactCategories();
    const categoryExists = categories.some((cat) => cat.id === parseInt(category));

    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Invalid category selected' },
        { status: 400 }
      );
    }

    // Process attachments if any
    let attachmentsJson = null;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      // Validate file attachments
      const validAttachments = attachments.filter(file =>
        file && file.name && file.size && file.size <= 10 * 1024 * 1024 // 10MB limit
      );

      if (validAttachments.length > 0) {
        attachmentsJson = JSON.stringify(validAttachments);
      }
    }

    // Create contact message
    const messageId = await (async () => {
      const result = await contactDB.createContactMessage({
        userId: session.user.id,
        subject: subject.trim(),
        message: message.trim(),
        categoryId: parseInt(category),
        attachments: attachmentsJson || undefined
      });
      
      // Get the newly created message ID
      const messages = await contactDB.getContactMessages({
        search: subject.trim(),
        limit: 1
      });
      
      return messages.length > 0 ? messages[0].id : 0;
    })();

    // Send notification to admin
    try {
      const { sendMail } = await import('@/lib/nodemailer');
      const { contactEmailTemplates } = await import('@/lib/email-templates');
      const { sendSMS } = await import('@/lib/sms');
      const { smsTemplates } = await import('@/lib/sms');
      
      // Get user details for notification
      const userEmail = session.user.email;
      const userName = session.user.name || session.user.username || 'User';
      
      // Send email notification to admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      if (adminEmail) {
        const emailTemplate = contactEmailTemplates.newContactMessageAdmin({
          userName,
          userEmail: userEmail || 'No email',
          subject: subject.trim(),
          message: message.trim(),
          category: categories.find(cat => cat.id === parseInt(category))?.name || 'Unknown',
          messageId: messageId
        });
        
        await sendMail({
          sendTo: adminEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
      }
      
      // Send SMS notification to admin (if configured)
      const adminPhone = process.env.ADMIN_PHONE;
      if (adminPhone) {
        const smsMessage = smsTemplates.newContactMessageAdminSMS(userName, subject.trim());
        await sendSMS({
          to: adminPhone,
          message: smsMessage
        });
      }
      
    } catch (notificationError) {
      console.error('Error sending admin notification:', notificationError);
      // Don't fail the main request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.'
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

// GET - Get contact form data (categories, settings)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Contact Support GET - Session user:', session.user);

    // Import contact db
    const { contactDB } = await import('@/lib/contact-db');

    // Get contact settings
    const contactSettings = await contactDB.getContactSettings();

    // Check if contact system is enabled
    if (!contactSettings?.contactSystemEnabled) {
      return NextResponse.json(
        { error: 'Contact system is currently disabled' },
        { status: 403 }
      );
    }

    // Get contact categories
    const categories = await contactDB.getContactCategories();

    // Get user's pending contact count
    const maxPendingContactsStr = contactSettings.maxPendingContacts || '3';
    let userPendingCount = 0;
    let canSubmit = true;

    if (maxPendingContactsStr.toLowerCase() === 'unlimited') {
      canSubmit = true;
    } else {
      userPendingCount = await contactDB.countContactMessages({
        userId: session.user.id,
        status: ['Unread', 'Read']
      });
      const maxPendingContacts = parseInt(maxPendingContactsStr);
      canSubmit = userPendingCount < maxPendingContacts;
    }

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name
        })),
        userPendingCount,
        maxPendingContacts: maxPendingContactsStr,
        canSubmit
      }
    });

  } catch (error) {
    console.error('Error getting contact form data:', error);
    return NextResponse.json(
      { error: 'Failed to load contact form data' },
      { status: 500 }
    );
  }
}
