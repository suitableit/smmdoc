import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contact settings
    const settings = await db.contactSettings.findFirst({
      orderBy: { id: 'desc' }
    });

    // Get contact categories
    const categories = await db.contactCategory.findMany({
      orderBy: { name: 'asc' }
    });

    const formattedSettings = {
      contactSystemEnabled: settings?.contactSystemEnabled ?? true,
      maxPendingContacts: settings?.maxPendingContacts ?? '3',
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name
      }))
    };

    return NextResponse.json({
      success: true,
      contactSettings: formattedSettings
    });
  } catch (error) {
    console.error('Error loading contact settings:', error);
    return NextResponse.json({ error: 'Failed to load contact settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactSettings } = await request.json();
    if (!contactSettings) {
      return NextResponse.json({ error: 'Contact settings data is required' }, { status: 400 });
    }

    if (!contactSettings.categories || !Array.isArray(contactSettings.categories)) {
      return NextResponse.json({ error: 'Categories must be an array' }, { status: 400 });
    }

    if (contactSettings.categories.length === 0) {
      return NextResponse.json({ error: 'At least one category is required' }, { status: 400 });
    }

    for (const category of contactSettings.categories) {
      if (!category.name || !category.name.trim()) {
        return NextResponse.json({ error: 'All categories must have a name' }, { status: 400 });
      }
    }

    // Upsert contact settings
    const existingSettings = await db.contactSettings.findFirst();

    if (existingSettings) {
      await db.contactSettings.update({
        where: { id: existingSettings.id },
        data: {
          contactSystemEnabled: contactSettings.contactSystemEnabled ?? true,
          maxPendingContacts: contactSettings.maxPendingContacts ?? '3'
        }
      });
    } else {
      await db.contactSettings.create({
        data: {
          contactSystemEnabled: contactSettings.contactSystemEnabled ?? true,
          maxPendingContacts: contactSettings.maxPendingContacts ?? '3'
        }
      });
    }

    // Handle categories
    const existingCategories = await db.contactCategory.findMany();
    const existingCategoryMap = new Map(
      existingCategories.map((cat) => [cat.id, cat.name])
    );

    // Update or create categories
    for (const category of contactSettings.categories) {
      if (category.id && existingCategoryMap.has(category.id)) {
        if (existingCategoryMap.get(category.id) !== category.name) {
          await db.contactCategory.update({
            where: { id: category.id },
            data: { name: category.name.trim() }
          });
        }
      } else if (!category.id) {
        await db.contactCategory.create({
          data: { name: category.name.trim() }
        });
      }
    }

    // Delete removed categories
    const newCategoryIds = contactSettings.categories
      .filter((cat: any) => cat.id)
      .map((cat: any) => cat.id);

    for (const [existingId] of existingCategoryMap) {
      if (!newCategoryIds.includes(existingId)) {
        await db.contactCategory.delete({
          where: { id: Number(existingId) }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Contact settings saved successfully'
    });
  } catch (error) {
    console.error('Error saving contact settings:', error);
    return NextResponse.json({ error: 'Failed to save contact settings' }, { status: 500 });
  }
}
