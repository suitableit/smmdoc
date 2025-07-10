const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const serviceTypes = [
  {
    name: 'Social Media Marketing',
    description: 'Services related to social media promotion, engagement, and growth'
  },
  {
    name: 'Search Engine Optimization',
    description: 'SEO services to improve website ranking and visibility'
  },
  {
    name: 'Content Creation',
    description: 'Content writing, video creation, and graphic design services'
  },
  {
    name: 'Video Marketing',
    description: 'Video promotion, views, likes, and engagement services'
  },
  {
    name: 'Email Marketing',
    description: 'Email campaign management and newsletter services'
  },
  {
    name: 'Pay Per Click Advertising',
    description: 'PPC campaign management and advertising services'
  },
  {
    name: 'Influencer Marketing',
    description: 'Influencer collaboration and promotion services'
  },
  {
    name: 'Web Development',
    description: 'Website development and maintenance services'
  },
  {
    name: 'Graphic Design',
    description: 'Logo design, branding, and visual content creation'
  },
  {
    name: 'Analytics & Reporting',
    description: 'Data analysis and performance reporting services'
  }
];

async function main() {
  console.log('🌱 Seeding service types...');

  for (const serviceType of serviceTypes) {
    try {
      const existing = await prisma.serviceType.findUnique({
        where: { name: serviceType.name }
      });

      if (!existing) {
        await prisma.serviceType.create({
          data: serviceType
        });
        console.log(`✅ Created service type: ${serviceType.name}`);
      } else {
        console.log(`⏭️  Service type already exists: ${serviceType.name}`);
      }
    } catch (error) {
      console.error(`❌ Error creating service type ${serviceType.name}:`, error);
    }
  }

  console.log('🎉 Service types seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
