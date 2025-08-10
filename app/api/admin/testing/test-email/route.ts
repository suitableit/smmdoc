import { auth } from '@/auth';
import { sendMail } from '@/lib/nodemailer';
import { emailTemplates, transactionEmailTemplates } from '@/lib/email-templates';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { type, amount, transaction_id } = body;
    
    // Get admin email for testing
    const testEmail = session.user.email || process.env.ADMIN_EMAIL || 'admin@example.com';
    
    let emailData;
    
    switch (type) {
      case 'payment_success':
        emailData = emailTemplates.paymentSuccess({
          userName: 'Test User',
          userEmail: testEmail,
          transactionId: transaction_id || 'TEST-TXN-123',
          amount: (parseFloat(amount) || 100).toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: 'test-user-id'
        });
        break;
        
      case 'payment_cancelled':
        emailData = emailTemplates.paymentCancelled({
          userName: 'Test User',
          userEmail: testEmail,
          transactionId: transaction_id || 'TEST-TXN-123',
          amount: (parseFloat(amount) || 100).toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: 'test-user-id'
        });
        break;
        
      case 'admin_pending':
        emailData = emailTemplates.adminPendingTransaction({
          userName: 'Test User',
          userEmail: testEmail,
          transactionId: transaction_id || 'TEST-TXN-123',
          amount: (parseFloat(amount) || 100).toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: 'test-user-id',
          phone: '+8801712345678'
        });
        break;
        
      case 'admin_approved':
        emailData = transactionEmailTemplates.adminAutoApproved({
          userName: 'Test User',
          userEmail: testEmail,
          transactionId: transaction_id || 'TEST-TXN-123',
          amount: (parseFloat(amount) || 100).toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: 'test-user-id'
        });
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }
    
    // Send test email
    const emailSent = await sendMail({
      sendTo: testEmail,
      subject: `[TEST] ${emailData.subject}`,
      html: emailData.html
    });
    
    if (emailSent) {
      console.log(`Test email sent successfully to ${testEmail}`);
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
        data: {
          type,
          recipient: testEmail,
          subject: emailData.subject
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send test email' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email', details: String(error) },
      { status: 500 }
    );
  }
}
