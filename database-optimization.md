# Database Optimization for Transaction Queries

## Current Issue
The `/api/transactions` endpoint is experiencing timeout issues due to slow database queries.

## Recommended Database Indexes

Add these indexes to improve query performance:

### 1. AddFund Table Indexes

```sql
-- Index for userId and status queries (most common)
CREATE INDEX idx_addfund_userid_status ON AddFund(userId, status);

-- Index for status and createdAt (for admin pending transactions)
CREATE INDEX idx_addfund_status_created ON AddFund(status, createdAt DESC);

-- Index for userId and createdAt (for user transaction history)
CREATE INDEX idx_addfund_userid_created ON AddFund(userId, createdAt DESC);

-- Composite index for admin queries
CREATE INDEX idx_addfund_admin_queries ON AddFund(status, admin_status, createdAt DESC);
```

### 2. Prisma Schema Updates

Add these to your `prisma/schema.prisma` file in the AddFund model:

```prisma
model AddFund {
  // ... existing fields ...
  
  @@index([userId, status])
  @@index([status, createdAt(sort: Desc)])
  @@index([userId, createdAt(sort: Desc)])
  @@index([status, admin_status, createdAt(sort: Desc)])
}
```

### 3. Run Migration

After updating the schema, run:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_transaction_indexes
```

## Query Optimizations Made

### 1. Limited Query Results
- Reduced default limit from 50 to 10
- Added maximum limit of 100 records
- Added query timeout of 10 seconds

### 2. Selective Field Fetching
- Only fetch required fields instead of all fields
- Reduced data transfer size

### 3. Admin-Specific Optimizations
- Added `admin=true` parameter for admin queries
- Separate logic for admin vs user queries
- Default to pending transactions for admin view

### 4. Frontend Optimizations
- Added request timeout of 10 seconds
- Better error handling
- Reduced polling frequency

## Expected Performance Improvements

With these optimizations:
- Transaction queries should complete in < 1 second
- Admin dashboard should load faster
- Reduced server load
- Better user experience

## Monitoring

Monitor these metrics after implementation:
- API response times
- Database query execution time
- Error rates
- User experience feedback

## Additional Recommendations

1. **Pagination**: Implement proper pagination for large datasets
2. **Caching**: Consider Redis caching for frequently accessed data
3. **Connection Pooling**: Ensure proper database connection pooling
4. **Query Analysis**: Use database query analysis tools to identify slow queries
