const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDuplicateOrders() {
  try {
    console.log('🔄 Checking for duplicate orders...');

    // Find duplicate order IDs
    const duplicateOrders = await prisma.$queryRaw`
      SELECT id, COUNT(*) as count 
      FROM NewOrder 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `;

    console.log(`📋 Found ${duplicateOrders.length} duplicate order IDs`);

    if (duplicateOrders.length > 0) {
      for (const duplicate of duplicateOrders) {
        console.log(`🔧 Fixing duplicate order ID: ${duplicate.id} (${duplicate.count} copies)`);
        
        // Get all orders with this ID
        const orders = await prisma.newOrder.findMany({
          where: { id: duplicate.id },
          orderBy: { createdAt: 'asc' }
        });

        // Keep the first one, delete the rest
        for (let i = 1; i < orders.length; i++) {
          try {
            // Since we can't delete by composite key, we'll update the duplicate IDs
            const newId = await prisma.$queryRaw`
              SELECT MAX(id) + ${i} as newId FROM NewOrder
            `;
            
            await prisma.$executeRaw`
              UPDATE NewOrder 
              SET id = ${newId[0].newId}
              WHERE id = ${duplicate.id} 
              AND createdAt = ${orders[i].createdAt}
              LIMIT 1
            `;
            
            console.log(`✅ Updated duplicate order ${duplicate.id} to ${newId[0].newId}`);
          } catch (error) {
            console.warn(`⚠️ Could not fix duplicate ${duplicate.id}:`, error.message);
          }
        }
      }
    }

    // Check for orders with invalid foreign keys
    console.log('🔄 Checking for invalid foreign key references...');
    
    const invalidOrders = await prisma.$queryRaw`
      SELECT o.id, o.categoryId, o.serviceId, o.userId
      FROM NewOrder o
      LEFT JOIN Category c ON o.categoryId = c.id
      LEFT JOIN Service s ON o.serviceId = s.id  
      LEFT JOIN User u ON o.userId = u.id
      WHERE c.id IS NULL OR s.id IS NULL OR u.id IS NULL
    `;

    console.log(`📋 Found ${invalidOrders.length} orders with invalid foreign keys`);

    if (invalidOrders.length > 0) {
      // Get valid references
      const [validCategory, validService, validUser] = await Promise.all([
        prisma.category.findFirst({ where: { status: 'active' } }),
        prisma.service.findFirst({ where: { status: 'active' } }),
        prisma.user.findFirst()
      ]);

      if (validCategory && validService && validUser) {
        for (const order of invalidOrders) {
          await prisma.newOrder.update({
            where: { id: order.id },
            data: {
              categoryId: validCategory.id,
              serviceId: validService.id,
              userId: validUser.id
            }
          });
          console.log(`✅ Fixed foreign keys for order ${order.id}`);
        }
      }
    }

    console.log('🎉 Database cleanup completed!');

  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateOrders();
