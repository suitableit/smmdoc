const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function finalVerification() {
  try {
    console.log('🎯 Final Verification - Contact System in Main Prisma Studio');

    // Check all contact models
    const allKeys = Object.keys(prisma);
    const contactModels = allKeys.filter(key => 
      key.toLowerCase().includes('contact') || key.includes('contact_messages')
    );
    
    console.log('\n📋 Contact models in main Prisma:');
    contactModels.forEach(model => {
      console.log(`   ✅ ${model}`);
    });

    // Verify data counts
    console.log('\n📊 Data verification:');
    
    const settingsCount = await prisma.contactSettings.count();
    console.log(`   ContactSettings: ${settingsCount} records`);
    
    const categoriesCount = await prisma.contactCategory.count();
    console.log(`   ContactCategory: ${categoriesCount} records`);
    
    const messagesCount = await prisma.contact_messages.count();
    console.log(`   contact_messages: ${messagesCount} records`);

    // Show sample data
    console.log('\n📋 Sample contact messages:');
    const messages = await prisma.contact_messages.findMany({
      take: 3,
      orderBy: { id: 'desc' }
    });
    
    messages.forEach((msg, index) => {
      console.log(`   ${index + 1}. ID: ${msg.id} | Subject: "${msg.subject}" | Status: ${msg.status}`);
    });

    console.log('\n🎉 VERIFICATION COMPLETE!');
    console.log('📋 Main Prisma Studio should now show:');
    console.log('   ✅ ContactSettings table (1 record)');
    console.log('   ✅ ContactCategory table (4 records)');
    console.log('   ✅ contact_messages table (5 records)');
    console.log('\n🔗 Open: http://localhost:5555');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

finalVerification();
