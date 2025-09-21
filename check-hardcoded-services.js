const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHardcodedServices() {
  try {
    console.log('🔍 Checking for hardcoded provider services...');
    
    // Check for services with specific hardcoded provider names
    const hardcodedProviders = ['smmcoder', 'smmpanel', 'justanotherpanel', 'smmking', 'socialpanel', 'growfollows', 'attpanel'];
    
    let totalHardcodedServices = 0;
    
    for (const providerName of hardcodedProviders) {
      const services = await prisma.service.findMany({
        where: {
          providerName: {
            contains: providerName
          }
        },
        select: {
          id: true,
          name: true,
          providerName: true,
          providerId: true
        },
        take: 10
      });
      
      if (services.length > 0) {
        console.log(`\n📦 Found ${services.length} services with provider '${providerName}':`);
        services.forEach(s => {
          console.log(`   ID: ${s.id}, Name: ${s.name}, Provider: ${s.providerName}, ProviderId: ${s.providerId}`);
        });
        totalHardcodedServices += services.length;
      }
    }
    
    // Check total services count
    const totalServices = await prisma.service.count();
    console.log(`\n📊 Total services in database: ${totalServices}`);
    console.log(`📊 Total hardcoded services found: ${totalHardcodedServices}`);
    
    // Check services without provider relationships
    const servicesWithoutProvider = await prisma.service.count({
      where: {
        OR: [
          { providerId: null },
          { providerName: null }
        ]
      }
    });
    
    console.log(`📊 Services without provider relationship: ${servicesWithoutProvider}`);
    
    // If hardcoded services found, offer to delete them
    if (totalHardcodedServices > 0) {
      console.log(`\n⚠️  Found ${totalHardcodedServices} hardcoded services that should be removed.`);
      
      // Delete hardcoded services
      console.log('🗑️  Deleting hardcoded services...');
      
      for (const providerName of hardcodedProviders) {
        const deleteResult = await prisma.service.deleteMany({
          where: {
            providerName: {
              contains: providerName
            }
          }
        });
        
        if (deleteResult.count > 0) {
          console.log(`✅ Deleted ${deleteResult.count} services for provider '${providerName}'`);
        }
      }
      
      console.log('✅ Hardcoded services cleanup completed!');
    } else {
      console.log('✅ No hardcoded services found!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkHardcodedServices();