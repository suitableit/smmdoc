const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllContactSettings() {
  try {
    console.log('🔍 Checking ALL contact_settings records...');
    
    // Get all contact settings records
    const allSettings = await prisma.contactSettings.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`📋 Found ${allSettings.length} contact_settings records:`);
    allSettings.forEach((setting, index) => {
      console.log(`   ${index + 1}. ID: ${setting.id}, maxPendingContacts: "${setting.maxPendingContacts}", updatedAt: ${setting.updatedAt}`);
    });
    
    // Check which one findFirst returns
    console.log('\n🔍 Testing findFirst()...');
    const firstRecord = await prisma.contactSettings.findFirst();
    console.log('findFirst() returns:', firstRecord);
    
    // Check which one findFirst with orderBy returns
    console.log('\n🔍 Testing findFirst() with orderBy id desc...');
    const latestRecord = await prisma.contactSettings.findFirst({
      orderBy: { id: 'desc' }
    });
    console.log('findFirst() with orderBy desc returns:', latestRecord);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllContactSettings();
