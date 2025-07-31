const { PrismaClient } = require('../node_modules/.prisma/contact-client');

const contactPrisma = new PrismaClient();

async function testContactSchema() {
  try {
    console.log('🧪 Testing Contact Schema Models...');

    // Check available models in contact schema
    const allKeys = Object.keys(contactPrisma);
    const models = allKeys.filter(key => 
      !key.startsWith('$') && 
      !key.startsWith('_') && 
      key !== 'constructor' &&
      typeof contactPrisma[key] === 'object' &&
      contactPrisma[key] !== null
    );
    
    console.log('\nContact Schema Models:', models);

    // Test each model
    for (const model of models) {
      try {
        console.log(`\n✅ Testing ${model}...`);
        const count = await contactPrisma[model].count();
        console.log(`   ${model} count: ${count}`);
      } catch (error) {
        console.log(`   ❌ Error with ${model}: ${error.message}`);
      }
    }

    console.log('\n🎉 Contact Schema test completed!');
    console.log('📋 Now open Contact Schema Studio:');
    console.log('   npx prisma studio --schema=prisma/contact-schema.prisma');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await contactPrisma.$disconnect();
  }
}

testContactSchema();
