import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/tags - Get all blog tags
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';
    const onlyActive = searchParams.get('onlyActive') === 'true';
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (onlyActive) {
      whereClause.isActive = true;
    }
    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const tags = await db.blogTag.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      },
      ...(includePostCount && {
        include: {
          _count: {
            select: {
              posts: {
                where: {
                  status: 'published'
                }
              }
            }
          }
        }
      })
    });

    return NextResponse.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog tags',
        data: null
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs/tags - Create new blog tag (Admin only)
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
    const { name, description, color, isActive = true } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tag name is required',
          data: null
        },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingTag = await db.blogTag.findUnique({
      where: { slug }
    });

    if (existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'A tag with this name already exists',
          data: null
        },
        { status: 400 }
      );
    }

    // Create new tag
    const tag = await db.blogTag.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || '#10B981',
        isActive
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog tag created successfully',
      data: tag
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog tag',
        data: null
      },
      { status: 500 }
    );
  }
}