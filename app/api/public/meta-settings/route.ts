import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get meta settings from general settings table (public endpoint, no auth required)
    const settings = await db.generalSettings.findFirst({
      select: {
        googleTitle: true,
        metaSiteTitle: true,
        siteDescription: true,
        metaKeywords: true,
        thumbnail: true,
      },
    });

    // Default meta settings if none exist
    const defaultMetaSettings = {
      googleTitle: 'SMM Panel - Best Social Media Marketing Services',
      siteTitle: 'SMM Panel',
      siteDescription: 'Get the best social media marketing services with fast delivery and affordable prices. Boost your social media presence today!',
      keywords: 'smm panel, social media marketing, instagram followers, youtube views, facebook likes',
      thumbnail: '',
    };

    return NextResponse.json({
      success: true,
      metaSettings: {
        googleTitle: settings?.googleTitle || defaultMetaSettings.googleTitle,
        siteTitle: settings?.metaSiteTitle || defaultMetaSettings.siteTitle,
        siteDescription: settings?.siteDescription || defaultMetaSettings.siteDescription,
        keywords: settings?.metaKeywords || defaultMetaSettings.keywords,
        thumbnail: settings?.thumbnail || defaultMetaSettings.thumbnail,
      },
    });
  } catch (error) {
    console.error('Error fetching public meta settings:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        metaSettings: {
          googleTitle: 'SMM Panel - Best Social Media Marketing Services',
          siteTitle: 'SMM Panel',
          siteDescription: 'Get the best social media marketing services with fast delivery and affordable prices. Boost your social media presence today!',
          keywords: 'smm panel, social media marketing, instagram followers, youtube views, facebook likes',
          thumbnail: '',
        },
      },
      { status: 500 }
    );
  }
}