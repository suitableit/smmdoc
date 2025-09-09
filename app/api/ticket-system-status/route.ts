import { NextResponse } from 'next/server';
import { isTicketSystemEnabled } from '@/lib/utils/ticket-settings';

// GET - Check if ticket system is enabled (public endpoint)
export async function GET() {
  try {
    const ticketSystemEnabled = await isTicketSystemEnabled();
    
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