import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Default module settings
const defaultModuleSettings = {
  // Affiliate
  affiliateSystemEnabled: false,
  commissionRate: 5,
  minimumPayout: 10,
  // Child Panel
  childPanelSellingEnabled: false,
  childPanelPrice: 10,
  // Others
  serviceUpdateLogsEnabled: true,
  massOrderEnabled: false,
  servicesListPublic: true,
  updatedAt: new Date(),
};

// GET - Load module settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get module settings from database (create if not exists)
    let settings = await db.moduleSettings.findFirst();
    if (!settings) {
      settings = await db.moduleSettings.create({
        data: defaultModuleSettings
      });
    }

    return NextResponse.json({
      success: true,
      moduleSettings: {
        affiliateSystemEnabled: settings.affiliateSystemEnabled,
        commissionRate: settings.commissionRate,
        minimumPayout: settings.minimumPayout,
        childPanelSellingEnabled: settings.childPanelSellingEnabled,
        childPanelPrice: settings.childPanelPrice,
        serviceUpdateLogsEnabled: settings.serviceUpdateLogsEnabled,
        massOrderEnabled: settings.massOrderEnabled,
        servicesListPublic: settings.servicesListPublic,
      }
    });

  } catch (error) {
    console.error('Error loading module settings:', error);
    return NextResponse.json(
      { error: 'Failed to load module settings' },
      { status: 500 }
    );
  }
}

// POST - Save module settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { moduleSettings } = await request.json();

    if (!moduleSettings) {
      return NextResponse.json(
        { error: 'Module settings data is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (moduleSettings.commissionRate && (moduleSettings.commissionRate < 0 || moduleSettings.commissionRate > 100)) {
      return NextResponse.json(
        { error: 'Commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (moduleSettings.minimumPayout && moduleSettings.minimumPayout < 0) {
      return NextResponse.json(
        { error: 'Minimum payout cannot be negative' },
        { status: 400 }
      );
    }

    if (moduleSettings.childPanelPrice && moduleSettings.childPanelPrice < 0) {
      return NextResponse.json(
        { error: 'Child panel price cannot be negative' },
        { status: 400 }
      );
    }

    // Update module settings
    await db.moduleSettings.upsert({
      where: { id: 1 },
      update: {
        affiliateSystemEnabled: moduleSettings.affiliateSystemEnabled ?? false,
        commissionRate: moduleSettings.commissionRate ?? 5,
        minimumPayout: moduleSettings.minimumPayout ?? 10,
        childPanelSellingEnabled: moduleSettings.childPanelSellingEnabled ?? false,
        childPanelPrice: moduleSettings.childPanelPrice ?? 10,
        serviceUpdateLogsEnabled: moduleSettings.serviceUpdateLogsEnabled ?? true,
        massOrderEnabled: moduleSettings.massOrderEnabled ?? false,
        servicesListPublic: moduleSettings.servicesListPublic ?? true,
      },
      create: {
        id: 1,
        affiliateSystemEnabled: moduleSettings.affiliateSystemEnabled ?? false,
        commissionRate: moduleSettings.commissionRate ?? 5,
        minimumPayout: moduleSettings.minimumPayout ?? 10,
        childPanelSellingEnabled: moduleSettings.childPanelSellingEnabled ?? false,
        childPanelPrice: moduleSettings.childPanelPrice ?? 10,
        serviceUpdateLogsEnabled: moduleSettings.serviceUpdateLogsEnabled ?? true,
        massOrderEnabled: moduleSettings.massOrderEnabled ?? false,
        servicesListPublic: moduleSettings.servicesListPublic ?? true,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Module settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving module settings:', error);
    return NextResponse.json(
      { error: 'Failed to save module settings' },
      { status: 500 }
    );
  }
}
