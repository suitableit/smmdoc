#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const os = require('os');

console.log('🔄 Restarting Development Server with Optimized Memory Settings\n');

// Kill any existing Next.js processes
console.log('🛑 Stopping existing development server...');

const killCommand = os.platform() === 'win32' 
  ? 'taskkill /f /im node.exe' 
  : 'pkill -f "next dev"';

exec(killCommand, (error, stdout, stderr) => {
  if (error && !error.message.includes('not found')) {
    console.log('⚠️  No existing server found to stop');
  } else {
    console.log('✅ Existing server stopped');
  }
  
  // Wait a moment then start the new server
  setTimeout(() => {
    console.log('\n🚀 Starting optimized development server...');
    console.log('📊 Memory limit: 6144 MB');
    console.log('🔧 Performance optimizations enabled');
    console.log('📈 Database connection pooling active\n');
    
    // Start the development server with optimized settings
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=6144',
        NEXT_TELEMETRY_DISABLED: '1'
      }
    });
    
    devProcess.on('error', (error) => {
      console.error('❌ Error starting development server:', error);
    });
    
    devProcess.on('close', (code) => {
      console.log(`\n🏁 Development server exited with code ${code}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development server...');
      devProcess.kill('SIGINT');
      process.exit(0);
    });
    
  }, 2000);
});

console.log('\n💡 Performance Tips:');
console.log('   • Monitor memory usage in Task Manager');
console.log('   • Use browser dev tools to check for memory leaks');
console.log('   • Test with large datasets (5000+ services)');
console.log('   • Check /admin/memory-monitor for real-time stats');
