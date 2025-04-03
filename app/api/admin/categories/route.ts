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
    const { category_name } = validedFields.data;
    await db.category.create({
      data: {
        category_name: category_name,
        userId: user?.id ?? '',
      },
    });

    return NextResponse.json(
      { success: true, error: null, message: 'Category Created!' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
