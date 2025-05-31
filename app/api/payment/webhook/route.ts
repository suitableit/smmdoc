import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Parse the webhook data
    const webhookData = await req.json();
    console.log("Webhook data received:", webhookData);
    
    // Validate that this is a legitimate webhook request
    // In production, you should verify the signature or API key
    const apiKey = req.headers.get('rt-uddoktapay-api-key');
    const expectedApiKey = process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY || '982d381360a69d419689740d9f2e26ce36fb7a50';
    
    if (apiKey !== expectedApiKey) {
      console.error("Invalid API key in webhook request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Extract the necessary data from the webhook
    const { 
      invoice_id, 
      transaction_id, 
      amount, 
      status, 
      metadata,
      payment_method,
      sender_number
    } = webhookData;
    
    if (!invoice_id) {
      console.error("Missing invoice_id in webhook data");
      return NextResponse.json({ error: "Missing invoice_id" }, { status: 400 });
    }
    
    // Find the payment record in the database
    const payment = await db.addFund.findUnique({
      where: { invoice_id },
      include: { user: true }
    });
    
    if (!payment) {
      console.error(`Payment record not found for invoice_id: ${invoice_id}`);
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }
    
    // If the payment is already processed, don't process it again
    if (payment.status === "Success") {
      console.log(`Payment ${invoice_id} is already marked as successful`);
      return NextResponse.json({ message: "Payment already processed" });
    }
    
    // Update the payment record based on the webhook status
    // UddoktaPay usually sends COMPLETED for successful payments
    let paymentStatus = "Processing";
    
    if (status === "COMPLETED") {
      paymentStatus = "Success";
    } else if (status === "PENDING") {
      paymentStatus = "Processing";
    } else if (status === "CANCELLED") {
      paymentStatus = "Cancelled";
    } else {
      paymentStatus = "Failed";
    }
    
    try {
      // Use a transaction to ensure both payment status and balance update succeed or fail together
      const result = await db.$transaction(async (prisma) => {
        // Update the payment record in the database
        const updatedPayment = await prisma.addFund.update({
          where: { invoice_id },
          data: {
            status: paymentStatus,
            transaction_id: transaction_id || payment.transaction_id,
            payment_method: payment_method || payment.payment_method || "UddoktaPay",
            sender_number: sender_number || payment.sender_number || "N/A",
          }
        });
        
        console.log(`Payment ${invoice_id} status updated to ${paymentStatus}`);
        
        // If the payment was successful, update the user's balance
        if (paymentStatus === "Success" && payment.user) {
          // Update user balance
          const user = await prisma.user.update({
            where: { id: payment.userId },
            data: {
              balance: {
                increment: payment.amount
              },
              total_deposit: {
                increment: payment.amount
              }
            }
          });
          
          console.log(`User ${payment.userId} balance updated after successful payment. New balance: ${user.balance}`);
        }
        
        return { updatedPayment };
      });
      
      // Return a success response
      return NextResponse.json({
        success: true,
        message: `Payment ${paymentStatus.toLowerCase()}`,
        data: {
          invoice_id,
          status: paymentStatus,
          transaction_id: result.updatedPayment.transaction_id,
          amount: result.updatedPayment.amount
        }
      });
    } catch (dbError) {
      console.error("Database error updating payment:", dbError);
      
      // Return a specific database error response
      return NextResponse.json({
        error: "Database error",
        message: "Failed to update payment record",
        details: String(dbError)
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: String(error) },
      { status: 500 }
    );
  }
} 