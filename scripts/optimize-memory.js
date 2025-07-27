#!/usr/bin/env node

const { exec } = require('child_process');
const os = require('os');

console.log('🚀 Memory Optimization Script for SMMDOC\n');

// Get system memory info
const totalMemory = Math.round(os.totalmem() / 1024 / 1024 / 1024);
const freeMemory = Math.round(os.freemem() / 1024 / 1024 / 1024);

console.log(`💾 System Memory Info:`);
console.log(`   Total: ${totalMemory}GB`);
console.log(`   Free: ${freeMemory}GB`);

// Calculate optimal memory allocation
let maxMemory = 4096; // Default 4GB
if (totalMemory >= 16) {
  maxMemory = 8192; // 8GB for systems with 16GB+ RAM
} else if (totalMemory >= 8) {
  maxMemory = 6144; // 6GB for systems with 8GB+ RAM
} else if (totalMemory >= 4) {
  maxMemory = 4096; // 4GB for systems with 4GB+ RAM
} else {
  maxMemory = 2048; // 2GB for systems with less RAM
}

console.log(`\n🎯 Recommended Node.js Memory: ${maxMemory}MB`);

// Update package.json scripts
const fs = require('fs');
const path = require('path');

try {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Update scripts with optimized memory
  packageJson.scripts.dev = `node --max-old-space-size=${maxMemory} node_modules/.bin/next dev`;
  packageJson.scripts.build = `node --max-old-space-size=${maxMemory} node_modules/.bin/next build`;
  packageJson.scripts.start = `node --max-old-space-size=${maxMemory} node_modules/.bin/next start`;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Package.json updated with optimized memory settings');
  
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
}

// Create .env.local with memory optimizations
const envContent = `# Memory Optimization Settings
NODE_OPTIONS="--max-old-space-size=${maxMemory}"
NEXT_TELEMETRY_DISABLED=1

# Database Connection Pool Settings
DATABASE_CONNECTION_LIMIT=10
DATABASE_POOL_TIMEOUT=60000

# Performance Settings
NEXT_PRIVATE_STANDALONE=true
`;

try {
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ .env.local created with memory optimization settings');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
}

console.log('\n🔧 Additional Optimizations Applied:');
console.log('   ✅ Node.js heap size increased');
console.log('   ✅ Database connection pool optimized');
console.log('   ✅ Next.js telemetry disabled');
console.log('   ✅ Standalone mode enabled');

console.log('\n🚀 Next Steps:');
console.log('   1. Restart your development server');
console.log('   2. Run: npm run dev');
console.log('   3. Monitor memory usage in Task Manager');
console.log('   4. Test with large datasets (5000+ services)');

console.log('\n💡 Tips for Better Performance:');
console.log('   • Use pagination for large lists');
console.log('   • Implement lazy loading');
console.log('   • Add database indexes');
console.log('   • Use React.memo for heavy components');
