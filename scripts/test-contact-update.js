const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testContactUpdate() {
  try {
    console.log('🧪 Testing Contact Settings Update...');
    
    // Get current settings
    console.log('\n📋 Current settings:');
    const currentSettings = await prisma.contactSettings.findFirst();
    console.log(currentSettings);
    
    // Try to update maxPendingContacts to "5"
    console.log('\n🔄 Updating maxPendingContacts to "5"...');
    const updated = await prisma.contactSettings.update({
      where: { id: currentSettings.id },
      data: {
        maxPendingContacts: "5"
      }
    });
    console.log('✅ Update successful:', updated);
    
    // Verify the update
    console.log('\n✅ Verifying update...');
    const verifySettings = await prisma.contactSettings.findFirst();
    console.log('New settings:', verifySettings);
    
    // Try to update back to "unlimited"
    console.log('\n🔄 Updating back to "unlimited"...');
    const revert = await prisma.contactSettings.update({
      where: { id: currentSettings.id },
      data: {
        maxPendingContacts: "unlimited"
      }
    });
    console.log('✅ Revert successful:', revert);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContactUpdate();
