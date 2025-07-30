const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetSettings() {
  try {
    await prisma.userSettings.update({
      where: { id: 1 },
      data: {
        signUpPageEnabled: true,
        nameFieldEnabled: true,
        emailConfirmationEnabled: true,
        resetPasswordEnabled: true,
        resetLinkMax: 3,
        transferFundsPercentage: 3,
        userFreeBalanceEnabled: false,
        freeAmount: 0,
        paymentBonusEnabled: false,
        bonusPercentage: 0,
      }
    });
    console.log('✅ Settings reset to default values');
  } catch (error) {
    console.error('❌ Error resetting settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetSettings();
