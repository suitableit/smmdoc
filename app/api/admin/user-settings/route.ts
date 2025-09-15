import { auth } from '@/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Default user settings
const defaultUserSettings = {
  resetPasswordEnabled: true,
  signUpPageEnabled: true,
  nameFieldEnabled: true,
  emailConfirmationEnabled: true,
  resetLinkMax: 3,
  transferFundsPercentage: 3,
  userFreeBalanceEnabled: false,
  freeAmount: 0,
  paymentBonusEnabled: false,
  bonusPercentage: 0,
  updatedAt: new Date(),
};

// GET - Load user settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user settings from database (create if not exists)
    let settings = await db.userSettings.findFirst();
    if (!settings) {
      settings = await db.userSettings.create({
        data: defaultUserSettings
      });
    }

    return NextResponse.json({
      success: true,
      userSettings: {
        resetPasswordEnabled: settings.resetPasswordEnabled,
        signUpPageEnabled: settings.signUpPageEnabled,
        nameFieldEnabled: settings.nameFieldEnabled,
        emailConfirmationEnabled: settings.emailConfirmationEnabled,
        resetLinkMax: settings.resetLinkMax,
        transferFundsPercentage: settings.transferFundsPercentage,
        userFreeBalanceEnabled: settings.userFreeBalanceEnabled,
        freeAmount: settings.freeAmount,
        paymentBonusEnabled: settings.paymentBonusEnabled,
        bonusPercentage: settings.bonusPercentage,
      }
    });

  } catch (error) {
    console.error('Error loading user settings:', error);
    return NextResponse.json(
      { error: 'Failed to load user settings' },
      { status: 500 }
    );
  }
}

// POST - Save user settings
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userSettings } = await request.json();

    if (!userSettings) {
      return NextResponse.json(
        { error: 'User settings data is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (userSettings.resetLinkMax && (userSettings.resetLinkMax < 1 || userSettings.resetLinkMax > 10)) {
      return NextResponse.json(
        { error: 'Reset link max must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (userSettings.transferFundsPercentage && (userSettings.transferFundsPercentage < 0 || userSettings.transferFundsPercentage > 100)) {
      return NextResponse.json(
        { error: 'Transfer funds percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (userSettings.freeAmount && userSettings.freeAmount < 0) {
      return NextResponse.json(
        { error: 'Free amount cannot be negative' },
        { status: 400 }
      );
    }

    if (userSettings.bonusPercentage && (userSettings.bonusPercentage < 0 || userSettings.bonusPercentage > 100)) {
      return NextResponse.json(
        { error: 'Bonus percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Update user settings
    await db.userSettings.upsert({
      where: { id: 1 },
      update: {
        resetPasswordEnabled: userSettings.resetPasswordEnabled ?? true,
        signUpPageEnabled: userSettings.signUpPageEnabled ?? true,
        nameFieldEnabled: userSettings.nameFieldEnabled ?? true,
        emailConfirmationEnabled: userSettings.emailConfirmationEnabled ?? true,
        resetLinkMax: userSettings.resetLinkMax ?? 3,
        transferFundsPercentage: userSettings.transferFundsPercentage ?? 3,
        userFreeBalanceEnabled: userSettings.userFreeBalanceEnabled ?? false,
        freeAmount: userSettings.freeAmount ?? 0,
        paymentBonusEnabled: userSettings.paymentBonusEnabled ?? false,
        bonusPercentage: userSettings.bonusPercentage ?? 0,
      },
      create: {
        id: 1,
        resetPasswordEnabled: userSettings.resetPasswordEnabled ?? true,
        signUpPageEnabled: userSettings.signUpPageEnabled ?? true,
        nameFieldEnabled: userSettings.nameFieldEnabled ?? true,
        emailConfirmationEnabled: userSettings.emailConfirmationEnabled ?? true,
        resetLinkMax: userSettings.resetLinkMax ?? 3,
        transferFundsPercentage: userSettings.transferFundsPercentage ?? 3,
        userFreeBalanceEnabled: userSettings.userFreeBalanceEnabled ?? false,
        freeAmount: userSettings.freeAmount ?? 0,
        paymentBonusEnabled: userSettings.paymentBonusEnabled ?? false,
        bonusPercentage: userSettings.bonusPercentage ?? 0,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json(
      { error: 'Failed to save user settings' },
      { status: 500 }
    );
  }
}
