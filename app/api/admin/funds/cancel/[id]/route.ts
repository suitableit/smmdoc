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
    
    // Check if transaction is already cancelled
    if (transaction.status === 'Cancelled') {
      return NextResponse.json(
        { error: 'Transaction is already cancelled' },
        { status: 400 }
      );
    }
    
    // Check if transaction is already approved
    if (transaction.status === 'Success') {
      return NextResponse.json(
        { error: 'Cannot cancel an approved transaction' },
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
      // Update the payment status to cancelled
      await db.addFund.update({
        where: { id: transactionId },
        data: {
          status: "Cancelled",
          admin_status: "cancelled",
          updatedAt: new Date(),
        }
      });

      // Send cancellation email to user
      if (transaction.user.email) {
        const emailData = emailTemplates.paymentCancelled({
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

      // Log admin action for audit trail
      console.log(`Admin ${session.user.id} cancelled transaction ${transactionId} for user ${transaction.userId}`);
      
      return NextResponse.json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: {
          transactionId: transaction.id,
          amount: transaction.amount,
          userId: transaction.userId,
          status: 'Cancelled'
        }
      });
    } catch (updateError) {
      console.error("Error updating payment status:", updateError);
      return NextResponse.json(
        { error: "Failed to cancel transaction" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json(
      { error: 'Failed to cancel transaction', details: String(error) },
      { status: 500 }
    );
  }
}
