const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSMMCoderAPIKey() {
  console.log('🔧 Updating SMMCoder API key...');

  try {
    // Real SMMCoder API key
    const realAPIKey = 'd51d09535663bf9b5c171e360a0892ee';

    // Find SMMCoder provider
    const smmcoderProvider = await prisma.apiProvider.findFirst({
      where: {
        OR: [
          { name: { contains: 'smmcoder' } },
          { name: { contains: 'SMMCoder' } },
          { name: { contains: 'SMMCODER' } },
          { name: 'SMMCoder' }
        ]
      }
    });

    if (smmcoderProvider) {
      // Update with real API key
      await prisma.apiProvider.update({
        where: { id: smmcoderProvider.id },
        data: {
          api_key: realAPIKey,
          status: 'active'
        }
      });

      console.log('✅ SMMCoder API key updated successfully!');
      console.log(`   Provider ID: ${smmcoderProvider.id}`);
      console.log(`   Provider Name: ${smmcoderProvider.name}`);
      console.log(`   New API Key: ${realAPIKey}`);
      console.log(`   Status: active`);
    } else {
      // Create SMMCoder provider if not exists
      const newProvider = await prisma.apiProvider.create({
        data: {
          name: 'SMMCoder',
          api_key: realAPIKey,
          status: 'active'
        }
      });

      console.log('✅ SMMCoder provider created successfully!');
      console.log(`   Provider ID: ${newProvider.id}`);
      console.log(`   Provider Name: ${newProvider.name}`);
      console.log(`   API Key: ${realAPIKey}`);
      console.log(`   Status: active`);
    }

    // Verify the update
    const updatedProvider = await prisma.apiProvider.findFirst({
      where: {
        OR: [
          { name: { contains: 'smmcoder' } },
          { name: { contains: 'SMMCoder' } },
          { name: { contains: 'SMMCODER' } },
          { name: 'SMMCoder' }
        ]
      }
    });

    if (updatedProvider) {
      console.log('\n🔍 Verification:');
      console.log(`   ID: ${updatedProvider.id}`);
      console.log(`   Name: ${updatedProvider.name}`);
      console.log(`   API Key: ${updatedProvider.api_key}`);
      console.log(`   Status: ${updatedProvider.status}`);
      console.log(`   Created: ${updatedProvider.createdAt}`);
      console.log(`   Updated: ${updatedProvider.updatedAt}`);
    }

  } catch (error) {
    console.error('❌ Error updating SMMCoder API key:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSMMCoderAPIKey();
