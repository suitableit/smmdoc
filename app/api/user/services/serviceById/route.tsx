/* eslint-disable @typescript-eslint/no-unused-vars */
import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Check module settings for services list access control
    const moduleSettings = await db.moduleSettings.findFirst();
    const servicesListPublic = moduleSettings?.servicesListPublic ?? true;

    // If services list is private, require authentication
    if (!servicesListPublic) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Authentication required to access services' },
          { status: 401 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('svId') || '';

    // Only return active services
    const result = await db.service.findFirst({
      where: { 
        id: Number(id),
        status: 'active' // Only return if service is active
      },
    });
    
    if (!result) {
      return NextResponse.json(
        {
          error: 'Service not found or not available.',
          data: null,
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: null,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'An error occurred while fetching the service.',
        data: null,
      },
      { status: 500 }
    );
  }
}
