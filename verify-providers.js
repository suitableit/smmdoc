const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyProviders() {
  try {
    console.log('🔍 Verifying all providers...');
    
    const providers = await prisma.api_providers.findMany({
      orderBy: { id: 'asc' }
    });
    
    console.log(`\n📊 Total providers found: ${providers.length}`);
    console.log('\n' + '='.repeat(80));
    
    let activeCount = 0;
    let inactiveCount = 0;
    let withApiUrl = 0;
    let withoutApiUrl = 0;
    
    providers.forEach((provider, index) => {
      const statusIcon = provider.status === 'active' ? '✅' : '❌';
      const apiUrlIcon = provider.api_url && provider.api_url.trim() !== '' ? '🔗' : '❌';
      
      console.log(`${index + 1}. ${provider.name}`);
      console.log(`   ID: ${provider.id}`);
      console.log(`   Status: ${statusIcon} ${provider.status}`);
      console.log(`   API URL: ${apiUrlIcon} ${provider.api_url || 'Not set'}`);
      console.log(`   API Key: ${provider.api_key ? '🔑 Set' : '❌ Not set'}`);
      console.log(`   Custom: ${provider.is_custom ? 'Yes' : 'No'}`);
      console.log(`   Created: ${provider.createdAt.toISOString().split('T')[0]}`);
      console.log(`   Updated: ${provider.updatedAt.toISOString().split('T')[0]}`);
      console.log('');
      
      if (provider.status === 'active') activeCount++;
      else inactiveCount++;
      
      if (provider.api_url && provider.api_url.trim() !== '') withApiUrl++;
      else withoutApiUrl++;
    });
    
    console.log('='.repeat(80));
    console.log('📈 Summary:');
    console.log(`   ✅ Active providers: ${activeCount}`);
    console.log(`   ❌ Inactive providers: ${inactiveCount}`);
    console.log(`   🔗 With API URL: ${withApiUrl}`);
    console.log(`   ❌ Without API URL: ${withoutApiUrl}`);
    
    if (activeCount === providers.length && withApiUrl === providers.length) {
      console.log('\n🎉 All providers are properly configured!');
    } else {
      console.log('\n⚠️  Some providers need attention!');
    }
    
  } catch (error) {
    console.error('❌ Error verifying providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyProviders();