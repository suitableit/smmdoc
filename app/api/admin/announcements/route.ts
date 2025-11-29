import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const announcements = await db.announcements.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isSticky: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      type,
      targetedAudience,
      startDate,
      endDate,
      isSticky,
      buttonEnabled,
      buttonText,
      buttonLink,
    } = body;

    if (!title || !content || !type || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Determine status based on startDate
    const start = new Date(startDate);
    const now = new Date();
    const status = start <= now ? 'active' : 'scheduled';

    const announcement = await db.announcements.create({
      data: {
        title,
        content,
        type,
        status,
        targetedAudience: targetedAudience || 'all',
        startDate: new Date(startDate),
        endDate: endDate && endDate.trim() ? new Date(endDate) : null,
        isSticky: isSticky || false,
        buttonEnabled: buttonEnabled || false,
        buttonText: buttonText && buttonText.trim() ? buttonText.trim() : null,
        buttonLink: buttonLink && buttonLink.trim() ? buttonLink.trim() : null,
        createdBy: session.user.id as number,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: announcement,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create announcement';
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}

