import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/id/[id] - Get single blog post by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid blog ID',
          data: null
        },
        { status: 400 }
      );
    }

    const post = await db.blogPost.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
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

    return NextResponse.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching blog post by ID:', error);
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

// PUT /api/blogs/id/[id] - Update blog post by ID (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const blogId = parseInt(id);

    if (isNaN(blogId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid blog ID',
          data: null
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
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
      where: { id: blogId }
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
    if (slug && slug !== existingPost.slug) {
      const slugExists = await db.blogPost.findUnique({
        where: { slug }
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

    // Calculate reading time if content is provided
    let readingTime = existingPost.readingTime;
    if (content) {
      const wordsPerMinute = 200;
      const wordCount = content.split(/\s+/).length;
      readingTime = Math.ceil(wordCount / wordsPerMinute);
    }

    // Update blog post
    const updatedPost = await db.blogPost.update({
      where: { id: blogId },
      data: {
        title: title || existingPost.title,
        slug: slug || existingPost.slug,
        excerpt: excerpt || existingPost.excerpt,
        content: content || existingPost.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existingPost.featuredImage,
        status: status || existingPost.status,
        publishedAt: publishedAt ? new Date(publishedAt) : existingPost.publishedAt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existingPost.scheduledAt,
        seoTitle: seoTitle !== undefined ? seoTitle : existingPost.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existingPost.seoDescription,
        seoKeywords: seoKeywords !== undefined ? seoKeywords : existingPost.seoKeywords,
        readingTime,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
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