# Currency System Test Guide

## Test Steps

### 1. Admin Currency Settings Test
1. Login as admin
2. Go to `/admin/settings/currency`
3. Test adding new currency:
   - Code: EUR
   - Name: Euro
   - Symbol: €
   - Rate: 0.85
4. Test enabling/disabling currencies
5. Test updating currency rates
6. Save settings and verify success message

### 2. Header Currency Display Test
1. Check header currency selector shows enabled currencies
2. Switch between different currencies
3. Verify balance display updates with correct format
4. Check currency symbol and rate display

### 3. New Order Page Test
1. Go to `/new-order`
2. Select a service
3. Enter quantity
4. Verify price calculation uses selected currency
5. Check currency format matches admin settings

### 4. Cross-Page Currency Consistency Test
1. Set currency to BDT in header
2. Navigate to different pages:
   - Dashboard
   - New Order
   - Mass Orders
   - Add Funds
3. Verify currency format is consistent across all pages

### 5. Real-time Updates Test
1. Admin adds new currency
2. Check if header currency selector updates immediately
3. Verify new currency appears in all currency dropdowns

## Expected Results

### Currency Formatting
- Should use admin-defined decimal places
- Should use admin-defined thousand separators
- Should use admin-defined currency position (left/right)
- Should show correct currency symbol

### Currency Conversion
- All amounts should convert correctly between currencies
- Base currency (USD) rate should always be 1.0000
- Other currencies should convert using admin-set rates

### Real-time Updates
- Currency changes should reflect immediately across all pages
- No page refresh should be required
- Cache should clear automatically when admin updates settings

## Test Data

### Default Currencies
```json
[
  {
    "code": "USD",
    "name": "US Dollar", 
    "symbol": "$",
    "rate": 1.0000,
    "enabled": true
  },
  {
    "code": "BDT",
    "name": "Bangladeshi Taka",
    "symbol": "৳", 
    "rate": 110.0000,
    "enabled": true
  },
  {
    "code": "USDT",
    "name": "Tether USD",
    "symbol": "₮",
    "rate": 1.0000,
    "enabled": true
  }
]
```

### Test Currencies to Add
```json
[
  {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "rate": 0.8500
  },
  {
    "code": "GBP", 
    "name": "British Pound",
    "symbol": "£",
    "rate": 0.7300
  },
  {
    "code": "INR",
    "name": "Indian Rupee", 
    "symbol": "₹",
    "rate": 83.0000
  }
]
```

## API Endpoints to Test

1. `GET /api/currencies/enabled` - Get enabled currencies
2. `GET /api/admin/currency-settings` - Get currency settings (admin only)
3. `POST /api/admin/currency-settings` - Save currency settings (admin only)
4. `POST /api/currency` - Update user currency preference

## Files Modified

1. `lib/currency-utils.ts` - New utility functions
2. `contexts/CurrencyContext.tsx` - Updated context with admin settings
3. `components/modern-order-form.tsx` - Updated currency display
4. `components/dashboard/header.tsx` - Updated currency formatting
5. `app/(protected)/admin/settings/currency/page.tsx` - Added cache refresh

## Success Criteria

✅ Admin can add/edit/disable currencies
✅ Currency rates are fetched from database
✅ Currency formatting uses admin settings
✅ Real-time updates work across all pages
✅ No manual page refresh required
✅ Consistent currency display everywhere
