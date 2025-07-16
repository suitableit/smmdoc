const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFieldTypes() {
  try {
    console.log('🔄 Checking field types for foreign key compatibility...');

    // Check NewOrder field types
    const orderSample = await prisma.$queryRaw`
      SELECT categoryId, serviceId, userId 
      FROM NewOrder 
      LIMIT 1
    `;
    
    if (orderSample.length > 0) {
      const order = orderSample[0];
      console.log('📋 NewOrder field types:');
      console.log(`   categoryId: ${order.categoryId} (type: ${typeof order.categoryId})`);
      console.log(`   serviceId: ${order.serviceId} (type: ${typeof order.serviceId})`);
      console.log(`   userId: ${order.userId} (type: ${typeof order.userId})`);
    }

    // Check Category ID types
    const categorySample = await prisma.$queryRaw`
      SELECT id FROM Category LIMIT 1
    `;
    
    if (categorySample.length > 0) {
      const category = categorySample[0];
      console.log(`\n📋 Category ID type: ${category.id} (type: ${typeof category.id})`);
    }

    // Check Service ID types
    const serviceSample = await prisma.$queryRaw`
      SELECT id FROM Service LIMIT 1
    `;
    
    if (serviceSample.length > 0) {
      const service = serviceSample[0];
      console.log(`📋 Service ID type: ${service.id} (type: ${typeof service.id})`);
    }

    // Check User ID types
    const userSample = await prisma.$queryRaw`
      SELECT id FROM User LIMIT 1
    `;
    
    if (userSample.length > 0) {
      const user = userSample[0];
      console.log(`📋 User ID type: ${user.id} (type: ${typeof user.id})`);
    }

    // Check table structures
    console.log('\n🔍 Checking table structures...');
    
    const newOrderStructure = await prisma.$queryRaw`
      DESCRIBE NewOrder
    `;
    console.log('\n📊 NewOrder table structure:');
    newOrderStructure.forEach(col => {
      if (['categoryId', 'serviceId', 'userId'].includes(col.Field)) {
        console.log(`   ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key})`);
      }
    });

    const categoryStructure = await prisma.$queryRaw`
      DESCRIBE Category
    `;
    console.log('\n📊 Category table structure:');
    categoryStructure.forEach(col => {
      if (col.Field === 'id') {
        console.log(`   ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key})`);
      }
    });

    const serviceStructure = await prisma.$queryRaw`
      DESCRIBE Service
    `;
    console.log('\n📊 Service table structure:');
    serviceStructure.forEach(col => {
      if (col.Field === 'id') {
        console.log(`   ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key})`);
      }
    });

    const userStructure = await prisma.$queryRaw`
      DESCRIBE User
    `;
    console.log('\n📊 User table structure:');
    userStructure.forEach(col => {
      if (col.Field === 'id') {
        console.log(`   ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key})`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking field types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFieldTypes();
