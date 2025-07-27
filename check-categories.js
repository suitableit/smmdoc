const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('🔍 Checking categories and services...');
    
    const categories = await prisma.category.findMany({
      where: { hideCategory: 'no' },
      include: {
        services: {
          where: { status: 'active' }
        },
        _count: {
          select: { services: true }
        }
      }
    });
    
    console.log('📂 Categories:');
    categories.forEach(cat => {
      console.log(`\n${cat.category_name} (ID: ${cat.id})`);
      console.log(`  Services count: ${cat._count.services}`);
      if (cat.services.length > 0) {
        cat.services.forEach(service => {
          console.log(`    - ${service.name} (ID: ${service.id})`);
        });
      } else {
        console.log('    No active services');
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
