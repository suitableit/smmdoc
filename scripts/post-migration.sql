-- ===============================================
-- Post-Migration Script for Data Restoration
-- ===============================================
-- Run this script AFTER prisma db push
-- This will restore data to new structure

-- 1. Insert providers from temp table to new providers table
INSERT INTO providers (id, name, apiUrl, apiKey, isActive, createdAt, updatedAt)
SELECT 
    id,
    name,
    apiUrl,
    apiKey,
    isActive,
    created_at as createdAt,
    updated_at as updatedAt
FROM temp_providers
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    apiUrl = VALUES(apiUrl),
    apiKey = VALUES(apiKey),
    isActive = VALUES(isActive),
    updatedAt = VALUES(updatedAt);

-- 2. Update service table with new provider relationships
UPDATE service s
INNER JOIN temp_service_provider_mapping m ON s.id = m.service_id
SET 
    s.providerId = m.new_provider_id,
    s.providerServiceId = m.old_provider_id,  -- Store old provider ID as service ID
    s.providerApiUrl = (
        SELECT p.apiUrl 
        FROM providers p 
        WHERE p.id = m.new_provider_id
    ),
    s.updatedAt = NOW()
WHERE m.new_provider_id IS NOT NULL;

-- 3. Restore siteDarkLogo data (if there's a new field for it)
-- Note: You might need to adjust this based on your new schema
-- UPDATE general_settings gs
-- INNER JOIN temp_general_settings_logo t ON gs.id = t.id
-- SET gs.darkLogo = t.siteDarkLogo  -- Assuming new field name is darkLogo
-- WHERE t.siteDarkLogo IS NOT NULL;

-- 4. Create provider order logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS providerOrderLog (
    id VARCHAR(191) NOT NULL PRIMARY KEY,
    orderId VARCHAR(191) NOT NULL,
    providerId VARCHAR(191) NOT NULL,
    action ENUM('PLACE_ORDER', 'CHECK_STATUS', 'CANCEL_ORDER') NOT NULL,
    status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    request JSON,
    response JSON,
    errorMessage TEXT,
    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_orderId (orderId),
    INDEX idx_providerId (providerId),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
);

-- Verification queries
SELECT 'providers count:' as info, COUNT(*) as count FROM providers;
SELECT 'services with provider:' as info, COUNT(*) as count FROM service WHERE providerId IS NOT NULL;
SELECT 'providerOrderLog table exists:' as info, 
    CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as exists
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'providerOrderLog';

SELECT 'Post-migration data restoration completed!' as status;