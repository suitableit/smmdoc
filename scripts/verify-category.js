const { contactDB } = require('../lib/contact-db');

async function verifyCategory() {
  try {
    console.log('🔍 Verifying category was saved...\n');
    
    const categories = await contactDB.getContactCategories();
    console.log('📂 All categories:');
    categories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name}`);
    });
    
    const playwrightCategory = categories.find(cat => cat.name === 'Test Category from Playwright');
    if (playwrightCategory) {
      console.log(`\n✅ SUCCESS: Playwright category found with ID ${playwrightCategory.id}`);
    } else {
      console.log('\n❌ FAILED: Playwright category not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await contactDB.disconnect();
  }
}

verifyCategory();
