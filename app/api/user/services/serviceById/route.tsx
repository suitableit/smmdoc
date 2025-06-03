/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('svId') || '';
    
    // Only return active services
    const result = await db.service.findFirst({
      where: { 
        id: id,
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
