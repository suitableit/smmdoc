import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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

export async function GET() {
  try {
    let settings = await db.userSettings.findFirst();
    if (!settings) {
      return NextResponse.json({
        success: true,
        userSettings: defaultUserSettings
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
    console.error('Error loading public user settings:', error);
    return NextResponse.json({
      success: true,
      userSettings: defaultUserSettings
    });
  }
}
