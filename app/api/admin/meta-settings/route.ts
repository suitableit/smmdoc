import { auth } from '@/auth';
import { db } from '@/lib/db';
import { clearMetaSettingsCache } from '@/lib/utils/meta-settings';
import { NextRequest, NextResponse } from 'next/server';

// Default meta settings
const defaultMetaSettings = {
  googleTitle: 'SMM Panel - Best Social Media Marketing Services',
  siteTitle: 'SMM Panel',
  siteDescription: 'Get the best social media marketing services with fast delivery and affordable prices. Boost your social media presence today!',
  keywords: 'smm panel, social media marketing, instagram followers, youtube views, facebook likes',
  thumbnail: '',
};

// GET - Load meta settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get meta settings from general settings table (create if not exists)
    let settings = await db.generalSettings.findFirst();
    if (!settings) {
      settings = await db.generalSettings.create({
        data: {
          siteTitle: 'SMM Panel',
          tagline: 'Best SMM Services Provider',
          siteIcon: '',
          siteLogo: '',
          adminEmail: 'admin@example.com',
          googleTitle: defaultMetaSettings.googleTitle,
          metaSiteTitle: defaultMetaSettings.siteTitle,
          siteDescription: defaultMetaSettings.siteDescription,
          metaKeywords: defaultMetaSettings.keywords,
          thumbnail: defaultMetaSettings.thumbnail
        }
      });
    }

    return NextResponse.json({
      success: true,
      metaSettings: {
        googleTitle: settings.googleTitle || '',
        siteTitle: settings.metaSiteTitle || '',
        siteDescription: settings.siteDescription || '',
        keywords: settings.metaKeywords || '',
        thumbnail: settings.thumbnail || '',
      }
    });

  } catch (error) {
    console.error('Error loading meta settings:', error);
    return NextResponse.json(
      { error: 'Failed to load meta settings' },
      { status: 500 }
    );
  }
}

// POST - Save meta settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { metaSettings } = await request.json();

    if (!metaSettings) {
      return NextResponse.json(
        { error: 'Meta settings data is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!metaSettings.googleTitle?.trim()) {
      return NextResponse.json(
        { error: 'Google title is required' },
        { status: 400 }
      );
    }

    if (!metaSettings.siteTitle?.trim()) {
      return NextResponse.json(
        { error: 'Site title is required' },
        { status: 400 }
      );
    }

    if (!metaSettings.siteDescription?.trim()) {
      return NextResponse.json(
        { error: 'Site description is required' },
        { status: 400 }
      );
    }

    // Validate description length
    if (metaSettings.siteDescription.length > 160) {
      return NextResponse.json(
        { error: 'Site description must be 160 characters or less' },
        { status: 400 }
      );
    }

    // Update meta settings in general settings table
    await db.generalSettings.upsert({
      where: { id: 1 },
      update: {
        googleTitle: metaSettings.googleTitle.trim(),
        metaSiteTitle: metaSettings.siteTitle.trim(),
        siteDescription: metaSettings.siteDescription.trim(),
        metaKeywords: metaSettings.keywords?.trim() || '',
        thumbnail: metaSettings.thumbnail || '',
        updatedAt: new Date()
      },
      create: {
        id: 1,
        siteTitle: 'SMM Panel',
        tagline: 'Best SMM Services Provider',
        siteIcon: '',
        siteLogo: '',
        adminEmail: 'admin@example.com',
        googleTitle: metaSettings.googleTitle.trim(),
        metaSiteTitle: metaSettings.siteTitle.trim(),
        siteDescription: metaSettings.siteDescription.trim(),
        metaKeywords: metaSettings.keywords?.trim() || '',
        thumbnail: metaSettings.thumbnail || ''
      }
    });

    // Clear cache to ensure homepage gets updated meta settings
    clearMetaSettingsCache();

    return NextResponse.json({
      success: true,
      message: 'Meta settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving meta settings:', error);
    return NextResponse.json(
      { error: 'Failed to save meta settings' },
      { status: 500 }
    );
  }
}
