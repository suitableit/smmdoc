import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const invoice_id = searchParams.get("invoice_id");
    const from_redirect = searchParams.get("from_redirect") === "true";
    
    // Extract transaction_id from various possible parameter names that payment gateway might use
    const transaction_id = searchParams.get("transaction_id") || 
                          searchParams.get("trx_id") || 
                          searchParams.get("transactionId") ||
                          searchParams.get("transactionID") ||
                          searchParams.get("trxId") ||
                          searchParams.get("trxID");
    
    console.log("Verifying payment for invoice_id:", invoice_id, "from_redirect:", from_redirect, "transaction_id:", transaction_id);
    console.log("All URL parameters:", Object.fromEntries(searchParams.entries()));

    if (!invoice_id) {
      return NextResponse.json(
        { error: "Invoice ID is required", status: "FAILED" },
        { status: 400 }
      );
    }

    const payment = await db.addFunds.findUnique({
      where: {
        invoiceId: invoice_id,
      },
      include: {
        user: true,
      },
    });

    console.log("Payment record found:", payment);
    
    if (payment && payment.transactionId && payment.transactionId === invoice_id) {
      console.log('CRITICAL: Found corrupted data - transaction_id equals invoice_id! Fixing...');
      await db.addFunds.update({
        where: { invoiceId: invoice_id },
        data: { transactionId: null }
      });
      const fixedPayment = await db.addFunds.findUnique({
        where: { invoiceId: invoice_id },
        include: { user: true },
      });
      if (fixedPayment) {
        payment.transactionId = null;
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
          id: payment.Id,
          invoice_id: payment.invoiceId,
          amount: payment.usdAmount,
          status: payment.status,
          transaction_id: payment.transactionId,
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
            paymentStatus = "Processing";
          console.log('Payment status is PENDING - keeping as Processing');
        } else if (verificationData.status === 'ERROR' || verificationData.status === 'CANCELLED') {
          paymentStatus = "Cancelled";
        } else {
          paymentStatus = "Processing";
        }
      } else if (verificationResponse && !verificationResponse.ok) {
        // For sandbox or pending payments, API might return error but payment is still pending
        // Check current payment status in database
        if (from_redirect) {
          console.log('Payment redirected but API verification failed - checking current payment status');
          // If payment is currently Processing, keep it as Processing (sandbox pending payments)
          if (payment.status === "Processing") {
            paymentStatus = "Processing";
            console.log('Payment is currently Processing - keeping as Processing (likely sandbox pending payment)');
          } else if (payment.status === "Success") {
            paymentStatus = "Success";
          isSuccessful = true;
            console.log('Payment is already Success - keeping as Success');
          } else {
            paymentStatus = "Processing";
            console.log('Setting payment status to Processing (sandbox pending payment)');
          }
          
          verificationData = verificationData || {};
          verificationData.transaction_id = verificationData.transaction_id || transaction_id || null;
          verificationData.payment_method = verificationData.payment_method || null;
          verificationData.sender_number = verificationData.sender_number || null;
        } else {
          const errorText = await verificationResponse.text();
          console.error('UddoktaPay verification API error:', errorText);
          // Check if payment is currently Processing (sandbox pending)
          if (payment.status === "Processing") {
            console.log('Payment is currently Processing - returning as PENDING instead of FAILED');
            paymentStatus = "Processing";
          } else {
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
      }
    } catch (apiError) {
      console.error('Error calling UddoktaPay API:', apiError);
      // For sandbox or pending payments, API call might fail but payment is still pending
      if (from_redirect) {
        console.log('Payment redirected but API call failed - checking current payment status');
        // If payment is currently Processing, keep it as Processing (sandbox pending payments)
        if (payment.status === "Processing") {
          paymentStatus = "Processing";
          console.log('Payment is currently Processing - keeping as Processing (likely sandbox pending payment)');
        } else if (payment.status === "Success") {
          paymentStatus = "Success";
        isSuccessful = true;
          console.log('Payment is already Success - keeping as Success');
        } else {
          paymentStatus = "Processing";
          console.log('Setting payment status to Processing (sandbox pending payment)');
        }
        
        verificationData = { 
          transaction_id: transaction_id || null,
          payment_method: null,
          phone_number: null,
        };
      } else {
        // Check if payment is currently Processing (sandbox pending)
        if (payment.status === "Processing") {
          console.log('Payment is currently Processing - returning as PENDING instead of FAILED');
          paymentStatus = "Processing";
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
    }
    
    if (from_redirect && payment.user) {
      console.log('Payment redirected - updating with fetched transaction details');
      console.log('Verification data available:', {
        hasVerificationData: !!verificationData,
        transaction_id_from_api: verificationData?.transaction_id,
        transaction_id_from_url: transaction_id,
        transaction_id_from_db: payment.transactionId,
        paymentStatus: paymentStatus,
      });
      
      // Prioritize transaction_id from redirect URL, then API response, then existing DB value
      let finalTransactionId = transaction_id || 
                               verificationData?.transaction_id || 
                               payment.transactionId || 
                               null;
      
      // Also check verificationData for other possible transaction_id field names
      if (!finalTransactionId && verificationData) {
        finalTransactionId = verificationData.trx_id || 
                            verificationData.transactionId || 
                            verificationData.transactionID ||
                            verificationData.trxId ||
                            verificationData.trxID ||
                            null;
      }
      
      if (finalTransactionId && finalTransactionId === invoice_id) {
        console.log('WARNING: finalTransactionId matches invoice_id - this is wrong! Setting to null instead.');
        finalTransactionId = null;
      }
      
      console.log('Transaction ID resolution:', {
        from_url: transaction_id,
        from_api: verificationData?.transaction_id,
        from_db: payment.transactionId,
        final: finalTransactionId
      });
      const finalPaymentMethod = verificationData?.payment_method || payment.paymentMethod || null;
      const finalSenderNumber = verificationData?.sender_number || payment.phoneNumber || null;
      
      console.log('Final values to save:', {
        status: paymentStatus,
        transaction_id: finalTransactionId,
        payment_method: finalPaymentMethod,
        phone_number: finalSenderNumber,
      });
      
      try {
        if (paymentStatus === "Success") {
        await db.$transaction(async (prisma) => {
          await prisma.addFunds.update({
              where: { invoiceId: invoice_id },
            data: {
                status: paymentStatus,
                transactionId: finalTransactionId,
                paymentMethod: finalPaymentMethod,
                phoneNumber: finalSenderNumber,
            }
          });
          
            const originalAmount = payment.bdtAmount || payment.usdAmount || 0;
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
                balanceUSD: { increment: payment.usdAmount },
              total_deposit: { increment: originalAmount }
            }
          });
          
          console.log(`User ${payment.userId} balance updated. New balance: ${user.balance}`);
        });
        } else {
          await db.addFunds.update({
            where: { invoiceId: invoice_id },
            data: {
              status: paymentStatus,
              transactionId: finalTransactionId,
              paymentMethod: finalPaymentMethod,
              phoneNumber: finalSenderNumber,
            }
          });
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const updatedPayment = await db.addFunds.findUnique({
          where: { invoiceId: invoice_id }
        });
        
        let finalTransactionIdToReturn = updatedPayment?.transactionId || null;
        if (finalTransactionIdToReturn && finalTransactionIdToReturn === invoice_id) {
          console.log('ERROR: Database has invoice_id stored as transaction_id! Clearing it.');
          await db.addFunds.update({
            where: { invoiceId: invoice_id },
            data: { transactionId: null }
          });
          finalTransactionIdToReturn = null;
        }
        
        if (!finalTransactionIdToReturn && verificationData?.transaction_id && verificationData.transaction_id !== invoice_id) {
          console.log('Found transaction_id in API response, updating database...');
          finalTransactionIdToReturn = verificationData.transaction_id;
          await db.addFunds.update({
            where: { invoiceId: invoice_id },
            data: { transactionId: finalTransactionIdToReturn }
          });
        }
        
        console.log('Returning payment with status:', paymentStatus, 'transaction_id:', finalTransactionIdToReturn);
        
        return NextResponse.json({
          status: paymentStatus === "Success" ? "COMPLETED" : paymentStatus === "Processing" ? "PENDING" : "FAILED",
          message: paymentStatus === "Success" 
            ? "Payment verified successfully (from redirect)"
            : paymentStatus === "Processing"
            ? "Payment is pending verification"
            : "Payment verification failed",
          payment: {
            id: updatedPayment?.Id,
            invoice_id: updatedPayment?.invoiceId,
            amount: updatedPayment?.usdAmount,
            status: updatedPayment?.status || paymentStatus,
            transaction_id: finalTransactionIdToReturn,
            payment_method: updatedPayment?.paymentMethod,
            phone_number: updatedPayment?.phoneNumber,
          },
        });
      } catch (redirectError) {
        console.error('Error processing redirected payment:', redirectError);
      }
    }
    
    try {
      console.log(`Payment verification result: ${isSuccessful ? 'Success' : paymentStatus}`);
      
      let existingPayment = await db.addFunds.findUnique({ where: { invoiceId: invoice_id } });
      let transactionIdToSave = verificationData?.transaction_id || existingPayment?.transactionId || payment.transactionId || null;
      
      if (transactionIdToSave && transactionIdToSave === invoice_id) {
        console.log('ERROR: transaction_id matches invoice_id - NOT saving! Setting to null or existing valid transaction_id.');
        if (existingPayment?.transactionId && existingPayment.transactionId !== invoice_id) {
          transactionIdToSave = existingPayment.transactionId;
        } else {
          transactionIdToSave = null;
        }
      }
      
      // If we have transaction_id from URL but not from API, use URL value
      if (!transactionIdToSave && transaction_id && transaction_id !== invoice_id) {
        transactionIdToSave = transaction_id;
        console.log('Using transaction_id from redirect URL:', transactionIdToSave);
      }
      
      console.log('Saving payment with transaction_id:', transactionIdToSave, '(invoice_id:', invoice_id, ')');
      
      const updatedPayment = await db.addFunds.update({
        where: { invoiceId: invoice_id },
        data: {
          status: paymentStatus,
          transactionId: transactionIdToSave,
          paymentMethod: verificationData?.payment_method || payment.paymentMethod || null,
          phoneNumber: verificationData?.sender_number || payment.phoneNumber || null,
        }
      });
      
      const finalCheck = await db.addFunds.findUnique({ where: { invoiceId: invoice_id } });
      if (finalCheck?.transactionId && finalCheck.transactionId === invoice_id) {
        console.error('CRITICAL ERROR: invoice_id was saved as transaction_id! Fixing...');
        await db.addFunds.update({
          where: { invoiceId: invoice_id },
          data: { transactionId: null }
        });
      }

      console.log(`Payment ${invoice_id} status updated to ${paymentStatus} with transaction_id: ${updatedPayment.transactionId}`);
      
      if (isSuccessful && payment.user) {
        try {
          await db.$transaction(async (prisma) => {
            await prisma.addFunds.update({
              where: { invoiceId: invoice_id },
              data: {
                status: "Success",
              }
            });
            
            const originalAmount = payment.bdtAmount || payment.usdAmount || 0;

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
                balanceUSD: { increment: payment.usdAmount },
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
            id: updatedPayment.Id,
            invoice_id: updatedPayment.invoiceId,
            amount: updatedPayment.usdAmount,
            status: updatedPayment.status,
              transaction_id: updatedPayment.transactionId,
              payment_method: updatedPayment.paymentMethod,
              phone_number: updatedPayment.phoneNumber,
          },
        });
      } else {
        // Return appropriate status based on paymentStatus
        const responseStatus = paymentStatus === "Processing" ? "PENDING" : 
                              paymentStatus === "Cancelled" ? "CANCELLED" : 
                              "FAILED";
        const responseMessage = paymentStatus === "Processing" 
          ? "Payment is pending verification" 
          : paymentStatus === "Cancelled"
          ? "Payment was cancelled"
          : "Payment verification failed";
        
        return NextResponse.json({
          status: responseStatus,
          message: responseMessage,
          payment: {
            id: updatedPayment.Id,
            invoice_id: updatedPayment.invoiceId,
            amount: updatedPayment.usdAmount,
            status: updatedPayment.status,
              transaction_id: updatedPayment.transactionId,
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
