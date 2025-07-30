import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Default contact settings
const defaultContactSettings = {
  contactSystemEnabled: true,
  maxPendingContacts: '3',
  categories: [
    { id: 1, name: 'General Inquiry' },
    { id: 2, name: 'Business Partnership' },
    { id: 3, name: 'Media & Press' },
  ],
};

// GET - Load contact settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contact settings from database (create if not exists)
    let settings = await db.contactSettings.findFirst({
      include: {
        categories: true
      }
    });

    if (!settings) {
      settings = await db.contactSettings.create({
        data: {
          contactSystemEnabled: defaultContactSettings.contactSystemEnabled,
          maxPendingContacts: defaultContactSettings.maxPendingContacts,
          categories: {
            create: defaultContactSettings.categories
          }
        },
        include: {
          categories: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      contactSettings: {
        contactSystemEnabled: settings.contactSystemEnabled,
        maxPendingContacts: settings.maxPendingContacts,
        categories: settings.categories.map(category => ({
          id: category.id,
          name: category.name
        })),
      }
    });

  } catch (error) {
    console.error('Error loading contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to load contact settings' },
      { status: 500 }
    );
  }
}

// POST - Save contact settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactSettings } = await request.json();

    if (!contactSettings) {
      return NextResponse.json(
        { error: 'Contact settings data is required' },
        { status: 400 }
      );
    }

    // Validate categories
    if (!contactSettings.categories || !Array.isArray(contactSettings.categories)) {
      return NextResponse.json(
        { error: 'Categories must be an array' },
        { status: 400 }
      );
    }

    if (contactSettings.categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    // Validate each category
    for (const category of contactSettings.categories) {
      if (!category.name || !category.name.trim()) {
        return NextResponse.json(
          { error: 'All categories must have a name' },
          { status: 400 }
        );
      }
    }

    // Update contact settings
    await db.contactSettings.upsert({
      where: { id: 1 },
      update: {
        contactSystemEnabled: contactSettings.contactSystemEnabled ?? true,
        maxPendingContacts: contactSettings.maxPendingContacts ?? '3',
      },
      create: {
        id: 1,
        contactSystemEnabled: contactSettings.contactSystemEnabled ?? true,
        maxPendingContacts: contactSettings.maxPendingContacts ?? '3',
      }
    });

    // Delete existing categories and create new ones
    await db.contactCategory.deleteMany({
      where: { contactSettingsId: 1 }
    });

    await db.contactCategory.createMany({
      data: contactSettings.categories.map((category: any) => ({
        name: category.name.trim(),
        contactSettingsId: 1
      }))
    });

    return NextResponse.json({
      success: true,
      message: 'Contact settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving contact settings:', error);
    return NextResponse.json(
      { error: 'Failed to save contact settings' },
      { status: 500 }
    );
  }
}
