import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get custom codes settings (public endpoint, no auth required)
    const customCodesSettings = await db.customCodesSettings.findFirst({
      select: {
        headerCodes: true,
        footerCodes: true,
      },
    });

    return NextResponse.json({
      success: true,
      customCodesSettings: customCodesSettings || {
        headerCodes: '',
        footerCodes: '',
      },
    });
  } catch (error) {
    console.error('Error fetching custom codes settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        customCodesSettings: {
          headerCodes: '',
          footerCodes: '',
        },
      },
      { status: 500 }
    );
  }
}