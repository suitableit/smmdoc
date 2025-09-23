const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function ensureDefaultServiceType() {
  try {
    console.log('🔍 Checking for Default service type...');
    
    // Check if Default service type already exists
    let defaultServiceType = await prisma.servicetype.findFirst({
      where: { name: 'Default' }
    });

    if (!defaultServiceType) {
      console.log('📝 Creating Default service type...');
      
      // Create the Default service type
      defaultServiceType = await prisma.servicetype.create({
        data: {
          name: 'Default',
          providerId: null,
          providerName: 'Self',
          status: 'active'
        }
      });
      
      console.log('✅ Default service type created successfully:', defaultServiceType);
    } else {
      console.log('✅ Default service type already exists:', defaultServiceType);
      
      // Ensure it has the correct properties
      if (defaultServiceType.providerName !== 'Self' || defaultServiceType.status !== 'active') {
        console.log('🔧 Updating Default service type properties...');
        
        defaultServiceType = await prisma.servicetype.update({
          where: { id: defaultServiceType.id },
          data: {
            providerName: 'Self',
            status: 'active',
            providerId: null
          }
        });
        
        console.log('✅ Default service type updated successfully');
      }
    }

    // Update any services that don't have a service type to use Default
    const servicesWithoutType = await prisma.service.findMany({
      where: { serviceTypeId: null },
      select: { id: true, name: true }
    });

    if (servicesWithoutType.length > 0) {
      console.log(`🔧 Found ${servicesWithoutType.length} services without service type. Assigning Default type...`);
      
      await prisma.service.updateMany({
        where: { serviceTypeId: null },
        data: { serviceTypeId: defaultServiceType.id }
      });
      
      console.log('✅ Updated services to use Default service type');
    }

    console.log('🎉 Default service type setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error ensuring Default service type:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureDefaultServiceType()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });