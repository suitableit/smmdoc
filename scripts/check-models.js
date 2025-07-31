const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkModels() {
  try {
    console.log('🔍 Checking all available models in main Prisma...');

    // Get all available properties
    const allKeys = Object.keys(prisma);
    console.log('\nAll Prisma client properties:');
    
    // Filter model-like properties (exclude internal methods)
    const models = allKeys.filter(key => 
      !key.startsWith('$') && 
      !key.startsWith('_') && 
      key !== 'constructor' &&
      typeof prisma[key] === 'object' &&
      prisma[key] !== null
    );
    
    console.log('Available models:', models);
    
    // Check specifically for contact models
    const contactModels = models.filter(model => 
      model.toLowerCase().includes('contact')
    );
    
    console.log('\nContact-related models:', contactModels);
    
    // Test each contact model
    for (const model of contactModels) {
      try {
        console.log(`\n✅ Testing ${model}...`);
        const count = await prisma[model].count();
        console.log(`   ${model} count: ${count}`);
      } catch (error) {
        console.log(`   ❌ Error with ${model}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModels();
