import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as number;
    const userRole = session.user.role?.toLowerCase() || 'user';

    const now = new Date();

    // Get dismissed announcement IDs for this user
    const dismissed = await db.dismissedAnnouncements.findMany({
      where: { userId },
      select: { announcementId: true },
    });
    const dismissedIds = dismissed.map(d => d.announcementId);

    // Build audience filter
    const audienceFilter = userRole === 'admin' || userRole === 'moderator'
      ? ['all', 'admins', 'moderators']
      : ['all'];

    // Get active announcements that match user's audience and are not dismissed
    const announcements = await db.announcements.findMany({
      where: {
        status: 'active',
        targetedAudience: { in: audienceFilter },
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        NOT: {
          id: { in: dismissedIds },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isSticky: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Increment views for each announcement
    await Promise.all(
      announcements.map(ann =>
        db.announcements.update({
          where: { id: ann.id },
          data: { views: { increment: 1 } },
        })
      )
    );

    return NextResponse.json({
      success: true,
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching user announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

