import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Check if ticket system is enabled (public endpoint)
export async function GET() {
  try {
    // Get ticket settings from database
    const settings = await db.ticket_settings.findFirst({
      select: {
        ticketSystemEnabled: true
      }
    });

    const ticketSystemEnabled = settings?.ticketSystemEnabled ?? true;
    
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