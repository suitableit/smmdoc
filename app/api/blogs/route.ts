import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs - Get blog posts with pagination (admin gets all, public gets published only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // For admin filtering
    
    const skip = (page - 1) * limit;
    
    // Check if user is admin
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';
    
    // Build where clause for filtering
    const whereClause: Record<string, unknown> = {};
    
    // For non-admin users, only show published posts
    if (!isAdmin) {
      whereClause.status = 'published';
      whereClause.publishedAt = { lte: new Date() };
    } else if (status && status !== 'all') {
      // Admin can filter by specific status
      whereClause.status = status;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get blog posts with pagination
    const [posts, totalCount] = await Promise.all([
      db.blogPost.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true
            }
          }
        },
        orderBy: isAdmin ? {
          createdAt: 'desc'
        } : {
          publishedAt: 'desc'
        },
        skip,
        take: limit
      }),
      db.blogPost.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog posts',
        data: null
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog post (Admin only)
export async function POST(req: NextRequest) {
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

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Title and content are required',
          data: null
        },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Check if slug already exists
    const existingPost = await db.blogPost.findUnique({
      where: { slug: finalSlug }
    });

    if (existingPost) {
      return NextResponse.json(
        {
          success: false,
          error: 'A post with this slug already exists',
          data: null
        },
        { status: 400 }
      );
    }

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Auto-fill empty fields
    // Strip HTML tags from content for auto-fill purposes
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
    };
    
    const plainTextContent = stripHtml(content);
    
    // Auto-fill Meta Title from Post Title (first 60 characters)
    const finalSeoTitle = seoTitle || (title.length > 60 ? title.substring(0, 60) + '...' : title);
    
    // Auto-fill Meta Description from Post Content (first 160 characters)
    const finalSeoDescription = seoDescription || (plainTextContent.length > 160 ? plainTextContent.substring(0, 160) + '...' : plainTextContent);
    
    // Auto-fill Post Excerpt from Post Content (first 160 characters)
    const finalExcerpt = excerpt || (plainTextContent.length > 160 ? plainTextContent.substring(0, 160) + '...' : plainTextContent);

    // Create blog post
    const post = await db.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: finalExcerpt,
        content,
        featuredImage,
        status: status || 'draft',
        publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        readingTime,
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        seoKeywords,
        authorId: session.user.id
      },
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

    // Return response with original empty values for fields that were auto-filled
    const responsePost = {
      ...post,
      excerpt: excerpt || null, // Return original empty value if it was empty
      seoTitle: seoTitle || null, // Return original empty value if it was empty
      seoDescription: seoDescription || null // Return original empty value if it was empty
    };

    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      data: responsePost
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog post',
        data: null
      },
      { status: 500 }
    );
  }
}