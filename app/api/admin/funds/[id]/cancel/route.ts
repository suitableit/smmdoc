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
    
    // Check if transaction is in pending status
    if (transaction.admin_status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction is not in pending status' },
        { status: 400 }
      );
    }
    
    try {
      // Update the transaction status to cancelled
      await db.addFund.update({
        where: { id: transactionId },
        data: {
          status: "Cancelled",
          admin_status: "Cancelled",
        }
      });

      // Send cancellation email to user
      if (transaction.user.email) {
        const emailData = emailTemplates.paymentCancelled({
          userName: transaction.user.name || 'Customer',
          userEmail: transaction.user.email,
          transactionId: transaction.transaction_id || '0',
          amount: transaction.amount.toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: transaction.userId.toString()
        });

        await sendMail({
          sendTo: transaction.user.email,
          subject: emailData.subject,
          html: emailData.html
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: {
          id: transaction.id,
          status: 'Cancelled',
          amount: transaction.amount,
          userId: transaction.userId
        }
      });
      
    } catch (transactionError) {
      console.error("Error cancelling transaction:", transactionError);
      return NextResponse.json(
        { error: "Failed to cancel transaction" },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json(
      { error: 'Failed to cancel transaction' },
      { status: 500 }
    );
  }
}
