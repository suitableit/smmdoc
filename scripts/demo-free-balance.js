const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupFreeBalanceDemo() {
  try {
    console.log('🎯 Setting up Free Balance Demo...\n');

    // 1. Configure admin settings for free balance
    console.log('⚙️ Configuring admin settings...');
    
    await prisma.userSettings.upsert({
      where: { id: 1 },
      update: {
        userFreeBalanceEnabled: true,
        freeAmount: 50.0, // $50 welcome bonus
        signUpPageEnabled: true,
        nameFieldEnabled: true,
        emailConfirmationEnabled: false, // Disable for easier testing
      },
      create: {
        userFreeBalanceEnabled: true,
        freeAmount: 50.0,
        signUpPageEnabled: true,
        nameFieldEnabled: true,
        emailConfirmationEnabled: false,
        resetPasswordEnabled: true,
        resetLinkMax: 3,
        transferFundsPercentage: 3,
        paymentBonusEnabled: false,
        bonusPercentage: 0,
      }
    });

    console.log('✅ Admin settings configured:');
    console.log('   - Free Balance: ENABLED');
    console.log('   - Welcome Bonus: $50');
    console.log('   - Email Confirmation: DISABLED (for testing)');
    console.log('   - Sign Up Page: ENABLED');

    // 2. Clean up any existing test users
    console.log('\n🧹 Cleaning up existing test users...');
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'demo'
        }
      }
    });
    console.log('✅ Test users cleaned up');

    // 3. Show current settings
    const currentSettings = await prisma.userSettings.findFirst();
    console.log('\n📋 Current User Settings:');
    console.log(`   Free Balance Enabled: ${currentSettings?.userFreeBalanceEnabled ? 'YES' : 'NO'}`);
    console.log(`   Free Amount: $${currentSettings?.freeAmount || 0}`);
    console.log(`   Sign Up Enabled: ${currentSettings?.signUpPageEnabled ? 'YES' : 'NO'}`);
    console.log(`   Email Confirmation: ${currentSettings?.emailConfirmationEnabled ? 'YES' : 'NO'}`);

    console.log('\n🎉 Free Balance Demo Setup Complete!');
    console.log('\n🔧 Test Instructions:');
    console.log('1. Go to: http://localhost:3000/sign-up');
    console.log('2. Register a new user with email: demo@test.com');
    console.log('3. Check that user receives $50 welcome bonus');
    console.log('4. Login and verify balance in dashboard');
    
    console.log('\n📝 Test User Suggestions:');
    console.log('   Email: demo1@test.com');
    console.log('   Username: demo1');
    console.log('   Name: Demo User 1');
    console.log('   Password: password123');

    console.log('\n🔍 To verify results, run:');
    console.log('   node scripts/check-demo-users.js');

  } catch (error) {
    console.error('❌ Error during demo setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFreeBalanceDemo();
