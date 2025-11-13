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

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    const body = await req.json();
    const { modifiedTransactionId, transactionType } = body;

    if (!transactionId || isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Valid transaction ID is required' },
        { status: 400 }
      );
    }

    if (transactionType === 'deposit' && !modifiedTransactionId?.trim()) {
      return NextResponse.json(
        { error: 'Transaction ID is required for deposit approval' },
        { status: 400 }
      );
    }

    const transaction = await db.addFunds.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.admin_status !== 'Pending' && transaction.admin_status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction is not in pending status' },
        { status: 400 }
      );
    }
    
    try {
      await db.$transaction(async (prisma) => {
        const updateData: any = {
          status: "Success",
          admin_status: "Success",
        };

        if (modifiedTransactionId?.trim()) {
          updateData.transaction_id = modifiedTransactionId.trim();
        }

        await prisma.addFunds.update({
          where: { id: transactionId },
          data: updateData
        });

        const user = await prisma.users.update({
          where: { id: transaction.userId },
          data: {
            balance: { increment: transaction.amount },
            total_deposit: { increment: transaction.amount }
          }
        });

        console.log(`User ${transaction.userId} balance updated. New balance: ${user.balance}`);
      });

      if (transaction.user.email) {
        const emailData = emailTemplates.paymentSuccess({
          userName: transaction.user.name || 'Customer',
          userEmail: transaction.user.email,
          transactionId: modifiedTransactionId?.trim() || transaction.transaction_id || 'N/A',
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
        message: 'Transaction approved successfully',
        data: {
          id: transaction.id,
          status: 'approved',
          amount: transaction.amount,
          userId: transaction.userId,
          transactionId: modifiedTransactionId?.trim() || transaction.transaction_id
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
