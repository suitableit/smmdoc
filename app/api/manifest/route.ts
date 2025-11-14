import { NextRequest, NextResponse } from 'next/server';
import { getGeneralSettings } from '@/lib/utils/general-settings';
import { getAppName } from '@/lib/utils/general-settings';

export async function GET(request: NextRequest) {
  try {
    const [generalSettings, appName] = await Promise.all([
      getGeneralSettings(),
      getAppName()
    ]);

    const iconPath = generalSettings.siteIcon || '/favicon.png';
    const siteUrl = generalSettings.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://smmdoc.suitableit.com';

    const manifest = {
      id: '/',
      name: appName || generalSettings.siteTitle || 'SMMDOC',
      short_name: appName || generalSettings.siteTitle || 'SMMDOC',
      description: generalSettings.siteDescription || 'Your Social Media Growth Partner',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      orientation: 'portrait-primary',
      categories: ['business', 'productivity', 'social'],
      screenshots: [
        {
          src: iconPath,
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'SMMDOC App Screenshot'
        },
        {
          src: iconPath,
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'SMMDOC App Screenshot'
        }
      ],
      icons: [
        {
          src: iconPath,
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: iconPath,
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: iconPath,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    return NextResponse.json(manifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating manifest:', error);
    
    const fallbackManifest = {
      id: '/',
      name: 'SMMDOC',
      short_name: 'SMMDOC',
      description: 'Your Social Media Growth Partner',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      orientation: 'portrait-primary',
      categories: ['business', 'productivity', 'social'],
      screenshots: [
        {
          src: '/favicon.png',
          sizes: '1280x720',
          type: 'image/png',
          form_factor: 'wide',
          label: 'SMMDOC App Screenshot'
        },
        {
          src: '/favicon.png',
          sizes: '750x1334',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'SMMDOC App Screenshot'
        }
      ],
      icons: [
        {
          src: '/favicon.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/favicon.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    return NextResponse.json(fallbackManifest, {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}

