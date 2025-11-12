import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ticketSettings = await db.ticket_settings.findFirst({
      include: {
        ticket_subjects: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    const subjects = ticketSettings?.ticket_subjects?.map(subject => ({
      id: subject.id,
      name: subject.name
    })) || [];

    return NextResponse.json({
      success: true,
      subjects: subjects
    });
  } catch (error) {
    console.error('Error fetching ticket subjects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
