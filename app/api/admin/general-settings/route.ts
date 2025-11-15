import { auth } from '@/auth';
import { db } from '@/lib/db';
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
        data: {
          ...defaultGeneralSettings,
          googleTitle: '',
          metaKeywords: '',
          metaSiteTitle: '',
          siteDescription: '',
          thumbnail: '',
        }
      });
    }

    return NextResponse.json({
      success: true,
      generalSettings: {
        siteTitle: settings.siteTitle || defaultGeneralSettings.siteTitle,
        tagline: settings.tagline || defaultGeneralSettings.tagline,
        siteIcon: settings.siteIcon || '',
        siteLogo: settings.siteLogo || '',
        siteDarkLogo: settings.siteDarkLogo || '',
        adminEmail: settings.adminEmail || defaultGeneralSettings.adminEmail,
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

    const { generalSettings } = await request.json();

    if (!generalSettings) {
      return NextResponse.json(
        { error: 'General settings data is required' },
        { status: 400 }
      );
    }

    if (!generalSettings.siteTitle?.trim()) {
      return NextResponse.json(
        { error: 'Site title is required' },
        { status: 400 }
      );
    }

    if (!generalSettings.adminEmail?.trim()) {
      return NextResponse.json(
        { error: 'Admin email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(generalSettings.adminEmail.trim())) {
      return NextResponse.json(
        { error: 'Invalid admin email format' },
        { status: 400 }
      );
    }

    const existingSettings = await db.generalSettings.findFirst();
    
    if (existingSettings) {
      await db.generalSettings.update({
        where: { id: existingSettings.id },
        data: {
          siteTitle: generalSettings.siteTitle.trim(),
          tagline: generalSettings.tagline?.trim() || defaultGeneralSettings.tagline,
          siteIcon: generalSettings.siteIcon || '',
          siteLogo: generalSettings.siteLogo || '',
          siteDarkLogo: generalSettings.siteDarkLogo || '',
          adminEmail: generalSettings.adminEmail.trim(),
          updatedAt: new Date()
        }
      });
    } else {
      await db.generalSettings.create({
        data: {
          siteTitle: generalSettings.siteTitle.trim(),
          tagline: generalSettings.tagline?.trim() || defaultGeneralSettings.tagline,
          siteIcon: generalSettings.siteIcon || '',
          siteLogo: generalSettings.siteLogo || '',
          siteDarkLogo: generalSettings.siteDarkLogo || '',
          adminEmail: generalSettings.adminEmail.trim(),
          googleTitle: '',
          metaKeywords: '',
          metaSiteTitle: '',
          siteDescription: '',
          thumbnail: '',
        }
      });
    }

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

