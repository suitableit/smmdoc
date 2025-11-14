import { NextRequest, NextResponse } from 'next/server';
import { getGeneralSettings } from '@/lib/utils/general-settings';
import { getAppName } from '@/lib/utils/general-settings';

export async function GET(request: NextRequest) {
  try {
    const [generalSettings, appName] = await Promise.all([
      getGeneralSettings(),
      getAppName()
    ]);

    const manifest = {
      name: appName || generalSettings.siteTitle || 'SMMDOC',
      short_name: appName || generalSettings.siteTitle || 'SMMDOC',
      description: generalSettings.siteDescription || 'Your Social Media Growth Partner',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      orientation: 'portrait-primary',
      icons: [
        {
          src: generalSettings.siteIcon || '/favicon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: generalSettings.siteIcon || '/favicon.png',
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
      name: 'SMMDOC',
      short_name: 'SMMDOC',
      description: 'Your Social Media Growth Partner',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/favicon.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
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

