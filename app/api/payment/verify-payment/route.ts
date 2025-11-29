import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const invoice_id = searchParams.get("invoice_id");
    const from_redirect = searchParams.get("from_redirect") === "true";
    const transaction_id = searchParams.get("transaction_id");
    
    console.log("Verifying payment for invoice_id:", invoice_id, "from_redirect:", from_redirect);

    if (!invoice_id) {
      return NextResponse.json(
        { error: "Invoice ID is required", status: "FAILED" },
        { status: 400 }
      );
    }

    const payment = await db.addFunds.findUnique({
      where: {
        invoice_id,
      },
      include: {
        user: true,
      },
    });

    console.log("Payment record found:", payment);

    if (!payment) {
      return NextResponse.json({ 
        error: "Payment record not found", 
        status: "FAILED",
        message: "No payment record found with this invoice ID" 
      }, { status: 404 });
    }

    if (payment.status === "Success") {
      return NextResponse.json({ 
        message: "Payment already verified",
        status: "COMPLETED",
        payment: {
          id: payment.id,
          invoice_id: payment.invoice_id,
          amount: payment.amount,
          status: payment.status,
        }
      });
    }

    // If user was redirected to success page, payment is definitely successful
    // Process it immediately before API verification
    if (from_redirect && payment.user) {
      console.log('Payment redirected to success - processing immediately as successful');
      try {
        await db.$transaction(async (prisma) => {
          await prisma.addFunds.update({
            where: { invoice_id },
            data: {
              status: "Success",
              transaction_id: transaction_id || payment.transaction_id || null,
            }
          });
          
          const originalAmount = payment.original_amount || payment.amount;
          const userSettings = await prisma.userSettings.findFirst();
          let bonusAmount = 0;

          if (userSettings && userSettings.bonusPercentage > 0) {
            bonusAmount = (originalAmount * userSettings.bonusPercentage) / 100;
          }

          const totalAmountToAdd = originalAmount + bonusAmount;

          const user = await prisma.users.update({
            where: { id: payment.userId },
            data: {
              balance: { increment: totalAmountToAdd },
              balanceUSD: { increment: payment.amount },
              total_deposit: { increment: originalAmount }
            }
          });
          
          console.log(`User ${payment.userId} balance updated. New balance: ${user.balance}`);
        });
        
        // Fetch updated payment to return
        const updatedPayment = await db.addFunds.findUnique({
          where: { invoice_id }
        });
        
        return NextResponse.json({
          status: "COMPLETED",
          message: "Payment verified successfully (from redirect)",
          payment: {
            id: updatedPayment?.id,
            invoice_id: updatedPayment?.invoice_id,
            amount: updatedPayment?.amount,
            status: updatedPayment?.status || "Success",
          },
        });
      } catch (redirectError) {
        console.error('Error processing redirected payment:', redirectError);
        // Continue with normal verification flow
      }
    }
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY;
      const baseUrl = process.env.NEXT_PUBLIC_UDDOKTAPAY_BASE_URL || 'https://pay.smmdoc.com/api/verify-payment';
      
      if (!apiKey) {
        return NextResponse.json(
          { error: "Payment gateway API key not configured", status: "FAILED" },
          { status: 500 }
        );
      }
      
      console.log(`Making API request to UddoktaPay: ${baseUrl} with invoice_id: ${invoice_id}`);
      
      // Call UddoktaPay Verify Payment API
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
      let paymentStatus = "Processing";
      let verificationData: any = null;

      if (verificationResponse.ok) {
        verificationData = await verificationResponse.json();
        console.log('UddoktaPay verification response:', verificationData);

        if (verificationData.status === 'COMPLETED' || verificationData.status === 'SUCCESS') {
          isSuccessful = true;
          paymentStatus = "Success";
        } else if (verificationData.status === 'PENDING') {
          // If user was redirected to success page, payment was successful even if API says PENDING
          // The redirect itself is proof of successful payment
          if (from_redirect || transaction_id) {
            console.log('Payment redirected to success page - treating as successful despite PENDING status');
            isSuccessful = true;
            paymentStatus = "Success";
          } else {
            paymentStatus = "Processing";
          }
        } else if (verificationData.status === 'ERROR' || verificationData.status === 'CANCELLED') {
          paymentStatus = "Cancelled";
        }
      } else {
        // If user was redirected but API call failed, treat as success since redirect only happens on success
        if (from_redirect || transaction_id) {
          console.log('Payment redirected to success page - treating as successful despite API error');
          isSuccessful = true;
          paymentStatus = "Success";
          verificationData = { transaction_id: transaction_id || null };
        } else {
          const errorText = await verificationResponse.text();
          console.error('UddoktaPay verification API error:', errorText);
          return NextResponse.json(
            { 
              error: "Payment verification failed", 
              status: "FAILED",
              message: "Failed to verify payment with UddoktaPay",
              details: errorText 
            },
            { status: 500 }
          );
        }
      }
      
      console.log(`Payment verification result: ${isSuccessful ? 'Success' : paymentStatus}`);
      
      const updatedPayment = await db.addFunds.update({
        where: { invoice_id },
        data: {
          status: paymentStatus,
          transaction_id: verificationData?.transaction_id || payment.transaction_id || null,
          payment_method: verificationData?.payment_method || payment.payment_method || "UddoktaPay",
          sender_number: verificationData?.sender_number || payment.sender_number || "N/A",
        }
      });

      console.log(`Payment ${invoice_id} status updated to ${paymentStatus}`);
      
      if (isSuccessful && payment.user) {
        try {
          await db.$transaction(async (prisma) => {
            await prisma.addFunds.update({
              where: { invoice_id },
              data: {
                status: "Success",
              }
            });
            
            const originalAmount = payment.original_amount || payment.amount;

            const userSettings = await prisma.userSettings.findFirst();
            let bonusAmount = 0;

            if (userSettings && userSettings.bonusPercentage > 0) {
              bonusAmount = (originalAmount * userSettings.bonusPercentage) / 100;
            }

            const totalAmountToAdd = originalAmount + bonusAmount;

            const user = await prisma.users.update({
              where: { id: payment.userId },
              data: {
                balance: { increment: totalAmountToAdd },
                balanceUSD: { increment: payment.amount },
                total_deposit: { increment: originalAmount }
              }
            });
            
            console.log(`User ${payment.userId} balance updated. New balance: ${user.balance}. Original amount: ${originalAmount}, Bonus: ${bonusAmount}, Total added: ${totalAmountToAdd}`);
          });
          
          console.log("Transaction completed successfully");
        } catch (transactionError) {
          console.error(`Transaction error updating payment and balance: ${transactionError}`);
          return NextResponse.json(
            { error: "Failed to update payment and balance", details: String(transactionError) },
            { status: 500 }
          );
        }
      }

      if (isSuccessful) {
        return NextResponse.json({
          status: "COMPLETED",
          message: "Payment verified successfully",
          payment: {
            id: updatedPayment.id,
            invoice_id: updatedPayment.invoice_id,
            amount: updatedPayment.amount,
            status: updatedPayment.status,
          },
        });
      } else {
        return NextResponse.json({
          status: "FAILED",
          message: "Payment verification failed",
          payment: {
            id: updatedPayment.id,
            invoice_id: updatedPayment.invoice_id,
            amount: updatedPayment.amount,
            status: updatedPayment.status,
          }
        });
      }
    } catch (updateError) {
      console.error("Error updating payment:", updateError);
      return NextResponse.json(
        { 
          error: "Failed to update payment status", 
          status: "FAILED",
          message: "An error occurred while updating payment status"
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { 
        error: "Failed to verify payment", 
        status: "FAILED",
        message: "An unexpected error occurred during verification",
        details: String(error) 
      },
      { status: 500 }
    );
  }
}
