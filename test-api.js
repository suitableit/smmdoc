const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/user/services?showAll=true');
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('Total services:', data.total);
    console.log('Services count:', data.data?.length || 0);
    console.log('All categories count:', data.allCategories?.length || 0);
    
    if (data.allCategories) {
      console.log('\n📂 Categories from API:');
      data.allCategories.forEach(cat => {
        console.log(`  - ${cat.category_name} (ID: ${cat.id})`);
      });
    }
    
    if (data.data && data.data.length > 0) {
      console.log('\n🔧 Sample services:');
      data.data.slice(0, 5).forEach(service => {
        console.log(`  - ${service.name} (Category: ${service.category?.category_name || 'None'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAPI();
