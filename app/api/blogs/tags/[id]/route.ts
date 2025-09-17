import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/blogs/tags/[id] - Get single blog tag
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag ID',
          data: null
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const includePostCount = searchParams.get('includePostCount') === 'true';

    const tag = await db.blogTag.findUnique({
      where: { id: tagId },
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

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog tag not found',
          data: null
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tag
    });
  } catch (error) {
    console.error('Error fetching blog tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch blog tag',
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/tags/[id] - Update blog tag (Admin only)
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
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag ID',
          data: null
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, description, color, isActive } = body;

    // Check if tag exists
    const existingTag = await db.blogTag.findUnique({
      where: { id: tagId }
    });

    if (!existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog tag not found',
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
            error: 'Tag name is required',
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

      // Check if new slug conflicts with existing tags (excluding current one)
      if (newSlug !== existingTag.slug) {
        const slugExists = await db.blogTag.findFirst({
          where: {
            slug: newSlug,
            id: { not: tagId }
          }
        });

        if (slugExists) {
          return NextResponse.json(
            {
              success: false,
              error: 'A tag with this name already exists',
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
    if (color !== undefined) updateData.color = color || '#10B981';
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update tag
    const updatedTag = await db.blogTag.update({
      where: { id: tagId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Blog tag updated successfully',
      data: updatedTag
    });
  } catch (error) {
    console.error('Error updating blog tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update blog tag',
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/tags/[id] - Delete blog tag (Admin only)
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
    const tagId = parseInt(id);

    if (isNaN(tagId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tag ID',
          data: null
        },
        { status: 400 }
      );
    }

    // Check if tag exists
    const existingTag = await db.blogTag.findUnique({
      where: { id: tagId },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });

    if (!existingTag) {
      return NextResponse.json(
        {
          success: false,
          error: 'Blog tag not found',
          data: null
        },
        { status: 404 }
      );
    }

    // Check if tag has associated posts
    if (existingTag._count.posts > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete tag that has associated blog posts. Please remove the tag from posts first.',
          data: null
        },
        { status: 400 }
      );
    }

    // Delete tag
    await db.blogTag.delete({
      where: { id: tagId }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog tag deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('Error deleting blog tag:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete blog tag',
        data: null
      },
      { status: 500 }
    );
  }
}