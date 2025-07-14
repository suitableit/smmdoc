const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabaseRelations() {
  try {
    console.log('🔄 Fixing database relations...');

    // Get first available category, service, and user
    const [firstCategory, firstService, firstUser] = await Promise.all([
      prisma.category.findFirst({ where: { status: 'active' } }),
      prisma.service.findFirst({ where: { status: 'active' } }),
      prisma.user.findFirst()
    ]);

    if (!firstCategory) {
      console.log('❌ No category found. Creating default category...');
      const defaultCategory = await prisma.category.create({
        data: {
          category_name: 'Default Category',
          status: 'active',
          userId: firstUser?.id || 1,
          hideCategory: 'no',
          position: 'bottom'
        }
      });
      console.log(`✅ Created default category: ${defaultCategory.category_name}`);
    }

    if (!firstService) {
      console.log('❌ No service found. Creating default service...');
      const defaultService = await prisma.service.create({
        data: {
          name: 'Default Service',
          description: 'Default service for fixing relations',
          rate: 1.0,
          min_order: 100,
          max_order: 10000,
          perqty: 1000,
          avg_time: '1-24 hours',
          categoryId: firstCategory?.id || '',
          userId: firstUser?.id || 1,
          status: 'active',
          mode: 'manual'
        }
      });
      console.log(`✅ Created default service: ${defaultService.name}`);
    }

    // Check for orders with invalid relations
    const ordersWithIssues = await prisma.$queryRaw`
      SELECT id, categoryId, serviceId, userId 
      FROM NewOrder 
      WHERE categoryId NOT IN (SELECT id FROM Category)
         OR serviceId NOT IN (SELECT id FROM Service)
         OR userId NOT IN (SELECT id FROM User)
    `;

    console.log(`📋 Found ${ordersWithIssues.length} orders with invalid relations`);

    if (ordersWithIssues.length > 0) {
      // Get valid IDs
      const validCategory = await prisma.category.findFirst({ where: { status: 'active' } });
      const validService = await prisma.service.findFirst({ where: { status: 'active' } });
      const validUser = await prisma.user.findFirst();

      // Fix each problematic order
      for (const order of ordersWithIssues) {
        try {
          await prisma.newOrder.update({
            where: { id: order.id },
            data: {
              categoryId: validCategory.id,
              serviceId: validService.id,
              userId: validUser.id
            }
          });
          console.log(`✅ Fixed order ${order.id}`);
        } catch (error) {
          console.warn(`⚠️ Could not fix order ${order.id}:`, error.message);
        }
      }
    }

    console.log('🎉 Database relations fix completed!');

  } catch (error) {
    console.error('❌ Error fixing database relations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabaseRelations();
