import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all blog posts for statistics
    const allBlogs = await prisma.blogPost.findMany({
      select: {
        id: true,
        status: true,
        views: true,
        readingTime: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    // Calculate status counts
    const statusCounts: { [key: string]: number } = {
      published: 0,
      draft: 0,
      scheduled: 0,
      archived: 0,
    };

    let totalViews = 0;
    let totalReadTime = 0;
    let todayViews = 0;
    let thisMonthPosts = 0;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    allBlogs.forEach((blog) => {
      // Count by status
      statusCounts[blog.status] = (statusCounts[blog.status] || 0) + 1;

      // Sum totals
      totalViews += blog.views || 0;
      totalReadTime += blog.readingTime || 0;

      // Today's views (simplified - in real app you'd track daily views)
      if (blog.publishedAt && new Date(blog.publishedAt).toDateString() === today.toDateString()) {
        todayViews += blog.views || 0;
      }

      // This month's posts
      if (blog.createdAt >= startOfMonth) {
        thisMonthPosts++;
      }
    });

    const averageReadTime = allBlogs.length > 0 ? Math.round(totalReadTime / allBlogs.length) : 0;

    const stats = {
      totalBlogs: allBlogs.length,
      publishedBlogs: statusCounts.published || 0,
      draftBlogs: statusCounts.draft || 0,
      scheduledBlogs: statusCounts.scheduled || 0,
      archivedBlogs: statusCounts.archived || 0,
      totalViews,
      totalLikes: 0, // Not available in current schema
      totalComments: 0, // Not available in current schema
      averageReadTime,
      topCategories: 0, // Would need category analysis
      todayViews,
      thisMonthPosts,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch blog statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}