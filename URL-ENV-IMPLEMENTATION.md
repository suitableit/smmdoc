# URL Environment Variable Implementation

## Overview
This document outlines the implementation of dynamic URL configuration using the `NEXT_PUBLIC_APP_URL` environment variable across the SMMDOC payment system.

## Changes Made

### 1. Payment API Routes Updated

#### `/app/api/payment/create-charge/route.ts`
- ✅ Added `appUrl` variable from `process.env.NEXT_PUBLIC_APP_URL`
- ✅ Updated `redirect_url`, `cancel_url`, and `webhook_url` to use dynamic URL
- ✅ Removed hardcoded localhost references

#### `/app/api/payment/create-payment/route.ts`
- ✅ Added `appUrl` variable from `process.env.NEXT_PUBLIC_APP_URL`
- ✅ Updated `success_url` and `cancel_url` to use dynamic URL
- ✅ Removed hardcoded localhost references

### 2. Environment Configuration

#### `.env.example`
- ✅ Added comments explaining development vs production URL usage
- ✅ Updated with live UddoktaPay API key
- ✅ Added `NEXT_PUBLIC_UDDOKTAPAY_BASE_URL` configuration

#### Current `.env` Configuration
```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Development
NEXT_PUBLIC_UDDOKTAPAY_API_KEY="dd48f448b3d0c189de8b7c5e4427c15c6cc1e03c"
NEXT_PUBLIC_UDDOKTAPAY_BASE_URL="https://pay.smmdoc.com"
```

### 3. URL Patterns Used

| Endpoint | URL Pattern |
|----------|-------------|
| Payment Success | `${appUrl}/payment/success` |
| Payment Pending | `${appUrl}/payment/pending` |
| Transactions | `${appUrl}/transactions` |
| Webhook | `${appUrl}/api/payment/webhook` |
| Cancel URL | `${appUrl}/transactions?status=cancelled` |

### 4. Fallback Mechanism
All implementations include a fallback to `http://localhost:3000` for development:
```javascript
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
```

## Testing

### Test Script Created
- 📁 `scripts/test-url-env.js` - Validates URL environment variable configuration
- ✅ Verifies URL format and generates test URLs
- ✅ Detects development vs production environment

### Running Tests
```bash
node scripts/test-url-env.js
```

## Production Deployment

### Required Environment Variables
```env
# Production URL (replace with your actual domain)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# UddoktaPay Configuration
NEXT_PUBLIC_UDDOKTAPAY_API_KEY="dd48f448b3d0c189de8b7c5e4427c15c6cc1e03c"
NEXT_PUBLIC_UDDOKTAPAY_BASE_URL="https://pay.smmdoc.com"
```

### Webhook Configuration
When deploying to production, configure your UddoktaPay webhook URL to:
```
https://yourdomain.com/api/payment/webhook
```

## Benefits

1. **Environment Flexibility**: Easy switching between development and production
2. **No Hardcoded URLs**: All URLs are dynamically generated
3. **Consistent Configuration**: Single source of truth for base URL
4. **Easy Deployment**: Just update environment variable for different environments
5. **Testing Support**: Built-in test script for validation

## Files Modified

- ✅ `app/api/payment/create-charge/route.ts`
- ✅ `app/api/payment/create-payment/route.ts`
- ✅ `.env.example`
- ✅ Created `scripts/test-url-env.js`
- ✅ Created `URL-ENV-IMPLEMENTATION.md`

## Next Steps

1. Update production `.env` file with actual domain
2. Configure webhook URL in UddoktaPay dashboard
3. Test payment flow in production environment
4. Monitor webhook delivery and payment status updates