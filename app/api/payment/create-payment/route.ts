import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse the request body
    const body = await req.json();
    console.log("Request body:", body);
    
    // Validate required fields
    if (!body.amount || !body.phone) {
      return NextResponse.json(
        { error: "Amount and phone number are required" },
        { status: 400 }
      );
    }
    
    // Generate a unique invoice ID
    const invoice_id = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const order_id = `ORD-${Date.now()}`;
    
    // Log what we're trying to store
    console.log("Creating payment record with:", {
      invoice_id,
      amount: parseFloat(body.amount),
      spent_amount: 0,
      email: session.user.email,
      name: session.user.name,
      status: "Processing",
      order_id,
      method: body.method,
      userId: session.user.id
    });
    
    // Create a pending payment record in the database
    try {
      const payment = await db.addFund.create({
        data: {
          invoice_id,
          amount: parseFloat(body.amount),
          spent_amount: 0,
          fee: 0,
          email: session.user.email || "",
          name: session.user.name || "",
          status: "Processing", // Default status for user view
          order_id,
          method: body.method,
          userId: session.user.id,
          currency: "BDT", // Store currency as BDT since amounts are in BDT
        },
      });
      
      console.log("Payment record created:", payment);
      
      // Get app URL from environment variables
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      
      // Get the success and cancel URLs from the request or use defaults
      const success_url = body.success_url || `${appUrl}/transactions/success`;
      const cancel_url = body.cancel_url || `${appUrl}/transactions?status=cancelled`;
      
      // Create UddoktaPay live API URL
      const uddoktaPayLiveUrl = 'https://pay.smmdoc.com/api/checkout-v2';
      
      // For live integration, this would be the URL to the actual UddoktaPay checkout page
      // with the necessary query parameters
      const payment_url = `${uddoktaPayLiveUrl}?invoice_id=${invoice_id}&amount=${body.amount}&full_name=${encodeURIComponent(session.user.name || "User")}&email=${encodeURIComponent(session.user.email || "user@example.com")}&metadata=${encodeURIComponent(JSON.stringify({order_id}))}&redirect_url=${encodeURIComponent(success_url)}`;
      
      console.log("Payment URLs:", { success_url, cancel_url, payment_url });
      
      // Return the payment details
      return NextResponse.json({
        order_id: payment.order_id,
        invoice_id: payment.invoice_id,
        payment_url,
        success_url,
        cancel_url,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Database operation failed", details: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment", details: String(error) },
      { status: 500 }
    );
  }
}