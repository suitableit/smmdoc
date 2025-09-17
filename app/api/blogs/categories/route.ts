import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/categories - Get all blog categories
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';
    const onlyActive = searchParams.get('onlyActive') === 'true';

    const whereClause: any = {};
    if (onlyActive) {
      whereClause.status = 'active';
    }

    const categories = await db.blogCategory.findMany({
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
      data: categories
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog categories',
        data: null
      },
      { status: 500 }
    );
  }
}

// POST /api/blogs/categories - Create new blog category (Admin only)
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
    const { name, description, color, status = 'active' } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category name is required',
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
    const existingCategory = await db.blogCategory.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'A category with this name already exists',
          data: null
        },
        { status: 400 }
      );
    }

    // Create new category
    const category = await db.blogCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color: color || '#3B82F6',
        status
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog category created successfully',
      data: category
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create blog category',
        data: null
      },
      { status: 500 }
    );
  }
}