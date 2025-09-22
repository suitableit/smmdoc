#!/usr/bin/env node

/**
 * Database Cleanup Script
 * 
 * This script deletes all services, categories, and service types from the database.
 * Use with extreme caution as this operation is irreversible.
 * 
 * Usage: node scripts/cleanup-database.js [--confirm]
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBold(message, color = 'white') {
  console.log(`${colors.bold}${colors[color]}${message}${colors.reset}`);
}

async function confirmAction(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${message} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function getTableCounts() {
  try {
    const [services, categories, serviceTypes, orders, favoriteServices] = await Promise.all([
      prisma.service.count(),
      prisma.category.count(),
      prisma.servicetype.count(),
      prisma.newOrder.count(),
      prisma.favoriteService.count()
    ]);

    return { services, categories, serviceTypes, orders, favoriteServices };
  } catch (error) {
    log(`Error getting table counts: ${error.message}`, 'red');
    return null;
  }
}

async function cleanupDatabase() {
  logBold('🧹 Database Cleanup Script', 'cyan');
  log('=====================================', 'cyan');
  
  try {
    // Get current counts
    log('📊 Getting current database counts...', 'blue');
    const counts = await getTableCounts();
    
    if (!counts) {
      log('❌ Failed to get database counts. Exiting.', 'red');
      return;
    }

    log('\n📈 Current Database Status:', 'magenta');
    log(`   Services: ${counts.services}`, 'white');
    log(`   Categories: ${counts.categories}`, 'white');
    log(`   Service Types: ${counts.serviceTypes}`, 'white');
    log(`   Orders: ${counts.orders}`, 'white');
    log(`   Favorite Services: ${counts.favoriteServices}`, 'white');

    if (counts.services === 0 && counts.categories === 0 && counts.serviceTypes === 0) {
      log('\n✅ Database is already clean. Nothing to delete.', 'green');
      return;
    }

    // Warning message
    log('\n⚠️  WARNING: This operation will permanently delete:', 'red');
    log(`   • All ${counts.services} services`, 'red');
    log(`   • All ${counts.categories} categories`, 'red');
    log(`   • All ${counts.serviceTypes} service types`, 'red');
    log(`   • All ${counts.orders} orders (cascaded)`, 'red');
    log(`   • All ${counts.favoriteServices} favorite services (cascaded)`, 'red');
    log('   • All related data (logs, requests, etc.)', 'red');
    
    log('\n🚨 THIS ACTION CANNOT BE UNDONE!', 'red');

    // Check for --confirm flag
    const hasConfirmFlag = process.argv.includes('--confirm');
    
    if (!hasConfirmFlag) {
      const confirmed = await confirmAction('\nAre you absolutely sure you want to proceed?');
      if (!confirmed) {
        log('\n❌ Operation cancelled by user.', 'yellow');
        return;
      }

      const doubleConfirmed = await confirmAction('Type "yes" again to confirm this destructive operation');
      if (!doubleConfirmed) {
        log('\n❌ Operation cancelled by user.', 'yellow');
        return;
      }
    } else {
      log('\n✅ --confirm flag detected, skipping confirmation prompts.', 'yellow');
    }

    log('\n🚀 Starting database cleanup...', 'blue');

    // Start transaction for cleanup
    await prisma.$transaction(async (tx) => {
      log('📝 Starting database transaction...', 'blue');

      // Step 1: Delete all services (this will cascade to related tables)
      log('🗑️  Deleting all services...', 'yellow');
      const deletedServices = await tx.service.deleteMany({});
      log(`   ✅ Deleted ${deletedServices.count} services`, 'green');

      // Step 2: Delete all categories
      log('🗑️  Deleting all categories...', 'yellow');
      const deletedCategories = await tx.category.deleteMany({});
      log(`   ✅ Deleted ${deletedCategories.count} categories`, 'green');

      // Step 3: Delete all service types
      log('🗑️  Deleting all service types...', 'yellow');
      const deletedServiceTypes = await tx.servicetype.deleteMany({});
      log(`   ✅ Deleted ${deletedServiceTypes.count} service types`, 'green');

      // Step 4: Clean up any orphaned favorite categories
      log('🗑️  Cleaning up favorite categories...', 'yellow');
      const deletedFavCats = await tx.favrouteCat.deleteMany({});
      log(`   ✅ Deleted ${deletedFavCats.count} favorite categories`, 'green');

      log('💾 Committing transaction...', 'blue');
    });

    // Verify cleanup
    log('\n🔍 Verifying cleanup...', 'blue');
    const finalCounts = await getTableCounts();
    
    if (finalCounts) {
      log('\n📊 Final Database Status:', 'magenta');
      log(`   Services: ${finalCounts.services}`, 'white');
      log(`   Categories: ${finalCounts.categories}`, 'white');
      log(`   Service Types: ${finalCounts.serviceTypes}`, 'white');
      log(`   Orders: ${finalCounts.orders}`, 'white');
      log(`   Favorite Services: ${finalCounts.favoriteServices}`, 'white');
    }

    logBold('\n🎉 Database cleanup completed successfully!', 'green');
    log('All services, categories, and service types have been removed.', 'green');

  } catch (error) {
    log(`\n❌ Error during cleanup: ${error.message}`, 'red');
    log('Transaction has been rolled back.', 'red');
    
    if (error.code) {
      log(`Error code: ${error.code}`, 'red');
    }
    
    throw error;
  }
}

async function main() {
  try {
    await cleanupDatabase();
  } catch (error) {
    log('\n💥 Script failed with error:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    log('\n🔌 Database connection closed.', 'blue');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  log('\n\n⚠️  Script interrupted by user.', 'yellow');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('\n\n⚠️  Script terminated.', 'yellow');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { cleanupDatabase };