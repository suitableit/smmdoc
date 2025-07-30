const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Checking users...');
    
    // Check all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        password: true
      }
    });
    
    console.log('All users:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Status: ${user.status}, EmailVerified: ${user.emailVerified}, HasPassword: ${!!user.password}`);
    });
    
    // Check specific user
    const user1 = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'user1' },
          { email: 'user1' }
        ]
      }
    });
    
    if (user1) {
      console.log('\nFound user1:', user1);
    } else {
      console.log('\nuser1 not found');
    }
    
    // Check admin user
    const admin = await prisma.user.findFirst({
      where: {
        role: 'admin'
      }
    });
    
    if (admin) {
      console.log('\nFound admin user:', {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        emailVerified: admin.emailVerified
      });
    } else {
      console.log('\nNo admin user found');
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
