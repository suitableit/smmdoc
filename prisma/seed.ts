import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default "Uncategorized" blog category
  const uncategorizedCategory = await prisma.blogCategory.upsert({
    where: { slug: 'uncategorized' },
    update: {},
    create: {
      name: 'Uncategorized',
      slug: 'uncategorized',
      description: 'Default category for blog posts without a specific category',
      color: '#6B7280',
      status: 'active'
    }
  });

  console.log('✅ Default blog category created:', uncategorizedCategory);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });