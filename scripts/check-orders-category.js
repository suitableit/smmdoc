const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrdersCategory() {
  try {
    console.log('🔄 Checking orders with null category...');

    // Get orders with null categoryId
    const ordersWithNullCategory = await prisma.newOrder.findMany({
      where: {
        OR: [
          { categoryId: null },
          { categoryId: '' }
        ]
      },
      select: {
        id: true,
        categoryId: true,
        serviceId: true,
        userId: true,
        status: true,
        createdAt: true
      }
    });

    console.log(`📋 Found ${ordersWithNullCategory.length} orders with null/empty categoryId:`);
    
    if (ordersWithNullCategory.length > 0) {
      console.log('Orders with null category:', ordersWithNullCategory);
      
      // Get first available category
      const firstCategory = await prisma.category.findFirst({
        where: { status: 'active' }
      });
      
      if (firstCategory) {
        console.log(`🔧 Updating orders to use category: ${firstCategory.category_name}`);
        
        // Update orders with null categoryId
        const updateResult = await prisma.newOrder.updateMany({
          where: {
            OR: [
              { categoryId: null },
              { categoryId: '' }
            ]
          },
          data: {
            categoryId: firstCategory.id
          }
        });
        
        console.log(`✅ Updated ${updateResult.count} orders with category`);
      } else {
        console.log('❌ No active category found to assign');
      }
    } else {
      console.log('✅ All orders have valid categoryId');
    }

  } catch (error) {
    console.error('❌ Error checking orders category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrdersCategory();
