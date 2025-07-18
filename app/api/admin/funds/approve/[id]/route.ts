import { auth } from '@/auth';
import { db } from '@/lib/db';
import { emailTemplates } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    if (!transactionId || isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Valid transaction ID is required' },
        { status: 400 }
      );
    }

    // Find the transaction
    const transaction = await db.addFund.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Check if transaction is already approved
    if (transaction.status === 'Success') {
      return NextResponse.json(
        { error: 'Transaction is already approved' },
        { status: 400 }
      );
    }
    
    // Check if transaction is pending
    if (transaction.admin_status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction is not pending approval' },
        { status: 400 }
      );
    }
    
    try {
      // Use Prisma transaction to ensure both operations succeed or fail together
      await db.$transaction(async (prisma) => {
        // Update the payment status
        await prisma.addFund.update({
          where: { id: transactionId },
          data: {
            status: "Success",
            admin_status: "Success",
            updatedAt: new Date(),
          }
        });
        
        // Update user balance
        const user = await prisma.user.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount },
            total_deposit: { increment: transaction.amount }
          }
        });
        
        console.log(`User ${transaction.userId} balance updated. New balance: ${user.balance}`);
      });

      // Send success email to user
      if (transaction.user.email) {
        const emailData = emailTemplates.paymentSuccess({
          userName: transaction.user.name || 'Customer',
          userEmail: transaction.user.email,
          transactionId: transaction.transaction_id || transaction.invoice_id,
          amount: transaction.amount,
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: transaction.userId
        });
        
        await sendMail({
          sendTo: transaction.user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      }

      // Send admin notification email
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminEmailData = emailTemplates.adminAutoApproved({
        userName: transaction.user.name || 'Unknown User',
        userEmail: transaction.user.email || '',
        transactionId: transaction.transaction_id || transaction.invoice_id,
        amount: transaction.amount,
        currency: 'BDT',
        date: new Date().toLocaleDateString(),
        userId: transaction.userId
      });
      
      await sendMail({
        sendTo: adminEmail,
        subject: adminEmailData.subject,
        html: adminEmailData.html
      });
      
      return NextResponse.json({
        success: true,
        message: 'Transaction approved successfully',
        data: {
          transactionId: transaction.id,
          amount: transaction.amount,
          userId: transaction.userId,
          status: 'Success'
        }
      });
    } catch (transactionError) {
      console.error("Error updating payment and user balance:", transactionError);
      return NextResponse.json(
        { error: "Failed to approve transaction" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error approving transaction:', error);
    return NextResponse.json(
      { error: 'Failed to approve transaction', details: String(error) },
      { status: 500 }
    );
  }
}
