# 🔧 Admin Add/Deduct Balance Troubleshooting

## ❌ Current Issues:

### 1. **500 Server Errors**
```
GET /api/user/current 500 in 47ms
POST /api/admin/users/balance 500 in 59ms
GET /api/auth/session-check 500 in 44ms
```

### 2. **Module Parse Error**
```
Identifier 'handleAddDeductBalance' has already been declared (1082:10)
```

### 3. **Database Connection Issues**
- Multiple 500 errors suggest database problems
- Authentication failures

## 🔍 **Debugging Steps:**

### Step 1: Check Database Connection
1. **Verify DATABASE_URL** in `.env` file
2. **Test database connection**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

### Step 2: Clear Next.js Cache
```bash
# Delete .next folder
rmdir /s /q .next

# Restart development server
npm run dev
```

### Step 3: Check Authentication
1. **Login as admin** first
2. **Verify admin role** in database
3. **Check session** in browser dev tools

### Step 4: Test API Directly
1. **Use test API**: `/api/test-balance`
2. **Check console logs** for detailed errors
3. **Verify request payload**

## 🛠️ **Quick Fixes:**

### Fix 1: Clear Browser Cache
```javascript
// Hard refresh browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### Fix 2: Restart Development Server
```bash
# Kill all node processes
taskkill /f /im node.exe

# Start fresh
npm run dev
```

### Fix 3: Check User Exists
```sql
-- Check if test user exists
SELECT * FROM user WHERE username = 'user1';

-- Create test user if needed
INSERT INTO user (username, email, balance, currency, role) 
VALUES ('user1', 'user1@test.com', 1000.00, 'USD', 'user');
```

### Fix 4: Verify Admin Role
```sql
-- Check admin user
SELECT id, username, email, role FROM user WHERE role = 'admin';

-- Update user to admin if needed
UPDATE user SET role = 'admin' WHERE username = 'your_username';
```

## 🧪 **Test Scenarios:**

### Test 1: Simple Add Balance
```javascript
// Test payload
{
  "username": "user1",
  "amount": 100,
  "action": "add",
  "notes": "Test add",
  "adminCurrency": "USD"
}

// Expected result
{
  "success": true,
  "message": "Successfully added balance",
  "data": {
    "newBalance": 1100.00
  }
}
```

### Test 2: Simple Deduct Balance
```javascript
// Test payload
{
  "username": "user1", 
  "amount": 50,
  "action": "deduct",
  "notes": "Test deduct",
  "adminCurrency": "USD"
}

// Expected result
{
  "success": true,
  "message": "Successfully deducted balance",
  "data": {
    "newBalance": 1050.00
  }
}
```

## 🔄 **Working Solution:**

### 1. **Use Test API First**
- Test with `/api/test-balance` route
- Check console logs for errors
- Verify database connection

### 2. **Fix Authentication**
```javascript
// Check if logged in as admin
const session = await auth();
console.log('Session:', session);
console.log('Role:', session?.user?.role);
```

### 3. **Simple Frontend Test**
```html
<!-- Use test-add-deduct-api.html -->
<button onclick="testAddBalance()">Test Add Balance</button>
<script>
async function testAddBalance() {
  const response = await fetch('/api/test-balance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'user1',
      amount: 100,
      action: 'add',
      adminCurrency: 'USD'
    })
  });
  const result = await response.json();
  console.log(result);
}
</script>
```

## 🎯 **Expected Workflow:**

1. **Admin logs in** → Session created
2. **Admin goes to transactions page** → Page loads
3. **Admin clicks "Add/Deduct Balance"** → Modal opens
4. **Admin enters username** → User search works
5. **Admin enters amount** → Conversion preview shows
6. **Admin submits** → API call succeeds
7. **Balance updated** → Success message shows

## 🚨 **Common Issues & Solutions:**

### Issue: "User not found"
**Solution**: Check username spelling, verify user exists in database

### Issue: "Unauthorized access"
**Solution**: Login as admin, check admin role in database

### Issue: "Database connection failed"
**Solution**: Check DATABASE_URL, restart MySQL, run `npx prisma generate`

### Issue: "Amount validation failed"
**Solution**: Enter positive number, check currency format

### Issue: "Insufficient balance"
**Solution**: Check user's current balance, reduce deduct amount

## 🎉 **Success Indicators:**

- ✅ No 500 errors in console
- ✅ User search finds users
- ✅ Conversion preview shows correct amounts
- ✅ API returns success response
- ✅ Database balance updates
- ✅ Transaction appears in list

## 📝 **Next Steps:**

1. **Test with simple API first**
2. **Fix any database/auth issues**
3. **Use working transactions page**
4. **Verify all currencies work**
5. **Test add/deduct operations**

**Remember**: Start with basic functionality, then add complexity! 🚀
