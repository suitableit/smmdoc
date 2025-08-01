#!/usr/bin/env node

/**
 * Test script to verify URL environment variable usage
 * This script checks if NEXT_PUBLIC_APP_URL is properly configured
 */

require('dotenv').config();

console.log('🔍 Testing URL Environment Variables...\n');

// Check NEXT_PUBLIC_APP_URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL;
console.log('NEXT_PUBLIC_APP_URL:', appUrl || 'NOT SET');

if (!appUrl) {
  console.log('❌ NEXT_PUBLIC_APP_URL is not set in environment variables');
  console.log('💡 Please set it in your .env file');
  process.exit(1);
}

// Test URL construction for payment endpoints
const testUrls = {
  'Payment Success': `${appUrl}/payment/success`,
  'Payment Pending': `${appUrl}/payment/pending`,
  'Transactions': `${appUrl}/transactions`,
  'Webhook': `${appUrl}/api/payment/webhook`,
  'Create Charge': `${appUrl}/api/payment/create-charge`,
  'Verify Transaction': `${appUrl}/api/payment/verify-transaction`
};

console.log('\n📋 Generated URLs:');
console.log('==================');
Object.entries(testUrls).forEach(([name, url]) => {
  console.log(`${name.padEnd(20)}: ${url}`);
});

// Validate URL format
const urlPattern = /^https?:\/\/.+/;
if (urlPattern.test(appUrl)) {
  console.log('\n✅ URL format is valid');
} else {
  console.log('\n❌ URL format is invalid - should start with http:// or https://');
}

// Check if it's localhost (development) or production
if (appUrl.includes('localhost')) {
  console.log('🔧 Development environment detected');
} else {
  console.log('🚀 Production environment detected');
}

console.log('\n✅ URL environment variable test completed!');