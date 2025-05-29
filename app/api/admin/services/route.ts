/* eslint-disable @typescript-eslint/no-explicit-any */
import { currentUser } from '@/lib/actions/auth';
import { db } from '@/lib/db';
import { createServiceSchema } from '@/lib/validators/admin/services/services.validator';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const user = await currentUser();
  try {
    const validedFields = createServiceSchema.safeParse(await request.json());
    if (!validedFields.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid Fields!' },
        { status: 400 }
      );
    }
    const {
      name,
      description,
      categoryId,
      rate,
      max_order,
      min_order,
      perqty,
      avg_time,
    } = validedFields.data;
    await db.service.create({
      data: {
        name: name,
        description: description,
        categoryId: categoryId,
        rate: Number(rate),
        max_order: Number(max_order),
        min_order: Number(min_order),
        perqty: Number(perqty),
        avg_time: avg_time,
        userId: user?.id ?? '',
      },
    });
    return NextResponse.json(
      { success: true, data: null, error: null, message: 'Service Created!' },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, data: null, error: error.message },
      { status: 500 }
    );
  }
}
