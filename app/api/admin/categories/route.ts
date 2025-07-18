/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { createCategorySchema } from '@/lib/validators/admin/categories/categories.validator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  try {
    const validedFields = createCategorySchema.safeParse(await request.json());
    if (!validedFields.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid Fields!' },
        { status: 400 }
      );
    }
    const { category_name, position, hideCategory } = validedFields.data;

    // Handle position logic - only for the current user's categories
    if (position === 'top') {
      // If position is 'top', update all existing 'top' categories to 'bottom'
      await db.category.updateMany({
        where: {
          position: 'top',
          userId: user?.id ?? '',
        },
        data: {
          position: 'bottom',
        },
      });
    }

    let categoryData: any = {
      category_name: category_name,
      position: position || 'bottom',
      hideCategory: hideCategory || 'no',
      userId: user?.id ?? '',
    };

    const newCategory = await db.category.create({
      data: categoryData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            services: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, error: null, message: 'Category Created!', data: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
