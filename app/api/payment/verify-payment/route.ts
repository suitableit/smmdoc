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
    
    if (payment && payment.transaction_id && payment.transaction_id === invoice_id) {
      console.log('CRITICAL: Found corrupted data - transaction_id equals invoice_id! Fixing...');
      await db.addFunds.update({
        where: { invoice_id },
        data: { transaction_id: null }
      });
      const fixedPayment = await db.addFunds.findUnique({
        where: { invoice_id },
        include: { user: true },
      });
      if (fixedPayment) {
        payment.transaction_id = null;
      }
    }

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
          amount: payment.usd_amount,
          status: payment.status,
          transaction_id: payment.transaction_id,
        }
      });
    }
    
      const { getPaymentGatewayApiKey, getPaymentGatewayVerifyUrl } = await import('@/lib/payment-gateway-config');
      const apiKey = await getPaymentGatewayApiKey();
      const baseUrl = await getPaymentGatewayVerifyUrl();
      
      if (!apiKey) {
        return NextResponse.json(
          { error: "Payment gateway API key not configured. Please configure it in admin settings.", status: "FAILED" },
          { status: 500 }
        );
      }
      
      console.log(`Making API request to payment gateway: ${baseUrl} with invoice_id: ${invoice_id}`);
      
    let verificationData: any = null;
    let isSuccessful = false;
    let paymentStatus = "Processing";
    
    try {
      let verificationResponse;
      let attempts = from_redirect ? 3 : 1;
      let delay = 1000;
      
      for (let attempt = 1; attempt <= attempts; attempt++) {
        if (attempt > 1) {
          console.log(`Retry attempt ${attempt} for transaction_id (waiting ${delay}ms)...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
        
        verificationResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'RT-UDDOKTAPAY-API-KEY': apiKey,
          },
          body: JSON.stringify({ invoice_id }),
        });

        if (verificationResponse.ok) {
          const responseData = await verificationResponse.json();
          console.log(`=== UddoktaPay verification response (attempt ${attempt}) ===`);
          console.log('Full response:', JSON.stringify(responseData, null, 2));
          console.log('Response keys:', Object.keys(responseData));
          console.log('invoice_id in response:', responseData.invoice_id);
          console.log('transaction_id in response:', responseData.transaction_id);
          console.log('All response values:', Object.entries(responseData).map(([k, v]) => `${k}: ${v}`).join(', '));
          console.log('========================================================');

          const extractedTransactionId = responseData.transaction_id || 
                                        responseData.transactionId || 
                                        responseData.trx_id || 
                                        responseData.trxId ||
                                        responseData.transactionID ||
                                        responseData.data?.transaction_id ||
                                        responseData.data?.transactionId ||
                                        responseData.payment?.transaction_id ||
                                        null;
          
          if (extractedTransactionId && extractedTransactionId === responseData.invoice_id) {
            console.log('WARNING: transaction_id matches invoice_id - this is likely wrong!');
            console.log('Skipping this value and continuing search...');
          }
          
          if (!verificationData) {
            verificationData = responseData;
          } else {
            verificationData = { ...verificationData, ...responseData };
          }
          
          if (extractedTransactionId && extractedTransactionId !== responseData.invoice_id) {
            verificationData.transaction_id = extractedTransactionId;
            console.log(`Transaction ID extracted from API response (attempt ${attempt}):`, extractedTransactionId);
            console.log(`Invoice ID from response:`, responseData.invoice_id);
            console.log(`Transaction ID is different from Invoice ID: ${extractedTransactionId !== responseData.invoice_id}`);
            break;
          } else if (extractedTransactionId && extractedTransactionId === responseData.invoice_id) {
            console.log(`WARNING: Extracted transaction_id (${extractedTransactionId}) matches invoice_id. Not using it as transaction_id.`);
            if (attempt < attempts) {
              console.log(`Retrying to get proper transaction_id...`);
            }
          } else if (attempt < attempts) {
            console.log(`WARNING: No transaction_id found in API response (attempt ${attempt}). Retrying...`);
            console.log('Available fields:', Object.keys(responseData));
            console.log('Full response data:', JSON.stringify(responseData, null, 2));
          } else {
            console.log('WARNING: No valid transaction_id found after all attempts.');
            console.log('Available fields:', Object.keys(verificationData));
            console.log('Full verification data:', JSON.stringify(verificationData, null, 2));
          }
        }
      }

      if (verificationData && !verificationData.payment_method) {
        verificationData.payment_method = verificationData.paymentMethod || 
                                         verificationData.payment_method_name ||
                                         verificationData.method ||
                                         null;
      }

      if (verificationData && !verificationData.sender_number) {
        verificationData.sender_number = verificationData.senderNumber || 
                                        verificationData.phone ||
                                        verificationData.sender_phone ||
                                        null;
      }

      if (verificationResponse && verificationResponse.ok && verificationData) {
        if (verificationData.status === 'COMPLETED' || verificationData.status === 'SUCCESS') {
          isSuccessful = true;
          paymentStatus = "Success";
        } else if (verificationData.status === 'PENDING') {
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
      } else if (verificationResponse && !verificationResponse.ok) {
        if (from_redirect || transaction_id) {
          console.log('Payment redirected to success page - treating as successful despite API error');
          isSuccessful = true;
          paymentStatus = "Success";
          verificationData = verificationData || {};
          verificationData.transaction_id = verificationData.transaction_id || transaction_id || null;
          verificationData.payment_method = verificationData.payment_method || null;
          verificationData.sender_number = verificationData.sender_number || null;
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
    } catch (apiError) {
      console.error('Error calling UddoktaPay API:', apiError);
      if (from_redirect || transaction_id) {
        console.log('Payment redirected to success page - treating as successful despite API error');
        isSuccessful = true;
        paymentStatus = "Success";
        verificationData = { 
          transaction_id: transaction_id || null,
          payment_method: null,
          sender_number: null,
        };
      } else {
        return NextResponse.json(
          { 
            error: "Failed to verify payment with payment gateway", 
            status: "FAILED",
            message: "An error occurred while verifying payment",
            details: String(apiError) 
          },
          { status: 500 }
        );
      }
    }
    
    if (from_redirect && payment.user) {
      console.log('Payment redirected to success - processing as successful with fetched transaction details');
      console.log('Verification data available:', {
        hasVerificationData: !!verificationData,
        transaction_id_from_api: verificationData?.transaction_id,
        transaction_id_from_url: transaction_id,
        transaction_id_from_db: payment.transaction_id,
      });
      
      let finalTransactionId = verificationData?.transaction_id || transaction_id || payment.transaction_id || null;
      
      if (finalTransactionId && finalTransactionId === invoice_id) {
        console.log('WARNING: finalTransactionId matches invoice_id - this is wrong! Setting to null instead.');
        finalTransactionId = transaction_id || payment.transaction_id || null;
      }
      const finalPaymentMethod = verificationData?.payment_method || payment.payment_method || null;
      const finalSenderNumber = verificationData?.sender_number || payment.sender_number || null;
      
      console.log('Final values to save:', {
        transaction_id: finalTransactionId,
        payment_method: finalPaymentMethod,
        sender_number: finalSenderNumber,
      });
      
      try {
        await db.$transaction(async (prisma) => {
          await prisma.addFunds.update({
            where: { invoice_id },
            data: {
              status: "Success",
              transaction_id: finalTransactionId,
              payment_method: finalPaymentMethod,
              sender_number: finalSenderNumber,
            }
          });
          
          const originalAmount = payment.bdt_amount || payment.usd_amount || 0;
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
              balanceUSD: { increment: payment.usd_amount },
              total_deposit: { increment: originalAmount }
            }
          });
          
          console.log(`User ${payment.userId} balance updated. New balance: ${user.balance}`);
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const updatedPayment = await db.addFunds.findUnique({
          where: { invoice_id }
        });
        
        let finalTransactionIdToReturn = updatedPayment?.transaction_id || null;
        if (finalTransactionIdToReturn && finalTransactionIdToReturn === invoice_id) {
          console.log('ERROR: Database has invoice_id stored as transaction_id! Clearing it.');
          await db.addFunds.update({
            where: { invoice_id },
            data: { transaction_id: null }
          });
          finalTransactionIdToReturn = null;
        }
        
        if (!finalTransactionIdToReturn && verificationData?.transaction_id && verificationData.transaction_id !== invoice_id) {
          console.log('Found transaction_id in API response, updating database...');
          finalTransactionIdToReturn = verificationData.transaction_id;
          await db.addFunds.update({
            where: { invoice_id },
            data: { transaction_id: finalTransactionIdToReturn }
          });
        }
        
        console.log('Returning payment with transaction_id:', finalTransactionIdToReturn, '(invoice_id:', invoice_id, ')');
        
        return NextResponse.json({
          status: "COMPLETED",
          message: "Payment verified successfully (from redirect)",
          payment: {
            id: updatedPayment?.id,
            invoice_id: updatedPayment?.invoice_id,
            amount: updatedPayment?.usd_amount,
            status: updatedPayment?.status || "Success",
            transaction_id: finalTransactionIdToReturn,
            payment_method: updatedPayment?.payment_method,
            sender_number: updatedPayment?.sender_number,
          },
        });
      } catch (redirectError) {
        console.error('Error processing redirected payment:', redirectError);
      }
    }
    
    try {
      console.log(`Payment verification result: ${isSuccessful ? 'Success' : paymentStatus}`);
      
      let existingPayment = await db.addFunds.findUnique({ where: { invoice_id } });
      let transactionIdToSave = verificationData?.transaction_id || existingPayment?.transaction_id || payment.transaction_id || null;
      
      if (transactionIdToSave && transactionIdToSave === invoice_id) {
        console.log('ERROR: transaction_id matches invoice_id - NOT saving! Setting to null or existing valid transaction_id.');
        if (existingPayment?.transaction_id && existingPayment.transaction_id !== invoice_id) {
          transactionIdToSave = existingPayment.transaction_id;
        } else {
          transactionIdToSave = null;
        }
      }
      
      console.log('Saving payment with transaction_id:', transactionIdToSave, '(invoice_id:', invoice_id, ')');
      
      const updatedPayment = await db.addFunds.update({
        where: { invoice_id },
        data: {
          status: paymentStatus,
          transaction_id: transactionIdToSave,
          payment_method: verificationData?.payment_method || payment.payment_method || null,
          sender_number: verificationData?.sender_number || payment.sender_number || null,
        }
      });
      
      const finalCheck = await db.addFunds.findUnique({ where: { invoice_id } });
      if (finalCheck?.transaction_id && finalCheck.transaction_id === invoice_id) {
        console.error('CRITICAL ERROR: invoice_id was saved as transaction_id! Fixing...');
        await db.addFunds.update({
          where: { invoice_id },
          data: { transaction_id: null }
        });
      }

      console.log(`Payment ${invoice_id} status updated to ${paymentStatus} with transaction_id: ${updatedPayment.transaction_id}`);
      
      if (isSuccessful && payment.user) {
        try {
          await db.$transaction(async (prisma) => {
            await prisma.addFunds.update({
              where: { invoice_id },
              data: {
                status: "Success",
              }
            });
            
            const originalAmount = payment.bdt_amount || payment.usd_amount || 0;

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
                balanceUSD: { increment: payment.usd_amount },
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
            amount: updatedPayment.usd_amount,
            status: updatedPayment.status,
              transaction_id: updatedPayment.transaction_id,
              payment_method: updatedPayment.payment_method,
              sender_number: updatedPayment.sender_number,
          },
        });
      } else {
        return NextResponse.json({
          status: "FAILED",
          message: "Payment verification failed",
          payment: {
            id: updatedPayment.id,
            invoice_id: updatedPayment.invoice_id,
            amount: updatedPayment.usd_amount,
            status: updatedPayment.status,
              transaction_id: updatedPayment.transaction_id,
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
