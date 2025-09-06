# 🚀 Safe Database Migration Guide

## ⚠️ Data Loss Prevention Strategy

আপনার `npx prisma validate` command এ যে warning দেখাচ্ছে, সেটা solve করার জন্য এই comprehensive migration plan follow করুন। এতে **কোনো data loss হবে না**।

## 📋 Migration Overview

**Data Loss Warnings:**
- ✅ `siteDarkLogo` column (1 non-null value)
- ✅ `providerId` column in service table (2 non-null values)
- ✅ `providerName` column in service table (2 non-null values)
- ✅ `api_providers` table (6 rows)

## 🛠️ Step-by-Step Migration Process

### Step 1: Database Backup
```bash
# 1. Create database backup
mysqldump -u your_username -p suitabl1_smmdoc > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Run Data Backup Script
```bash
# 2. Connect to your database and run backup script
mysql -u your_username -p suitabl1_smmdoc < scripts/data-backup.sql
```

### Step 3: Pre-Migration Data Preparation
```bash
# 3. Run pre-migration script
mysql -u your_username -p suitabl1_smmdoc < scripts/pre-migration.sql
```

### Step 4: Prisma Migration
```bash
# 4. Now safely run prisma db push
npx prisma db push
```

### Step 5: Post-Migration Data Restoration
```bash
# 5. Restore data to new structure
mysql -u your_username -p suitabl1_smmdoc < scripts/post-migration.sql
```

### Step 6: Verification
```bash
# 6. Verify migration success
mysql -u your_username -p suitabl1_smmdoc < scripts/verify-migration.sql
```

### Step 7: Generate Prisma Client
```bash
# 7. Generate new Prisma client
npx prisma generate
```

## 🔄 Alternative: PowerShell Commands

যদি আপনি PowerShell ব্যবহার করতে চান:

```powershell
# Database connection variables
$DB_USER = "your_username"
$DB_NAME = "suitabl1_smmdoc"
$DB_HOST = "103.191.50.6"
$DB_PORT = "3306"

# Step 1: Backup
mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME > "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# Step 2-6: Run scripts
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < "scripts/data-backup.sql"
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < "scripts/pre-migration.sql"
npx prisma db push
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < "scripts/post-migration.sql"
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p $DB_NAME < "scripts/verify-migration.sql"
npx prisma generate
```

## 🆘 Emergency Rollback

যদি কোনো সমস্যা হয়:

```bash
# Emergency rollback
mysql -u your_username -p suitabl1_smmdoc < scripts/rollback.sql

# Then revert your Prisma schema and run:
npx prisma db pull
npx prisma generate
```

## ✅ Success Verification Checklist

- [ ] All backup tables created successfully
- [ ] Pre-migration data preparation completed
- [ ] Prisma db push completed without errors
- [ ] Post-migration data restoration completed
- [ ] Verification script shows "SUCCESS ✓" status
- [ ] No orphaned data found
- [ ] All provider relationships maintained
- [ ] Application runs without database errors

## 📊 Data Mapping

### api_providers → providers
```sql
api_providers.id → providers.id (with 'provider_' prefix)
api_providers.name → providers.name
api_providers.api_url → providers.apiUrl
api_providers.api_key → providers.apiKey
api_providers.is_active → providers.isActive
```

### service table updates
```sql
service.providerId → service.providerId (mapped to new provider ID)
service.providerName → preserved in mapping table
+ service.providerServiceId (new field)
+ service.providerApiUrl (new field)
```

## 🔧 Troubleshooting

### Common Issues:

1. **Connection Error:**
   ```bash
   # Check database connection
   mysql -h 103.191.50.6 -P 3306 -u your_username -p
   ```

2. **Permission Error:**
   ```bash
   # Make sure user has CREATE, DROP, INSERT, UPDATE permissions
   GRANT ALL PRIVILEGES ON suitabl1_smmdoc.* TO 'your_username'@'%';
   ```

3. **Prisma Schema Issues:**
   ```bash
   # Validate schema before migration
   npx prisma validate
   npx prisma format
   ```

## 📞 Support

যদি কোনো সমস্যা হয়:
1. Verification script এর output check করুন
2. Error logs দেখুন
3. Rollback script ব্যবহার করুন
4. Database backup restore করুন

## 🎯 Final Notes

- এই migration process সম্পূর্ণ safe এবং reversible
- সব data preserve হবে
- Provider order tracking system fully functional হবে
- কোনো downtime ছাড়াই migration সম্ভব

**Happy Migration! 🚀**