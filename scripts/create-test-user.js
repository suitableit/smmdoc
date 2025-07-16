const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create or update test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        password: hashedPassword
      },
      create: {
        name: 'Test User',
        username: 'testuser123',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        emailVerified: new Date(),
        currency: 'USD',
        balance: 100.0,
        total_deposit: 100.0,
        total_spent: 0.0,
      }
    });

    console.log('Test user created/updated successfully!');
    console.log('Login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('User ID:', testUser.id);

    // Create an admin user as well
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);

      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          username: 'admin',
          email: 'admin@example.com',
          password: adminPassword,
          role: 'admin',
          emailVerified: new Date(),
          currency: 'USD',
          balance: 1000.0,
          total_deposit: 1000.0,
          total_spent: 0.0,
        }
      });

      console.log('\nAdmin user created successfully!');
      console.log('Admin credentials:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      console.log('Admin ID:', adminUser.id);
    } else {
      console.log('\nAdmin user already exists with email: admin@example.com');
    }

    // Create admin1@example.com for login test
    const existingAdmin1 = await prisma.user.findUnique({
      where: { email: 'admin1@example.com' }
    });

    if (existingAdmin1) {
      console.log('\nUpdating admin1@example.com password...');
      const newPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin1@example.com' },
        data: { password: newPassword }
      });
      console.log('✅ admin1@example.com password updated to: admin123');
    } else {
      console.log('\nAdmin1 not found. Available admin users:');
      const admins = await prisma.user.findMany({
        where: { role: 'admin' },
        select: { email: true, name: true }
      });
      admins.forEach(admin => {
        console.log(`Email: ${admin.email}, Name: ${admin.name}`);
      });
    }

  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
