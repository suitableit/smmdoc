const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testContactSave() {
  try {
    console.log('🧪 Testing Contact Settings Save Process');
    console.log('=========================================');

    // First, check current value
    console.log('\n1️⃣ Current database value:');
    const currentSettings = await prisma.contactSettings.findFirst();
    if (currentSettings) {
      console.log(`   Max Pending Contacts: "${currentSettings.maxPendingContacts}"`);
    }

    // Test saving 'unlimited' value
    console.log('\n2️⃣ Testing save with "unlimited" value...');
    
    if (currentSettings) {
      await prisma.contactSettings.update({
        where: { id: currentSettings.id },
        data: {
          maxPendingContacts: 'unlimited'
        }
      });
      console.log('   ✅ Updated to "unlimited"');
    } else {
      await prisma.contactSettings.create({
        data: {
          contactSystemEnabled: true,
          maxPendingContacts: 'unlimited'
        }
      });
      console.log('   ✅ Created with "unlimited"');
    }

    // Verify the save
    console.log('\n3️⃣ Verifying save...');
    const updatedSettings = await prisma.contactSettings.findFirst();
    if (updatedSettings) {
      console.log(`   Max Pending Contacts: "${updatedSettings.maxPendingContacts}"`);
      
      if (updatedSettings.maxPendingContacts === 'unlimited') {
        console.log('   ✅ SUCCESS: Value saved correctly as "unlimited"');
      } else {
        console.log('   ❌ FAILED: Value is not "unlimited"');
      }
    }

    // Test saving '2' value
    console.log('\n4️⃣ Testing save with "2" value...');
    await prisma.contactSettings.update({
      where: { id: updatedSettings.id },
      data: {
        maxPendingContacts: '2'
      }
    });
    
    const testSettings = await prisma.contactSettings.findFirst();
    console.log(`   Max Pending Contacts: "${testSettings.maxPendingContacts}"`);
    
    if (testSettings.maxPendingContacts === '2') {
      console.log('   ✅ SUCCESS: Value saved correctly as "2"');
    } else {
      console.log('   ❌ FAILED: Value is not "2"');
    }

  } catch (error) {
    console.error('❌ Error testing contact save:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContactSave();