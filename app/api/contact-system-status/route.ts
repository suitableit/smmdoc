import { NextResponse } from 'next/server';
import { contactDB } from '@/lib/contact-db';

// GET - Check if contact system is enabled (public endpoint)
export async function GET() {
  try {
    const contactSettings = await contactDB.getContactSettings();
    const contactSystemEnabled = contactSettings?.contactSystemEnabled ?? true;
    
    return NextResponse.json({
      success: true,
      contactSystemEnabled
    });
  } catch (error) {
    console.error('Error checking contact system status:', error);
    // Default to enabled on error to prevent breaking the UI
    return NextResponse.json({
      success: true,
      contactSystemEnabled: true
    });
  }
}