import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { emailTemplates } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { username, amount, action, notes } = body;

    // Validation
    if (!username || !amount || !action) {
      return NextResponse.json(
        {
          error: 'Username, amount, and action are required',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          error: 'Amount must be greater than 0',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    if (!['add', 'deduct'].includes(action)) {
      return NextResponse.json(
        {
          error: 'Action must be either "add" or "deduct"',
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await db.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        balance: true
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'User not found',
          success: false,
          data: null
        },
        { status: 404 }
      );
    }

    // Check if deducting more than available balance
    if (action === 'deduct' && user.balance < amount) {
      return NextResponse.json(
        {
          error: `Insufficient balance. User has ৳${user.balance}, trying to deduct ৳${amount}`,
          success: false,
          data: null
        },
        { status: 400 }
      );
    }

    // Use database transaction to ensure consistency
    const result = await db.$transaction(async (prisma) => {
      // Update user balance
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: action === 'add' 
            ? { increment: amount }
            : { decrement: amount },
          total_deposit: action === 'add' 
            ? { increment: amount }
            : { decrement: amount }
        }
      });

      // Create a transaction record for this manual balance adjustment
      const transactionRecord = await prisma.addFund.create({
        data: {
          userId: user.id,
          invoice_id: `MANUAL-${Date.now()}`,
          amount: amount,
          spent_amount: 0,
          fee: 0,
          email: user.email || '',
          name: user.name || '',
          status: 'Success',
          admin_status: 'Success',
          order_id: `MANUAL-${action.toUpperCase()}-${Date.now()}`,
          method: 'manual_adjustment',
          payment_method: 'Admin Manual Adjustment',
          sender_number: '',
          transaction_id: `MANUAL-${action.toUpperCase()}-${Date.now()}`,
          currency: 'BDT',
          notes: notes || `Manual ${action} by admin`
        }
      });

      return { updatedUser, transactionRecord };
    });

    // Send notification emails
    try {
      // Send email notification to user
      if (user.email) {
        const notificationMessage = action === 'add' 
          ? `৳${amount} has been added to your account by admin.`
          : `৳${amount} has been deducted from your account by admin.`;

        const emailData = emailTemplates.paymentSuccess({
          userName: user.name || 'Customer',
          userEmail: user.email,
          transactionId: result.transactionRecord.id,
          amount: amount,
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: user.id.toString()
        });

        await sendMail({
          sendTo: user.email,
          subject: `Balance ${action === 'add' ? 'Added' : 'Deducted'} - Manual Adjustment`,
          html: emailData.html
            .replace('Payment Successful!', `Balance ${action === 'add' ? 'Added' : 'Deducted'}`)
            .replace('Your payment has been successfully processed', notificationMessage)
            .replace('funds have been added to your account', `your new balance is ৳${result.updatedUser.balance}`)
        });
      }

      // Send admin notification
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminEmailData = emailTemplates.adminAutoApproved({
        userName: user.name || 'Unknown User',
        userEmail: user.email || '',
        transactionId: result.transactionRecord.id,
        amount: amount,
        currency: 'BDT',
        date: new Date().toLocaleDateString(),
        userId: user.id.toString()
      });

      await sendMail({
        sendTo: adminEmail,
        subject: `Manual Balance ${action === 'add' ? 'Addition' : 'Deduction'} - ${user.username}`,
        html: adminEmailData.html
          .replace('Auto-Approved', `Manual ${action === 'add' ? 'Addition' : 'Deduction'}`)
          .replace('has been automatically approved', `balance has been manually ${action === 'add' ? 'added' : 'deducted'} by admin`)
      });
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the transaction if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'add' ? 'added' : 'deducted'} ৳${amount} ${action === 'add' ? 'to' : 'from'} ${user.username}'s balance`,
      data: {
        userId: user.id,
        username: user.username,
        previousBalance: user.balance,
        newBalance: result.updatedUser.balance,
        amount: amount,
        action: action,
        transactionId: result.transactionRecord.id
      }
    });

  } catch (error) {
    console.error('Error updating user balance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user balance',
        success: false,
        data: null 
      },
      { status: 500 }
    );
  }
}
