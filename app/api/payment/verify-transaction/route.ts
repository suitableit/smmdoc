import { db } from '@/lib/db';
import { sendMail } from '@/lib/nodemailer';
import { emailTemplates } from '@/lib/email-templates';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { invoice_id, transaction_id, phone } = body;
    
    console.log("Verify transaction request:", { invoice_id, transaction_id, phone });
    
    if (!invoice_id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }
    
    // Find the payment record in the database
    const payment = await db.addFund.findUnique({
      where: { invoice_id },
      include: { user: true }
    });
    
    if (!payment) {
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      );
    }
    
    // If payment is already successful, return success
    if (payment.status === "Success") {
      return NextResponse.json({
        status: "COMPLETED",
        message: "Payment already verified and completed",
        payment: {
          invoice_id: payment.invoice_id,
          amount: payment.amount,
          status: payment.status,
          transaction_id: payment.transaction_id
        }
      });
    }
    
    // Simulate payment gateway verification
    // In a real implementation, you would call the UddoktaPay API here
    const apiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY || '982d381360a69d419689740d9f2e26ce36fb7a50';
    
    try {
      // Mock verification - in real implementation, call UddoktaPay verification API
      // const verificationResponse = await fetch(`https://sandbox.uddoktapay.com/api/verify-payment/${invoice_id}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'RT-UDDOKTAPAY-API-KEY': apiKey,
      //   },
      //   body: JSON.stringify({ transaction_id, phone })
      // });
      
      // UddoktaPay Sandbox simulation based on response type
      let isSuccessful = false;
      let verificationStatus = "PENDING";

      // Check if we have a response type from UddoktaPay sandbox
      // This would come from the actual API call in production
      // For now, we'll simulate based on transaction_id patterns

      if (transaction_id) {
        // Simulate UddoktaPay sandbox responses:
        // - "Completed" response = Payment successful
        // - "Pending" response = Payment pending manual review
        // - Other responses = Payment failed/cancelled

        const lowerTransactionId = transaction_id.toLowerCase();

        if (lowerTransactionId.includes("completed") || lowerTransactionId.includes("success")) {
          isSuccessful = true;
          verificationStatus = "COMPLETED";
        } else if (lowerTransactionId.includes("pending")) {
          verificationStatus = "PENDING";
        } else if (lowerTransactionId.includes("fail") || lowerTransactionId.includes("cancel")) {
          verificationStatus = "CANCELLED";
        } else {
          // Default behavior for unrecognized transaction IDs
          verificationStatus = "PENDING";
        }
      }
      
      console.log("Verification result:", { isSuccessful, verificationStatus });
      
      // If the payment was successful, update the user's balance in a transaction
      if (isSuccessful && payment.user) {
        try {
          // Use Prisma transaction to ensure both operations succeed or fail together
          await db.$transaction(async (prisma) => {
            // Update the payment status
            await prisma.addFund.update({
              where: { invoice_id },
              data: {
                status: "Success",
                admin_status: "approved",
                transaction_id: transaction_id,
                sender_number: phone,
              }
            });
            
            // Update user balance
            const user = await prisma.user.update({
              where: { id: payment.userId },
              data: {
                balance: { increment: payment.amount },
                total_deposit: { increment: payment.amount }
              }
            });
            
            console.log(`User ${payment.userId} balance updated. New balance: ${user.balance}`);
          });

          // Send success email to user
          if (payment.user.email) {
            const emailData = emailTemplates.paymentSuccess({
              userName: payment.user.name || 'Customer',
              userEmail: payment.user.email,
              transactionId: transaction_id,
              amount: payment.amount,
              currency: 'BDT',
              date: new Date().toLocaleDateString(),
              userId: payment.userId
            });

            await sendMail({
              sendTo: payment.user.email,
              subject: emailData.subject,
              html: emailData.html
            });
          }

          // Send admin notification email
          const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
          const adminEmailData = emailTemplates.adminAutoApproved({
            userName: payment.user.name || 'Unknown User',
            userEmail: payment.user.email || '',
            transactionId: transaction_id,
            amount: payment.amount,
            currency: 'BDT',
            date: new Date().toLocaleDateString(),
            userId: payment.userId
          });

          await sendMail({
            sendTo: adminEmail,
            subject: adminEmailData.subject,
            html: adminEmailData.html
          });
          
          return NextResponse.json({
            status: "COMPLETED",
            message: "Payment verified and completed successfully",
            payment: {
              invoice_id: payment.invoice_id,
              amount: payment.amount,
              status: "Success",
              transaction_id: transaction_id
            }
          });
        } catch (transactionError) {
          console.error("Error updating payment and user balance:", transactionError);
          return NextResponse.json(
            { error: "Failed to update payment status" },
            { status: 500 }
          );
        }
      } else if (verificationStatus === "PENDING") {
        // Update payment with transaction ID but keep status as Processing and admin_status as pending
        await db.addFund.update({
          where: { invoice_id },
          data: {
            transaction_id: transaction_id,
            sender_number: phone,
            admin_status: "pending",
          }
        });

        // Send admin notification for pending transaction
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminEmailData = emailTemplates.adminPendingTransaction({
          userName: payment.user?.name || 'Unknown User',
          userEmail: payment.user?.email || '',
          transactionId: transaction_id,
          amount: payment.amount,
          currency: 'BDT',
          date: new Date().toLocaleDateString(),
          userId: payment.userId,
          phone: phone
        });

        await sendMail({
          sendTo: adminEmail,
          subject: adminEmailData.subject,
          html: adminEmailData.html
        });
        
        return NextResponse.json({
          status: "PENDING",
          message: "Payment is being processed. Please wait for verification.",
          payment: {
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            status: "Processing",
            transaction_id: transaction_id
          }
        });
      } else {
        // Payment failed or cancelled
        await db.addFund.update({
          where: { invoice_id },
          data: {
            status: "Cancelled",
            admin_status: "cancelled",
            transaction_id: transaction_id,
            sender_number: phone,
          }
        });
        
        return NextResponse.json({
          status: "CANCELLED",
          message: "Payment verification failed or was cancelled",
          payment: {
            invoice_id: payment.invoice_id,
            amount: payment.amount,
            status: "Cancelled",
            transaction_id: transaction_id
          }
        });
      }
    } catch (verificationError) {
      console.error("Payment verification error:", verificationError);
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed", details: String(error) },
      { status: 500 }
    );
  }
}
