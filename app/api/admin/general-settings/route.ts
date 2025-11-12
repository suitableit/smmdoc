import { auth } from '@/auth';
import { db } from '@/lib/db';
import { clearAppNameCache } from '@/lib/utils/general-settings';
import { NextRequest, NextResponse } from 'next/server';

const defaultGeneralSettings = {
  siteTitle: 'SMM Panel',
  tagline: 'Best SMM Services Provider',
  siteIcon: '',
  siteLogo: '',
  siteDarkLogo: '',
  adminEmail: 'admin@example.com',
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await db.generalSettings.findFirst();
    if (!settings) {
      settings = await db.generalSettings.create({
        data: defaultGeneralSettings
      });
    }

    return NextResponse.json({
      success: true,
      generalSettings: {
        siteTitle: settings.siteTitle,
        tagline: settings.tagline,
        siteIcon: settings.siteIcon,
        siteLogo: settings.siteLogo,
        siteDarkLogo: settings.siteDarkLogo,
        adminEmail: settings.adminEmail,
      }
    });

  } catch (error) {
    console.error('Error loading general settings:', error);
    return NextResponse.json(
      { error: 'Failed to load general settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 POST Request body:', JSON.stringify(body, null, 2));
    
    const { generalSettings } = body;

    if (!generalSettings) {
      console.log('❌ No generalSettings in request body');
      return NextResponse.json(
        { error: 'General settings data is required' },
        { status: 400 }
      );
    }

    if (!generalSettings.siteTitle?.trim()) {
      console.log('❌ Site title validation failed:', generalSettings.siteTitle);
      return NextResponse.json(
        { error: 'Site title is required' },
        { status: 400 }
      );
    }

    if (!generalSettings.adminEmail?.trim()) {
      console.log('❌ Admin email validation failed:', generalSettings.adminEmail);
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(generalSettings.adminEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await db.generalSettings.upsert({
      where: { id: 1 },
      update: {
        siteTitle: generalSettings.siteTitle.trim(),
        tagline: generalSettings.tagline?.trim() || '',
        siteIcon: generalSettings.siteIcon || '',
        siteLogo: generalSettings.siteLogo || '',
        siteDarkLogo: generalSettings.siteDarkLogo || '',
        adminEmail: generalSettings.adminEmail.trim(),
      },
      create: {
        id: 1,
        siteTitle: generalSettings.siteTitle.trim(),
        tagline: generalSettings.tagline?.trim() || '',
        siteIcon: generalSettings.siteIcon || '',
        siteLogo: generalSettings.siteLogo || '',
        siteDarkLogo: generalSettings.siteDarkLogo || '',
        adminEmail: generalSettings.adminEmail.trim(),
      }
    });

    clearAppNameCache();

    return NextResponse.json({
      success: true,
      message: 'General settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving general settings:', error);
    return NextResponse.json(
      { error: 'Failed to save general settings' },
      { status: 500 }
    );
  }
}
