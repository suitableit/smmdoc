import { auth } from '@/auth';
import { db } from '@/lib/db';
import { sendMail } from '@/lib/nodemailer';
import { emailTemplates } from '@/lib/email-templates';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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
    
    const transactionId = params.id;
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
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
    
    // Check if transaction is in pending status
    if (transaction.admin_status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction is not in pending status' },
        { status: 400 }
      );
    }
    
    try {
      // Use Prisma transaction to ensure both operations succeed or fail together
      await db.$transaction(async (prisma) => {
        // Update the transaction status
        await prisma.addFund.update({
          where: { id: transactionId },
          data: {
            status: "Success",
            admin_status: "approved",
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

      // Send approval email to user
      if (transaction.user.email) {
        const emailData = emailTemplates.paymentSuccess({
          userName: transaction.user.name || 'Customer',
          userEmail: transaction.user.email,
          transactionId: transaction.transaction_id || 'N/A',
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

      return NextResponse.json({
        success: true,
        message: 'Transaction approved successfully',
        data: {
          id: transaction.id,
          status: 'approved',
          amount: transaction.amount,
          userId: transaction.userId
        }
      });
      
    } catch (transactionError) {
      console.error("Error approving transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to approve transaction" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error approving transaction:', error);
    return NextResponse.json(
      { error: 'Failed to approve transaction' },
      { status: 500 }
    );
  }
}
