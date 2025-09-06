-- ===============================================
-- Pre-Migration Script for Safe Data Transfer
-- ===============================================
-- Run this script AFTER backup but BEFORE prisma db push
-- This will safely move data to new structure

-- 1. Create temporary provider table if it doesn't exist
-- (This should match your new Prisma schema structure)
CREATE TABLE IF NOT EXISTS temp_providers (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    apiUrl VARCHAR(500) NOT NULL,
    apiKey VARCHAR(500),
    isActive BOOLEAN DEFAULT true,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- 2. Migrate api_providers data to temp_providers
INSERT INTO temp_providers (id, name, apiUrl, apiKey, isActive, created_at, updated_at)
SELECT 
    CONCAT('provider_', id) as id,
    name,
    api_url as apiUrl,
    api_key as apiKey,
    COALESCE(is_active, true) as isActive,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM api_providers
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    apiUrl = VALUES(apiUrl),
    apiKey = VALUES(apiKey),
    isActive = VALUES(isActive),
    updated_at = VALUES(updated_at);

-- 3. Create temporary service provider mapping
CREATE TABLE IF NOT EXISTS temp_service_provider_mapping (
    service_id INT,
    old_provider_id VARCHAR(255),
    old_provider_name VARCHAR(255),
    new_provider_id VARCHAR(191),
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- 4. Map existing service provider data
INSERT INTO temp_service_provider_mapping (service_id, old_provider_id, old_provider_name, new_provider_id)
SELECT 
    s.id as service_id,
    s.providerId as old_provider_id,
    s.providerName as old_provider_name,
    CASE 
        WHEN s.providerId IS NOT NULL THEN CONCAT('provider_', s.providerId)
        ELSE NULL
    END as new_provider_id
FROM service s
WHERE s.providerId IS NOT NULL OR s.providerName IS NOT NULL;

-- 5. Create temporary general settings backup for siteDarkLogo
CREATE TABLE IF NOT EXISTS temp_general_settings_logo (
    id INT,
    siteDarkLogo TEXT,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

INSERT INTO temp_general_settings_logo (id, siteDarkLogo)
SELECT id, siteDarkLogo
FROM general_settings
WHERE siteDarkLogo IS NOT NULL;

-- Verification
SELECT 'temp_providers count:' as info, COUNT(*) as count FROM temp_providers;
SELECT 'temp_service_provider_mapping count:' as info, COUNT(*) as count FROM temp_service_provider_mapping;
SELECT 'temp_general_settings_logo count:' as info, COUNT(*) as count FROM temp_general_settings_logo;

SELECT 'Pre-migration data preparation completed!' as status;