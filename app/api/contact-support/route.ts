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

    // Check user's pending contact limit
    const userPendingCount = await contactDB.countContactMessages({
      userId: session.user.id,
      status: ['Unread', 'Read']
    });
    const maxPendingContacts = parseInt(contactSettings.maxPendingContacts || '3');

    if (userPendingCount >= maxPendingContacts) {
      return NextResponse.json(
        {
          error: `You have reached the maximum limit of ${maxPendingContacts} pending contacts. Please wait for a response to your previous messages.`
        },
        { status: 429 }
      );
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
    await contactDB.createContactMessage({
      userId: session.user.id,
      subject: subject.trim(),
      message: message.trim(),
      categoryId: parseInt(category),
      attachments: attachmentsJson
    });

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
    const userPendingCount = await contactDB.countContactMessages({
      userId: session.user.id,
      status: ['Unread', 'Read']
    });
    const maxPendingContacts = parseInt(contactSettings.maxPendingContacts || '3');

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name
        })),
        userPendingCount,
        maxPendingContacts,
        canSubmit: userPendingCount < maxPendingContacts
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
