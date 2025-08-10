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

    // Find the payment record in the database
    const payment = await db.addFund.findUnique({
      where: { invoice_id },
      include: { user: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // If payment is already successful, return success
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

    // Live payment gateway verification
    const apiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Payment gateway API key not configured' },
        { status: 500 }
      );
    }

    try {
      // Call UddoktaPay live verification API
      const verificationResponse = await fetch(
        `https://pay.smmdoc.com/api/verify-payment/${invoice_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'RT-UDDOKTAPAY-API-KEY': apiKey,
          },
          body: JSON.stringify({ transaction_id, phone }),
        }
      );

      // Handle live API response
      let isSuccessful = false;
      let verificationStatus = 'PENDING';

      if (verificationResponse.ok) {
        const verificationData = await verificationResponse.json();
        console.log('UddoktaPay verification response:', verificationData);

        // Handle UddoktaPay live API response
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
          verificationData.status === 'FAILED'
        ) {
          verificationStatus = 'CANCELLED';
        } else {
          // Default to pending for unknown statuses
          verificationStatus = 'PENDING';
        }
      } else {
        console.error(
          'UddoktaPay verification API error:',
          await verificationResponse.text()
        );
        // If API call fails, default to pending for manual review
        verificationStatus = 'PENDING';
      }

      console.log('Verification result:', { isSuccessful, verificationStatus });

      // If the payment was successful, update the user's balance in a transaction
      if (isSuccessful && payment.user) {
        try {
          // Use Prisma transaction to ensure both operations succeed or fail together
          await db.$transaction(async (prisma) => {
            // Update the payment status
            await prisma.addFund.update({
              where: { invoice_id },
              data: {
                status: 'Success',
                admin_status: 'approved',
                transaction_id: transaction_id,
                sender_number: phone,
              },
            });

            // Use original amount if available, otherwise calculate from USD amount
            const originalAmount = payment.original_amount || payment.amount;

            // Check user settings for payment bonus
            const userSettings = await prisma.userSettings.findFirst();
            let bonusAmount = 0;

            if (
              userSettings?.paymentBonusEnabled &&
              userSettings?.bonusPercentage > 0
            ) {
              bonusAmount =
                (originalAmount * userSettings.bonusPercentage) / 100;
            }

            const totalAmountToAdd = originalAmount + bonusAmount;

            // Update user balance with original currency amount plus bonus
            const user = await prisma.user.update({
              where: { id: payment.userId },
              data: {
                balance: { increment: totalAmountToAdd }, // Add original amount + bonus in user's currency
                balanceUSD: { increment: payment.amount }, // USD balance for internal calculations
                total_deposit: { increment: originalAmount }, // Track only actual deposit, not bonus
              },
            });

            console.log(
              `User ${payment.userId} balance updated. New balance: ${user.balance}. Original amount: ${originalAmount}, Bonus: ${bonusAmount}, Total added: ${totalAmountToAdd}`
            );
          });

          // Send success email to user
          if (payment.user.email) {
            const emailData = emailTemplates.paymentSuccess({
              userName: payment.user.name || 'Customer',
              userEmail: payment.user.email,
              transactionId: transaction_id,
              amount: payment.amount.toString(),
              currency: 'BDT',
              date: new Date().toLocaleDateString(),
              userId: payment.userId.toString(),
            });

            await sendMail({
              sendTo: payment.user.email,
              subject: emailData.subject,
              html: emailData.html,
            });
          }

          // Send admin notification email
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
        // Update payment with transaction ID but keep status as Processing and admin_status as pending
        await db.addFund.update({
          where: { invoice_id },
          data: {
            transaction_id: transaction_id,
            sender_number: phone,
            admin_status: 'pending',
          },
        });

        // Send admin notification for pending transaction
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminEmailData = emailTemplates.adminPendingTransaction({
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
        // Payment failed or cancelled
        await db.addFund.update({
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
