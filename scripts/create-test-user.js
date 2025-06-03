const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (existingUser) {
      console.log('Test user already exists with email: test@example.com');
      console.log('User details:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        emailVerified: existingUser.emailVerified,
        role: existingUser.role
      });
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'user',
        emailVerified: new Date(), // Set email as verified for testing
        currency: 'USD',
        balance: 100.0,
        total_deposit: 100.0,
        total_spent: 0.0,
      }
    });
    
    console.log('Test user created successfully!');
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
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
