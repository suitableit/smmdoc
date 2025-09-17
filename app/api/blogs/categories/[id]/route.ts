import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/categories/[id] - Get single blog category
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          data: null
        },
        { status: 400 }
      );
    }

    // Prevent deletion of default "Uncategorized" category
    if (categoryId === 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete the default "Uncategorized" category.',
          data: null
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';

    const category = await db.blogCategory.findUnique({
      where: { id: categoryId },
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

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog category not found',
          data: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching blog category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog category',
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/categories/[id] - Update blog category (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          data: null
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, color, isActive } = body;

    // Check if category exists
    const existingCategory = await db.blogCategory.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog category not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) {
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

      // Generate new slug if name is being updated
      const newSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if new slug conflicts with existing categories (excluding current one)
      if (newSlug !== existingCategory.slug) {
        const slugExists = await db.blogCategory.findFirst({
          where: {
            slug: newSlug,
            id: { not: categoryId }
          }
        });

        if (slugExists) {
          return NextResponse.json(
            {
              success: false,
              error: 'A category with this name already exists',
              data: null
            },
            { status: 400 }
          );
        }
      }

      updateData.name = name.trim();
      updateData.slug = newSlug;
    }
    
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (color !== undefined) updateData.color = color || '#3B82F6';
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update category
    const updatedCategory = await db.blogCategory.update({
      where: { id: categoryId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Blog category updated successfully',
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating blog category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog category',
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/categories/[id] - Delete blog category (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid category ID',
          data: null
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await db.blogCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog category not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Check if category has associated posts
    if (existingCategory._count.posts > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category that has associated blog posts. Please reassign or delete the posts first.',
          data: null
        },
        { status: 400 }
      );
    }

    // Delete category
    await db.blogCategory.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog category deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog category',
        data: null
      },
      { status: 500 }
    );
  }
}