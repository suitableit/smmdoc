import { auth } from '@/auth';
import { db } from '@/lib/db';
import { emailTemplates, transactionEmailTemplates } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const transaction = await db.addFunds.findUnique({
      where: { id: transactionId },
      include: { user: true }
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    let updateData: {
      status?: string;
      admin_status?: string;
    } = {};
    let balanceChange = 0;
    let notificationMessage = '';

    const result = await db.$transaction(async (prisma) => {
      const currentUser = await prisma.users.findUnique({
        where: { id: transaction.userId },
        select: { balance: true, name: true, email: true }
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      if (status === 'approved' || status === 'Success') {
        updateData = {
          status: 'Success',
          admin_status: 'Success'
        };

        if (transaction.admin_status !== 'Success' && transaction.admin_status !== 'approved') {
          balanceChange = transaction.amount;
          await prisma.users.update({
            where: { id: transaction.userId },
            data: {
              balance: { increment: transaction.amount },
              total_deposit: { increment: transaction.amount }
            }
          });
          notificationMessage = `Your deposit of à§³${transaction.amount} has been approved and added to your account.`;
        }
      } else if (status === 'cancelled' || status === 'Cancelled') {
        updateData = {
          status: 'Cancelled',
          admin_status: 'Cancelled'
        };
        notificationMessage = `Your deposit of à§³${transaction.amount} has been cancelled.`;
      } else if (status === 'Pending' || status === 'pending') {
        updateData = {
          status: 'Processing',
          admin_status: 'Pending'
        };

        if (transaction.admin_status === 'Success') {
          if (currentUser.balance >= transaction.amount) {
            balanceChange = -transaction.amount;
            await prisma.users.update({
              where: { id: transaction.userId },
              data: {
                balance: { decrement: transaction.amount },
                total_deposit: { decrement: transaction.amount }
              }
            });
            notificationMessage = `Your transaction of à§³${transaction.amount} has been moved to pending status. Amount has been deducted from your account.`;
          } else {
            const deductAmount = currentUser.balance;
            balanceChange = -deductAmount;
            await prisma.users.update({
              where: { id: transaction.userId },
              data: {
                balance: 0,
                total_deposit: { decrement: deductAmount }
              }
            });
            notificationMessage = `Your transaction of à§³${transaction.amount} has been moved to pending status. Available balance of à§³${deductAmount} has been deducted from your account.`;
          }
        } else {
          notificationMessage = `Your deposit of à§³${transaction.amount} is now pending review.`;
        }
      } else if (status === 'Suspicious') {
        updateData = {
          status: 'Processing',
          admin_status: 'Suspicious'
        };
        notificationMessage = `Your transaction of à§³${transaction.amount} is under review for suspicious activity.`;
      } else {
        updateData = {
          admin_status: status
        };
        notificationMessage = `Your transaction status has been updated to ${status}.`;
      }

      const updatedTransaction = await prisma.addFunds.update({
        where: { id: transactionId },
        data: updateData
      });

      return { updatedTransaction, currentUser, balanceChange, notificationMessage };
    });

    try {
      if (result.currentUser.email && notificationMessage) {
        const emailData = emailTemplates.paymentSuccess({
          userName: result.currentUser.name || 'Customer',
          userEmail: result.currentUser.email,
          transactionId: (transaction.transaction_id || transaction.id.toString()),
          amount: (transaction.currency === 'USD' ? transaction.amount : transaction.amount * 120).toString(),
          currency: transaction.currency || 'BDT',
          date: new Date().toLocaleDateString(),
          userId: transaction.userId.toString()
        });

        await sendMail({
          sendTo: result.currentUser.email,
          subject: `Transaction Status Updated - ${updateData.admin_status || status}`,
          html: emailData.html.replace('Payment Successful!', `Transaction ${updateData.admin_status || status}`)
            .replace('Your payment has been successfully processed', notificationMessage)
        });
      }

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminEmailData = transactionEmailTemplates.adminAutoApproved({
        userName: result.currentUser.name || 'Unknown User',
        userEmail: result.currentUser.email || '',
        transactionId: (transaction.transaction_id || transaction.id.toString()),
        amount: transaction.amount.toString(),
        currency: 'BDT',
        date: new Date().toLocaleDateString(),
        userId: transaction.userId.toString()
      });

      await sendMail({
        sendTo: adminEmail,
        subject: `Transaction Status Updated by Admin - ${updateData.admin_status || status}`,
        html: adminEmailData.html.replace('Auto-Approved', `Status Updated to ${updateData.admin_status || status}`)
      });
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: `Transaction updated to ${updateData.admin_status || status} successfully`,
      data: result.updatedTransaction,
      balanceChange: result.balanceChange,
      notification: result.notificationMessage
    });

  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const transaction = await db.addFunds.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.userId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const transformedTransaction = {
      id: transaction.id,
      invoice_id: transaction.invoice_id || transaction.id,
      amount: transaction.amount,
      status: mapStatus(transaction.status || 'Processing'),
      method: transaction.method || 'uddoktapay',
      payment_method: transaction.payment_method || 'UddoktaPay',
      transaction_id: transaction.transaction_id || transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      transaction_type: 'deposit',
      reference_id: transaction.order_id,
      sender_number: transaction.sender_number,
      phone: transaction.sender_number,
      currency: transaction.currency || 'BDT',
      admin_status: transaction.admin_status,
    };

    return NextResponse.json(transformedTransaction);

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

function mapStatus(status: string): string {
  switch (status?.toLowerCase()) {
    case 'success':
    case 'completed':
      return 'success';
    case 'processing':
    case 'pending':
      return 'pending';
    case 'failed':
    case 'cancelled':
      return 'failed';
    default:
      return 'pending';
  }
}
