-- ===============================================
-- Emergency Rollback Script
-- ===============================================
-- Use this script ONLY if migration fails
-- This will restore data from backup tables

-- WARNING: This script should be used with extreme caution
-- Make sure to backup current state before running rollback

-- 1. Restore api_providers table
DROP TABLE IF EXISTS api_providers;
CREATE TABLE api_providers AS SELECT * FROM backup_api_providers;

-- 2. Restore providerId and providerName in service table
UPDATE service s
INNER JOIN backup_service_provider_data b ON s.id = b.id
SET 
    s.providerId = b.providerId,
    s.providerName = b.providerName
WHERE b.providerId IS NOT NULL OR b.providerName IS NOT NULL;

-- 3. Restore siteDarkLogo in general_settings
UPDATE general_settings gs
INNER JOIN backup_general_settings_siteDarkLogo b ON gs.id = b.id
SET gs.siteDarkLogo = b.siteDarkLogo
WHERE b.siteDarkLogo IS NOT NULL;

-- 4. Clean up new tables if they exist
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS providerOrderLog;

-- 5. Clean up temporary tables
DROP TABLE IF EXISTS temp_providers;
DROP TABLE IF EXISTS temp_service_provider_mapping;
DROP TABLE IF EXISTS temp_general_settings_logo;

-- Verification
SELECT 'api_providers restored count:' as info, COUNT(*) as count FROM api_providers;
SELECT 'service provider data restored:' as info, COUNT(*) as count 
FROM service WHERE providerId IS NOT NULL OR providerName IS NOT NULL;
SELECT 'siteDarkLogo restored:' as info, COUNT(*) as count 
FROM general_settings WHERE siteDarkLogo IS NOT NULL;

SELECT 'ROLLBACK COMPLETED - Database restored to previous state!' as status;

-- Note: After rollback, you may need to:
-- 1. Revert your Prisma schema changes
-- 2. Run: npx prisma db pull
-- 3. Run: npx prisma generate