import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's transactions from the database
    try {
      const transactions = await db.addFund.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
          invoice_id: true,
          amount: true,
          original_amount: true,
          status: true,
          admin_status: true,
          method: true,
          payment_method: true,
          transaction_id: true,
          sender_number: true,
          currency: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      // Check if transactions is an array before returning
      if (!Array.isArray(transactions)) {
        console.error("Transactions is not an array:", transactions);
        return NextResponse.json({ error: "Invalid data format" }, { status: 500 });
      }
  
      // Return the transactions as an array
      return NextResponse.json(transactions);
    } catch (dbError) {
      console.error("Database error fetching transactions:", dbError);
      
      // Return empty array with error to avoid UI crash
      return NextResponse.json([], { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions", details: String(error) },
      { status: 500 }
    );
  }
}