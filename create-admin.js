const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Creating admin user...');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        emailVerified: new Date(),
        balance: 0,
        currency: 'USD'
      }
    });
    
    console.log('Admin user created successfully:');
    console.log('Username: admin');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Admin user already exists!');
      
      // Try to find existing admin
      const existingAdmin = await prisma.user.findFirst({
        where: {
          role: 'admin'
        }
      });
      
      if (existingAdmin) {
        console.log('Existing admin found:');
        console.log('Username:', existingAdmin.username);
        console.log('Email:', existingAdmin.email);
      }
    } else {
      console.error('Error creating admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();