import { NextResponse } from 'next/server';

// GET - Check if ticket system is enabled (public endpoint)
export async function GET() {
  try {
    const ticketSystemEnabled = true; // Ticket system is always enabled
    
    return NextResponse.json({
      success: true,
      ticketSystemEnabled
    });
  } catch (error) {
    console.error('Error checking ticket system status:', error);
    // Default to enabled on error to prevent breaking the UI
    return NextResponse.json({
      success: true,
      ticketSystemEnabled: true
    });
  }
}