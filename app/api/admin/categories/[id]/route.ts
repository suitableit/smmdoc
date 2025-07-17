import { auth } from '@/auth';
import { currentUser } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    const { id } = await params;
    const body = await request.json();
    const { category_name, position, hideCategory } = body;

    if (!id || !category_name) {
      return NextResponse.json({
        error: 'Category ID and name are required',
        data: null,
        success: false,
      });
    }
    
    // Handle position logic - only for the current user's categories
    if (position === 'top') {
      // If position is 'top', update all existing 'top' categories to 'bottom'
      // but exclude the current category being updated
      await db.category.updateMany({
        where: {
          position: 'top',
          userId: user?.id ?? '',
          id: {
            not: parseInt(id),
          },
        },
        data: {
          position: 'bottom',
        },
      });
    }

    // Prepare update data
    let updateData: any = {
      category_name: category_name,
    };

    // Add position if provided
    if (position) {
      updateData.position = position;
    }

    // Add hideCategory if provided
    if (hideCategory !== undefined) {
      updateData.hideCategory = hideCategory;
    }

    // Update the category in the database
    await db.category.update({
      where: {
        id: parseInt(id),
      },
      data: updateData,
    });
    
    return NextResponse.json({
      error: null,
      message: 'Category updated successfully',
      data: null,
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to update category: ' + error,
      data: null,
      success: false,
    });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({
        error: 'Category ID is required',
        data: null,
        success: false,
      });
    }
    
    const result = await db.category.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    
    return NextResponse.json(
      {
        error: null,
        data: result,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch category: ' + error,
        data: null,
        success: false,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/categories/[id] - Delete category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Unauthorized access. Admin privileges required.',
          success: false,
          data: null
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({
        error: 'Category ID is required',
        data: null,
        success: false,
      }, { status: 400 });
    }

    // Convert string ID to integer
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json({
        error: 'Invalid category ID provided',
        data: null,
        success: false,
      }, { status: 400 });
    }

    // Check if category exists and get service count
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({
        error: 'Category not found',
        success: false,
        data: null
      }, { status: 404 });
    }

    // Delete all refill requests for orders in this category first
    let deleteRefillRequestsResult = { count: 0 };
    try {
      deleteRefillRequestsResult = await db.refillRequest.deleteMany({
        where: {
          order: {
            categoryId: categoryId
          }
        }
      });
    } catch (error) {
      console.log('RefillRequest table not found, skipping...');
    }

    console.log(`Deleted ${deleteRefillRequestsResult.count} refill requests in category ${categoryId}`);

    // Delete all cancel requests for orders in this category
    let deleteCancelRequestsResult = { count: 0 };
    try {
      deleteCancelRequestsResult = await db.cancelRequest.deleteMany({
        where: {
          order: {
            categoryId: categoryId
          }
        }
      });
    } catch (error) {
      console.log('CancelRequest table not found, skipping...');
    }

    console.log(`Deleted ${deleteCancelRequestsResult.count} cancel requests in category ${categoryId}`);

    // Delete all orders in this category
    const deleteOrdersResult = await db.newOrder.deleteMany({
      where: { categoryId: categoryId }
    });

    console.log(`Deleted ${deleteOrdersResult.count} orders in category ${categoryId}`);

    // Delete all services in this category (cascade delete)
    const deleteServicesResult = await db.service.deleteMany({
      where: { categoryId: categoryId }
    });

    console.log(`Deleted ${deleteServicesResult.count} services in category ${categoryId}`);

    // Delete the category
    await db.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: `Category "${category.category_name}" deleted successfully along with ${deleteServicesResult.count} service(s), ${deleteOrdersResult.count} order(s), ${deleteRefillRequestsResult.count} refill request(s), and ${deleteCancelRequestsResult.count} cancel request(s)`,
      error: null
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({
      error: 'Failed to delete category: ' + (error instanceof Error ? error.message : 'Unknown error'),
      success: false,
      data: null
    }, { status: 500 });
  }
}
