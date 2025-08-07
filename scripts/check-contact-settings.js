const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkContactSettings() {
  try {
    console.log('🔍 Checking Contact Settings Database Values');
    console.log('==========================================');

    // Get contact settings from database
    const settings = await prisma.contactSettings.findFirst();
    
    if (settings) {
      console.log('\n📋 Contact Settings Found:');
      console.log(`   ID: ${settings.id}`);
      console.log(`   Contact System Enabled: ${settings.contactSystemEnabled}`);
      console.log(`   Max Pending Contacts: "${settings.maxPendingContacts}"`);
      console.log(`   Created At: ${settings.createdAt}`);
      console.log(`   Updated At: ${settings.updatedAt}`);
    } else {
      console.log('\n❌ No contact settings found in database');
    }

    // Also check categories
    const categories = await prisma.contactCategory.findMany();
    console.log(`\n📂 Contact Categories (${categories.length} found):`);
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (ID: ${cat.id})`);
    });

  } catch (error) {
    console.error('❌ Error checking contact settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContactSettings();