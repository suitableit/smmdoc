import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Default user settings for public access
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
};

// GET - Load public user settings (no auth required)
export async function GET() {
  try {
    // Get user settings from database
    const settings = await db.userSettings.findFirst();
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        userSettings: defaultUserSettings
      });
    }

    // Return only public-safe settings
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
    console.error('Error loading public user settings:', error);
    // Return default settings on error
    return NextResponse.json({
      success: true,
      userSettings: defaultUserSettings
    });
  }
}
