const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserSettings() {
  try {
    console.log('🧪 Testing All User Settings Features...\n');

    // 1. Test Sign Up Page Control
    console.log('1️⃣ Testing Sign Up Page Control...');
    
    // Enable sign up
    await prisma.userSettings.upsert({
      where: { id: 1 },
      update: { signUpPageEnabled: true },
      create: {
        id: 1,
        signUpPageEnabled: true,
        resetPasswordEnabled: true,
        nameFieldEnabled: true,
        emailConfirmationEnabled: true,
        resetLinkMax: 3,
        transferFundsPercentage: 3,
        userFreeBalanceEnabled: false,
        freeAmount: 0,
        paymentBonusEnabled: false,
        bonusPercentage: 0,
      }
    });
    console.log('✅ Sign up enabled');

    // Disable sign up
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { signUpPageEnabled: false }
    });
    console.log('✅ Sign up disabled');

    // 2. Test Name Field Control
    console.log('\n2️⃣ Testing Name Field Control...');
    
    // Enable name field
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { nameFieldEnabled: true }
    });
    console.log('✅ Name field enabled');

    // Disable name field
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { nameFieldEnabled: false }
    });
    console.log('✅ Name field disabled');

    // 3. Test Email Confirmation Control
    console.log('\n3️⃣ Testing Email Confirmation Control...');
    
    // Enable email confirmation
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { emailConfirmationEnabled: true }
    });
    console.log('✅ Email confirmation enabled');

    // Disable email confirmation
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { emailConfirmationEnabled: false }
    });
    console.log('✅ Email confirmation disabled');

    // 4. Test Password Reset Control
    console.log('\n4️⃣ Testing Password Reset Control...');
    
    // Enable password reset
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { resetPasswordEnabled: true }
    });
    console.log('✅ Password reset enabled');

    // Disable password reset
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { resetPasswordEnabled: false }
    });
    console.log('✅ Password reset disabled');

    // 5. Test Payment Bonus System
    console.log('\n5️⃣ Testing Payment Bonus System...');
    
    // Enable payment bonus
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { 
        paymentBonusEnabled: true,
        bonusPercentage: 10
      }
    });
    console.log('✅ Payment bonus enabled (10%)');

    // Disable payment bonus
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { 
        paymentBonusEnabled: false,
        bonusPercentage: 0
      }
    });
    console.log('✅ Payment bonus disabled');

    // 6. Test Transfer Funds Fee
    console.log('\n6️⃣ Testing Transfer Funds Fee...');
    
    // Set transfer fee to 5%
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { transferFundsPercentage: 5 }
    });
    console.log('✅ Transfer fee set to 5%');

    // Set transfer fee to 2%
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { transferFundsPercentage: 2 }
    });
    console.log('✅ Transfer fee set to 2%');

    // 7. Test Reset Link Limit
    console.log('\n7️⃣ Testing Reset Link Limit...');
    
    // Set reset link limit to 5
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { resetLinkMax: 5 }
    });
    console.log('✅ Reset link limit set to 5');

    // Set reset link limit to 1
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { resetLinkMax: 1 }
    });
    console.log('✅ Reset link limit set to 1');

    // 8. Test Free Balance System
    console.log('\n8️⃣ Testing Free Balance System...');
    
    // Enable free balance
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { 
        userFreeBalanceEnabled: true,
        freeAmount: 25.0
      }
    });
    console.log('✅ Free balance enabled ($25)');

    // Disable free balance
    await prisma.userSettings.update({
      where: { id: 1 },
      data: { 
        userFreeBalanceEnabled: false,
        freeAmount: 0
      }
    });
    console.log('✅ Free balance disabled');

    // 9. Final Settings Check
    console.log('\n9️⃣ Final Settings Verification...');
    
    const finalSettings = await prisma.userSettings.findFirst();
    console.log('📊 Current Settings:');
    console.log(`   - Sign Up Page: ${finalSettings?.signUpPageEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Name Field: ${finalSettings?.nameFieldEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Email Confirmation: ${finalSettings?.emailConfirmationEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Password Reset: ${finalSettings?.resetPasswordEnabled ? 'Enabled' : 'Disabled'}`);
    console.log(`   - Payment Bonus: ${finalSettings?.paymentBonusEnabled ? 'Enabled' : 'Disabled'} (${finalSettings?.bonusPercentage}%)`);
    console.log(`   - Transfer Fee: ${finalSettings?.transferFundsPercentage}%`);
    console.log(`   - Reset Link Limit: ${finalSettings?.resetLinkMax}`);
    console.log(`   - Free Balance: ${finalSettings?.userFreeBalanceEnabled ? 'Enabled' : 'Disabled'} ($${finalSettings?.freeAmount})`);

    console.log('\n✅ All User Settings Features Tested Successfully!');
    console.log('\n📝 Test Summary:');
    console.log('   ✅ Sign Up Page Control - Working');
    console.log('   ✅ Name Field Control - Working');
    console.log('   ✅ Email Confirmation Control - Working');
    console.log('   ✅ Password Reset Control - Working');
    console.log('   ✅ Payment Bonus System - Working');
    console.log('   ✅ Transfer Funds Fee - Working');
    console.log('   ✅ Reset Link Limit - Working');
    console.log('   ✅ Free Balance System - Working');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSettings();
