import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs - Get blog posts with pagination (admin gets all, public gets published only)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const status = searchParams.get('status'); // For admin filtering
    
    const skip = (page - 1) * limit;
    
    // Check if user is admin
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';
    
    // Build where clause for filtering
    const whereClause: any = {};
    
    // For non-admin users, only show published posts
    if (!isAdmin) {
      whereClause.status = 'published';
      whereClause.publishedAt = { lte: new Date() };
    } else if (status && status !== 'all') {
      // Admin can filter by specific status
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = {
        slug: category
      };
    }
    
    if (tag) {
      whereClause.tags = {
        some: {
          slug: tag
        }
      };
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
      categoryId,
      tagIds,
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

    // Create blog post
    const post = await db.blogPost.create({
      data: {
        title,
        slug: finalSlug,
        excerpt,
        content,
        featuredImage,
        status: status || 'draft',
        publishedAt: status === 'published' ? (publishedAt ? new Date(publishedAt) : new Date()) : null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        readingTime,
        seoTitle,
        seoDescription,
        seoKeywords,
        authorId: session.user.id,
        categoryId: categoryId || 1, // Default to "Uncategorized" category
        tags: tagIds ? {
          connect: tagIds.map((id: number) => ({ id }))
        } : undefined
      },
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
      message: 'Blog post created successfully',
      data: post
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