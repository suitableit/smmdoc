const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function updateSampleSMMBalanceEndpoint() {
  try {
    console.log('🔄 Updating SampleSMM balance endpoint...');
    
    // SampleSMM এর জন্য balance endpoint আপডেট করি
    const result = await db.api_providers.update({
      where: {
        name: 'SampleSMM'
      },
      data: {
        balance_endpoint: 'https://api.samplesmm.com',
        balance_action: 'balance'
      }
    });
    
    console.log('✅ SampleSMM balance endpoint updated successfully:', result);
    
    // আপডেটের পর provider configuration দেখি
    const updatedProvider = await db.api_providers.findFirst({
      where: { name: 'SampleSMM' },
      select: {
        id: true,
        name: true,
        api_url: true,
        balance_endpoint: true,
        http_method: true,
        balance_action: true,
        status: true
      }
    });
    
    console.log('\n📋 Updated SampleSMM Configuration:');
    console.log('   ID:', updatedProvider.id);
    console.log('   Name:', updatedProvider.name);
    console.log('   API URL:', updatedProvider.api_url);
    console.log('   Balance Endpoint:', updatedProvider.balance_endpoint);
    console.log('   HTTP Method:', updatedProvider.http_method);
    console.log('   Balance Action:', updatedProvider.balance_action);
    console.log('   Status:', updatedProvider.status);
    
  } catch (error) {
    console.error('❌ Error updating SampleSMM balance endpoint:', error);
  } finally {
    await db.$disconnect();
  }
}

updateSampleSMMBalanceEndpoint();