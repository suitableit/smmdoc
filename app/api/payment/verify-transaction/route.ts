import { db } from '@/lib/db';
import { emailTemplates, transactionEmailTemplates } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice_id, transaction_id, phone } = body;

    console.log('Verify transaction request:', {
      invoice_id,
      transaction_id,
      phone,
    });

    if (!invoice_id) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    const payment = await db.addFunds.findUnique({
      where: { invoice_id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (payment.status === 'Success') {
      return NextResponse.json({
        status: 'COMPLETED',
        message: 'Payment already verified and completed',
        payment: {
          invoice_id: payment.invoice_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
        },
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Payment gateway API key not configured' },
        { status: 500 }
      );
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_UDDOKTAPAY_BASE_URL || 'https://pay.smmdoc.com/api/verify-payment';
      
      const verificationResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'RT-UDDOKTAPAY-API-KEY': apiKey,
        },
        body: JSON.stringify({ invoice_id }),
      });

      let isSuccessful = false;
      let verificationStatus = 'PENDING';
      let verificationData: any = null;

      if (verificationResponse.ok) {
        verificationData = await verificationResponse.json();
        console.log('UddoktaPay verification response:', verificationData);

        // Update payment record with data from UddoktaPay response
        if (verificationData.transaction_id) {
          transaction_id = verificationData.transaction_id;
        }
        if (verificationData.sender_number) {
          phone = verificationData.sender_number;
        }

        if (
          verificationData.status === 'COMPLETED' ||
          verificationData.status === 'SUCCESS'
        ) {
          isSuccessful = true;
          verificationStatus = 'COMPLETED';
        } else if (verificationData.status === 'PENDING') {
          verificationStatus = 'PENDING';
        } else if (
          verificationData.status === 'CANCELLED' ||
          verificationData.status === 'FAILED' ||
          verificationData.status === 'ERROR'
        ) {
          verificationStatus = 'CANCELLED';
        } else {
          verificationStatus = 'PENDING';
        }
      } else {
        const errorText = await verificationResponse.text();
        console.error('UddoktaPay verification API error:', errorText);
        verificationStatus = 'PENDING';
      }

      console.log('Verification result:', { isSuccessful, verificationStatus });

      if (isSuccessful && payment.user) {
        try {
          await db.$transaction(async (prisma) => {
            await prisma.addFunds.update({
              where: { invoice_id },
              data: {
                status: 'Success',
                admin_status: 'approved',
                transaction_id: transaction_id || payment.transaction_id,
                sender_number: phone || payment.sender_number,
                payment_method: verificationData?.payment_method || payment.payment_method || 'UddoktaPay',
              },
            });

            const originalAmount = payment.original_amount || payment.amount;

            const userSettings = await prisma.userSettings.findFirst();
            let bonusAmount = 0;

            if (userSettings && userSettings.bonusPercentage > 0) {
              bonusAmount =
                (originalAmount * userSettings.bonusPercentage) / 100;
            }

            const totalAmountToAdd = originalAmount + bonusAmount;

            const user = await prisma.users.update({
              where: { id: payment.userId },
              data: {
                balance: { increment: totalAmountToAdd },
                balanceUSD: { increment: payment.amount },
                total_deposit: { increment: originalAmount },
              },
            });

            console.log(
              `User ${payment.userId} balance updated. New balance: ${user.balance}. Original amount: ${originalAmount}, Bonus: ${bonusAmount}, Total added: ${totalAmountToAdd}`
            );
          });

          if (payment.user.email) {
            const emailData = emailTemplates.paymentSuccess({
              userName: payment.user.name || 'Customer',
              userEmail: payment.user.email,
              transactionId: transaction_id,
              amount: payment.amount.toString(),
              currency: payment.currency || 'USD',
              date: new Date().toLocaleDateString(),
              userId: payment.userId.toString(),
            });

            await sendMail({
              sendTo: payment.user.email,
              subject: emailData.subject,
              html: emailData.html,
            });
          }

          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminEmailData = transactionEmailTemplates.adminAutoApproved({
            userName: payment.user.name || 'Unknown User',
            userEmail: payment.user.email || '',
            transactionId: transaction_id,
            amount: payment.amount.toString(),
            currency: 'BDT',
            date: new Date().toLocaleDateString(),
            userId: payment.userId.toString(),
          });

          await sendMail({
            sendTo: adminEmail,
            subject: adminEmailData.subject,
            html: adminEmailData.html,
          });

          return NextResponse.json({
            status: 'COMPLETED',
            message: 'Payment verified and completed successfully',
            payment: {
              invoice_id: payment.invoice_id,
              amount: payment.amount,
              status: 'Success',
              transaction_id: transaction_id,
            },
          });
        } catch (transactionError) {
          console.error(
            'Error updating payment and user balance:',
            transactionError
          );
          return NextResponse.json(
            { error: 'Failed to update payment status' },
            { status: 500 }
          );
        }
      } else if (verificationStatus === 'PENDING') {
        await db.addFunds.update({
          where: { invoice_id },
          data: {
            transaction_id: transaction_id,
            sender_number: phone,
            admin_status: 'pending',
          },
        });

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminEmailData = emailTemplates.adminPendingReview({
          userName: payment.user?.name || 'Unknown User',
          userEmail: payment.user?.email || '',
          transactionId: transaction_id,
          amount: payment.amount.toString(),
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: payment.userId.toString(),
          phone: phone,
        });

        await sendMail({
          sendTo: adminEmail,
          subject: adminEmailData.subject,
          html: adminEmailData.html,
        });

        return NextResponse.json({
          status: 'PENDING',
          message: 'Payment is being processed. Please wait for verification.',
          payment: {
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            status: 'Processing',
            transaction_id: transaction_id,
          },
        });
      } else {
        await db.addFunds.update({
          where: { invoice_id },
          data: {
            status: 'Cancelled',
            admin_status: 'cancelled',
            transaction_id: transaction_id,
            sender_number: phone,
          },
        });

        return NextResponse.json({
          status: 'CANCELLED',
          message: 'Payment verification failed or was cancelled',
          payment: {
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            status: 'Cancelled',
            transaction_id: transaction_id,
          },
        });
      }
    } catch (verificationError) {
      console.error('Payment verification error:', verificationError);
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', details: String(error) },
      { status: 500 }
    );
  }
}
