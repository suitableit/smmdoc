const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createModerators() {
  try {
    console.log('Creating moderators...');

    // Create moderators
    const moderators = [
      {
        username: 'sarah_mod',
        email: 'sarah.wilson@smmdoc.com',
        name: 'Sarah Wilson',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 50.00,
        total_spent: 125.75,
        currency: 'USD',
        emailVerified: new Date(),
      },
      {
        username: 'alex_moderator',
        email: 'alex.chen@smmdoc.com',
        name: 'Alex Chen',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 0.00,
        total_spent: 89.50,
        currency: 'USD',
        emailVerified: new Date(),
      },
      {
        username: 'mike_support',
        email: 'mike.rodriguez@smmdoc.com',
        name: 'Mike Rodriguez',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 25.50,
        total_spent: 234.80,
        currency: 'USD',
        emailVerified: new Date(),
      },
      {
        username: 'emma_mod',
        email: 'emma.thompson@smmdoc.com',
        name: 'Emma Thompson',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 100.00,
        total_spent: 67.25,
        currency: 'USD',
        emailVerified: null, // Not verified
      },
      {
        username: 'david_moderator',
        email: 'david.kim@smmdoc.com',
        name: 'David Kim',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 75.25,
        total_spent: 156.90,
        currency: 'USD',
        emailVerified: new Date(),
      },
      {
        username: 'lisa_support',
        email: 'lisa.garcia@smmdoc.com',
        name: 'Lisa Garcia',
        password: await bcrypt.hash('password123', 10),
        role: 'moderator',
        balance: 15.00,
        total_spent: 298.45,
        currency: 'USD',
        emailVerified: new Date(),
      }
    ];

    for (const moderator of moderators) {
      // Check if moderator already exists
      const existingModerator = await prisma.user.findFirst({
        where: {
          OR: [
            { email: moderator.email },
            { username: moderator.username }
          ]
        }
      });

      if (!existingModerator) {
        const created = await prisma.user.create({
          data: moderator
        });
        console.log(`✅ Created moderator: ${created.username} (${created.email})`);
      } else {
        console.log(`⚠️  Moderator already exists: ${moderator.username} (${moderator.email})`);
      }
    }

    console.log('✅ Moderators creation completed!');

  } catch (error) {
    console.error('❌ Error creating moderators:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createModerators();
