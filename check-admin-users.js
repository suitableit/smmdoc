const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('👤 Checking Admin Users...');
    console.log('==========================');
    
    // Check if there are any admin users
    console.log('\n1. Looking for admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });
    
    console.log('Admin users found:', adminUsers.length);
    
    if (adminUsers.length > 0) {
      console.log('\n2. Admin users details:');
      console.table(adminUsers);
    } else {
      console.log('❌ No admin users found!');
      
      // Check all users and their roles
      console.log('\n3. Checking all users and their roles...');
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true
        },
        take: 10
      });
      
      console.log('Total users found:', allUsers.length);
      if (allUsers.length > 0) {
        console.table(allUsers);
        
        // Check what roles exist
        const roles = [...new Set(allUsers.map(user => user.role))];
        console.log('\nRoles found in database:', roles);
      }
    }
    
    // Check user table structure to see role field
    console.log('\n4. Checking user table structure...');
    const userStructure = await prisma.$queryRaw`DESCRIBE user`;
    const roleField = userStructure.find(field => field.Field === 'role');
    if (roleField) {
      console.log('Role field details:', roleField);
    } else {
      console.log('❌ No role field found in user table!');
    }
    
  } catch (error) {
    console.error('❌ Error checking admin users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();