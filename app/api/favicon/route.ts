import { NextRequest, NextResponse } from 'next/server';
import { getGeneralSettings } from '@/lib/utils/general-settings';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const generalSettings = await getGeneralSettings();
    
    if (generalSettings.siteIcon) {
      const iconPath = path.join(process.cwd(), 'public', generalSettings.siteIcon);
      
      if (fs.existsSync(iconPath)) {
        const fileBuffer = fs.readFileSync(iconPath);
        const fileExtension = path.extname(generalSettings.siteIcon).toLowerCase();
        
        let contentType = 'image/x-icon';
        switch (fileExtension) {
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.gif':
            contentType = 'image/gif';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
          case '.ico':
            contentType = 'image/x-icon';
            break;
          default:
            contentType = 'image/png';
        }
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }
    
    const defaultFaviconPaths = [
      path.join(process.cwd(), 'app', 'favicon.ico'),
      path.join(process.cwd(), 'public', 'favicon.ico'),
      path.join(process.cwd(), 'public', 'favicon.png')
    ];
    
    for (const defaultPath of defaultFaviconPaths) {
      if (fs.existsSync(defaultPath)) {
        const fileBuffer = fs.readFileSync(defaultPath);
        const isIco = defaultPath.endsWith('.ico');
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': isIco ? 'image/x-icon' : 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    }
    
    return new NextResponse('Favicon not found', { status: 404 });
    
  } catch (error) {
    console.error('Error serving favicon:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
