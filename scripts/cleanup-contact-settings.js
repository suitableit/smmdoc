const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupContactSettings() {
  try {
    console.log('🧹 Cleaning up duplicate contact_settings records...');
    
    // Get all records
    const allSettings = await prisma.contactSettings.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`📋 Found ${allSettings.length} records:`);
    allSettings.forEach((setting, index) => {
      console.log(`   ${index + 1}. ID: ${setting.id}, maxPendingContacts: "${setting.maxPendingContacts}", updatedAt: ${setting.updatedAt}`);
    });
    
    if (allSettings.length > 1) {
      // Keep the most recently updated record (first one after sorting by updatedAt desc)
      const keepRecord = allSettings[0];
      const deleteRecords = allSettings.slice(1);
      
      console.log(`\n✅ Keeping record ID: ${keepRecord.id} (most recent)`);
      console.log(`🗑️ Deleting ${deleteRecords.length} old records...`);
      
      for (const record of deleteRecords) {
        console.log(`   Deleting ID: ${record.id}`);
        await prisma.contactSettings.delete({
          where: { id: record.id }
        });
      }
      
      console.log('✅ Cleanup completed!');
    } else {
      console.log('✅ No duplicate records found.');
    }
    
    // Verify final state
    console.log('\n📋 Final state:');
    const finalSettings = await prisma.contactSettings.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    console.log('Remaining record:', finalSettings);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupContactSettings();
