import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// POST - Submit contact form
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Contact Support POST - Session user:', session.user);

    const data = await request.formData();
    const subject = data.get('subject') as string;
    const category = data.get('category') as string;
    const message = data.get('message') as string;
    const files = data.getAll('attachments') as File[];

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
      // Count unreplied messages (where adminReply is NULL or empty)
      const { db } = await import('@/lib/db');
      const userPendingCount = await db.contactMessage.count({
        where: {
          userId: session.user.id,
          OR: [
            { adminReply: null },
            { adminReply: '' }
          ]
        }
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

    // Process file attachments if any
    let attachmentsJson = null;
    if (files && files.length > 0) {
      const uploadedFiles = [];
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch {
        // Directory might already exist
      }
      
      for (const file of files) {
        if (file && file.name && file.size > 0) {
          // Validate file size (5MB limit)
          if (file.size > 5 * 1024 * 1024) {
            continue; // Skip files larger than 5MB
          }
          
          // Validate file type
          const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ];
          
          if (!allowedTypes.includes(file.type)) {
            continue; // Skip invalid file types
          }
          
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            
            // Generate encrypted filename
            const fileExtension = path.extname(file.name);
            const randomBytes = crypto.randomBytes(16).toString('hex');
            const timestamp = Date.now().toString();
            const hash = crypto.createHash('sha256').update(`${file.name}${timestamp}${randomBytes}`).digest('hex');
            const encryptedFilename = `${hash.substring(0, 16)}${fileExtension}`;
            const filepath = path.join(uploadsDir, encryptedFilename);
            
            // Write file
            await writeFile(filepath, buffer);
            
            // Store file info
            uploadedFiles.push({
              originalName: file.name,
              encryptedName: encryptedFilename,
              fileUrl: `/uploads/${encryptedFilename}`,
              fileSize: file.size,
              mimeType: file.type
            });
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            // Continue with other files
          }
        }
      }
      
      if (uploadedFiles.length > 0) {
        attachmentsJson = JSON.stringify(uploadedFiles);
      }
    }

    // Create contact message
    const messageId = await (async () => {
      await contactDB.createContactMessage({
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
      // Import the email config function at the top of the file
      const { getFromEmailAddress } = await import('@/lib/email-config');
      const adminEmail = process.env.ADMIN_EMAIL || await getFromEmailAddress();
      if (adminEmail) {
        const emailTemplate = contactEmailTemplates.newContactMessageAdmin({
          userName,
          userEmail: userEmail || 'No email',
          subject: subject.trim(),
          message: message.trim(),
          category: categories.find(cat => cat.id === parseInt(category))?.name || 'Unknown',
          messageId: messageId as number,
          attachments: attachmentsJson ? JSON.parse(attachmentsJson) : undefined
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
      // Count unreplied messages (where adminReply is NULL or empty)
      const { db } = await import('@/lib/db');
      userPendingCount = await db.contactMessage.count({
        where: {
          userId: session.user.id,
          OR: [
            { adminReply: null },
            { adminReply: '' }
          ]
        }
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
