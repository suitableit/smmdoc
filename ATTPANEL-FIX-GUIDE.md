# AttPanel API সমস্যা সমাধান গাইড

## 🔍 সমস্যা চিহ্নিতকরণ

AttPanel API provider এর সাথে "Invalid API Key" error আসছে। এটি নিম্নলিখিত কারণে হতে পারে:

1. **API Key অবৈধ বা মেয়াদ উত্তীর্ণ**
2. **API Key সঠিকভাবে configure করা হয়নি**
3. **AttPanel account এ সমস্যা**

## 🧪 সমস্যা যাচাইকরণ

বর্তমান API key test করতে:
```bash
node test-attpanel-direct.js
```

## 🔧 সমাধান পদ্ধতি

### ধাপ ১: নতুন API Key সংগ্রহ

1. **AttPanel এ লগইন করুন**: https://attpanel.com
2. **Account/API section এ যান**
3. **আপনার valid API key copy করুন**

### ধাপ ২: API Key আপডেট

#### পদ্ধতি ১: Automated Script ব্যবহার করুন
```bash
node fix-attpanel.js YOUR_NEW_API_KEY_HERE
```

#### পদ্ধতি ২: Manual Database Update
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.apiProvider.update({
  where: { name: 'attpanel' },
  data: { api_key: 'YOUR_NEW_API_KEY_HERE' }
}).then(() => console.log('✅ API key updated!'))"
```

### ধাপ ৩: যাচাইকরণ

API key আপডেট করার পর test করুন:
```bash
node test-attpanel-direct.js
```

## 📋 AttPanel API Documentation

### Service List
```
POST https://attpanel.com/api/v2
Parameters:
- key: Your API key
- action: services
```

### Add Order
```
POST https://attpanel.com/api/v2
Parameters:
- key: Your API key
- action: add
- service: Service ID
- link: Target URL
- quantity: Quantity
```

### Order Status
```
POST https://attpanel.com/api/v2
Parameters:
- key: Your API key
- action: status
- order: Order ID
```

### User Balance
```
POST https://attpanel.com/api/v2
Parameters:
- key: Your API key
- action: balance
```

## 🔄 System Integration Status

### ✅ সম্পন্ন Features
- AttPanel provider configuration
- API endpoint setup
- Service import functionality
- Error handling with detailed messages
- Database integration
- Admin panel integration

### 🛠️ Available Tools
- `test-attpanel-direct.js` - Direct API testing
- `fix-attpanel.js` - API key update tool
- `update-attpanel-key.js` - Detailed diagnostic tool

## 🎯 Next Steps

1. **API Key আপডেট করুন** উপরের নির্দেশনা অনুযায়ী
2. **Service Import Test করুন** admin panel থেকে
3. **Order Placement Test করুন** একটি test order দিয়ে

## 🚨 Troubleshooting

### যদি API key আপডেট করার পরও সমস্যা হয়:

1. **AttPanel account status চেক করুন**
2. **API access enabled আছে কিনা দেখুন**
3. **Account balance আছে কিনা চেক করুন**
4. **IP whitelist করা আছে কিনা দেখুন**

### Error Messages:

- `"Invalid API Key"` → API key সঠিক নয়
- `"Insufficient funds"` → Account এ balance নেই
- `"Service not found"` → Service ID ভুল
- `"Invalid link"` → Target URL সঠিক নয়

## 📞 Support

যদি সমস্যা অব্যাহত থাকে:
1. AttPanel support এ যোগাযোগ করুন
2. API documentation পুনরায় চেক করুন
3. Account settings verify করুন

---

**Note**: এই গাইড AttPanel API v2 এর জন্য তৈরি। API version পরিবর্তন হলে documentation আপডেট করতে হবে।