-- ===============================================
-- Data Backup Script for Safe Migration
-- ===============================================
-- Run this script BEFORE running prisma db push
-- This will backup all data that might be lost

-- 1. Backup siteDarkLogo from general_settings
CREATE TABLE IF NOT EXISTS backup_general_settings_siteDarkLogo AS
SELECT id, siteDarkLogo, created_at, updated_at
FROM general_settings 
WHERE siteDarkLogo IS NOT NULL;

-- 2. Backup providerId and providerName from service table
CREATE TABLE IF NOT EXISTS backup_service_provider_data AS
SELECT id, name, providerId, providerName, created_at, updated_at
FROM service 
WHERE providerId IS NOT NULL OR providerName IS NOT NULL;

-- 3. Complete backup of api_providers table
CREATE TABLE IF NOT EXISTS backup_api_providers AS
SELECT * FROM api_providers;

-- 4. Export data to files (optional - for extra safety)
-- You can run these commands manually if needed:
-- SELECT * FROM backup_general_settings_siteDarkLogo INTO OUTFILE '/tmp/siteDarkLogo_backup.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
-- SELECT * FROM backup_service_provider_data INTO OUTFILE '/tmp/service_provider_backup.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
-- SELECT * FROM backup_api_providers INTO OUTFILE '/tmp/api_providers_backup.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';

-- Verification queries
SELECT 'siteDarkLogo backup count:' as info, COUNT(*) as count FROM backup_general_settings_siteDarkLogo;
SELECT 'service provider data backup count:' as info, COUNT(*) as count FROM backup_service_provider_data;
SELECT 'api_providers backup count:' as info, COUNT(*) as count FROM backup_api_providers;

SELECT 'Backup completed successfully!' as status;