import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/blogs/bulk - Handle bulk operations on blog posts (Admin only)
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
    const { operation, blogIds } = body;

    // Validate required fields
    if (!operation || !blogIds || !Array.isArray(blogIds) || blogIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Operation and blog IDs are required',
          data: null
        },
        { status: 400 }
      );
    }

    // Convert string IDs to numbers
    const numericIds = blogIds.map(id => parseInt(id)).filter(id => !isNaN(id));

    if (numericIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid blog IDs provided',
          data: null
        },
        { status: 400 }
      );
    }

    let result;
    let message = '';

    switch (operation) {
      case 'publish':
        result = await db.blogPost.updateMany({
          where: {
            id: { in: numericIds }
          },
          data: {
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date()
          }
        });
        message = `Successfully published ${result.count} blog post(s)`;
        break;

      case 'draft':
        result = await db.blogPost.updateMany({
          where: {
            id: { in: numericIds }
          },
          data: {
            status: 'draft',
            publishedAt: null,
            updatedAt: new Date()
          }
        });
        message = `Successfully moved ${result.count} blog post(s) to draft`;
        break;

      case 'delete':
        result = await db.blogPost.deleteMany({
          where: {
            id: { in: numericIds }
          }
        });
        message = `Successfully deleted ${result.count} blog post(s)`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid operation. Supported operations: publish, draft, delete',
            data: null
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      data: {
        operation,
        affectedCount: result.count,
        blogIds: numericIds
      }
    });

  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform bulk operation',
        data: null
      },
      { status: 500 }
    );
  }
}