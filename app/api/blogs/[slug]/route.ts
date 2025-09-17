import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/[slug] - Get single blog post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const post = await db.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Check if post is published or user is admin
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';
    
    if (post.status !== 'published' && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Increment view count for published posts
    if (post.status === 'published') {
      await db.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      });
      post.views += 1;
    }

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog post',
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[slug] - Update blog post (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access. Admin privileges required.',
          data: null
        },
        { status: 401 }
      );
    }

    const { slug } = params;
    const body = await req.json();
    const {
      title,
      newSlug,
      excerpt,
      content,
      featuredImage,
      status,
      publishedAt,
      scheduledAt,
      seoTitle,
      seoDescription,
      seoKeywords
    } = body;

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
          data: null
        },
        { status: 404 }
      );
    }

    // If slug is being changed, check if new slug already exists
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.blogPost.findUnique({
        where: { slug: newSlug }
      });

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'A post with this slug already exists',
            data: null
          },
          { status: 400 }
        );
      }
    }

    // Calculate reading time if content is updated
    let readingTime = existingPost.readingTime;
    if (content) {
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / 200);
    }

    // Prepare update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) {
      updateData.content = content;
      updateData.readingTime = readingTime;
    }
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published' && !existingPost.publishedAt) {
        updateData.publishedAt = publishedAt ? new Date(publishedAt) : new Date();
      }
    }
    if (publishedAt !== undefined) updateData.publishedAt = publishedAt ? new Date(publishedAt) : null;
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords;

    // Update blog post
    const updatedPost = await db.blogPost.update({
      where: { slug },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog post',
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[slug] - Delete blog post (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access. Admin privileges required.',
          data: null
        },
        { status: 401 }
      );
    }

    const { slug } = params;

    // Check if post exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug }
    });

    if (!existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog post not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Delete blog post
    await db.blogPost.delete({
      where: { slug }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog post',
        data: null
      },
      { status: 500 }
    );
  }
}