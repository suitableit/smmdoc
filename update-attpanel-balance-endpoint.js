const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function updateATTPanelBalanceEndpoint() {
  try {
    console.log('🔄 Updating ATTPanel balance endpoint...');
    
    // ATTPanel এর জন্য balance endpoint আপডেট করি
    const result = await db.api_providers.update({
      where: {
        name: 'ATTPanel'
      },
      data: {
        balance_endpoint: 'http://attpanel.com/api/v2',
        balance_action: 'balance'
      }
    });
    
    console.log('✅ ATTPanel balance endpoint updated successfully:', result);
    
    // আপডেটের পর provider configuration দেখি
    const updatedProvider = await db.api_providers.findFirst({
      where: { name: 'ATTPanel' },
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
    
    console.log('\n📋 Updated ATTPanel Configuration:');
    console.log('   ID:', updatedProvider.id);
    console.log('   Name:', updatedProvider.name);
    console.log('   API URL:', updatedProvider.api_url);
    console.log('   Balance Endpoint:', updatedProvider.balance_endpoint);
    console.log('   HTTP Method:', updatedProvider.http_method);
    console.log('   Balance Action:', updatedProvider.balance_action);
    console.log('   Status:', updatedProvider.status);
    
  } catch (error) {
    console.error('❌ Error updating ATTPanel balance endpoint:', error);
  } finally {
    await db.$disconnect();
  }
}

updateATTPanelBalanceEndpoint();