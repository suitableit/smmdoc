-- ===============================================
-- Migration Verification Script
-- ===============================================
-- Run this script AFTER post-migration to verify data integrity

-- 1. Check if all backup data has been migrated
SELECT 'VERIFICATION REPORT' as title;
SELECT '==================' as separator;

-- 2. Verify providers migration
SELECT 'Provider Migration Check:' as check_type;
SELECT 
    'Original api_providers count:' as description,
    COUNT(*) as count
FROM backup_api_providers;

SELECT 
    'New providers count:' as description,
    COUNT(*) as count
FROM providers;

SELECT 
    'Migration success:' as description,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_api_providers) = (SELECT COUNT(*) FROM providers)
        THEN 'SUCCESS ✓'
        ELSE 'FAILED ✗'
    END as status;

-- 3. Verify service provider relationships
SELECT 'Service Provider Relationship Check:' as check_type;
SELECT 
    'Original service provider data count:' as description,
    COUNT(*) as count
FROM backup_service_provider_data;

SELECT 
    'Services with provider after migration:' as description,
    COUNT(*) as count
FROM service 
WHERE providerId IS NOT NULL;

-- 4. Check for orphaned data
SELECT 'Orphaned Data Check:' as check_type;
SELECT 
    'Services with invalid provider references:' as description,
    COUNT(*) as count
FROM service s
LEFT JOIN providers p ON s.providerId = p.id
WHERE s.providerId IS NOT NULL AND p.id IS NULL;

-- 5. Verify siteDarkLogo data
SELECT 'SiteDarkLogo Migration Check:' as check_type;
SELECT 
    'Original siteDarkLogo count:' as description,
    COUNT(*) as count
FROM backup_general_settings_siteDarkLogo;

-- Note: Uncomment below if you have a new field for dark logo
-- SELECT 
--     'New dark logo field count:' as description,
--     COUNT(*) as count
-- FROM general_settings 
-- WHERE darkLogo IS NOT NULL;

-- 6. Check table structures
SELECT 'Table Structure Check:' as check_type;
SELECT 
    'Required tables exist:' as description,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers' AND table_schema = DATABASE())
        AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providerOrderLog' AND table_schema = DATABASE())
        THEN 'SUCCESS ✓'
        ELSE 'FAILED ✗'
    END as status;

-- 7. Sample data verification
SELECT 'Sample Provider Data:' as check_type;
SELECT id, name, apiUrl, isActive FROM providers LIMIT 3;

SELECT 'Sample Service Provider Relationships:' as check_type;
SELECT id, name, providerId, providerServiceId FROM service WHERE providerId IS NOT NULL LIMIT 3;

-- 8. Final summary
SELECT 'MIGRATION SUMMARY' as title;
SELECT '=================' as separator;

SELECT 
    'Total providers migrated:' as metric,
    COUNT(*) as value
FROM providers;

SELECT 
    'Total services with providers:' as metric,
    COUNT(*) as value
FROM service 
WHERE providerId IS NOT NULL;

SELECT 
    'Provider order log table ready:' as metric,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providerOrderLog' AND table_schema = DATABASE())
        THEN 'YES ✓'
        ELSE 'NO ✗'
    END as value;

SELECT 
    'Overall migration status:' as metric,
    CASE 
        WHEN (SELECT COUNT(*) FROM backup_api_providers) = (SELECT COUNT(*) FROM providers)
        AND NOT EXISTS (
            SELECT 1 FROM service s
            LEFT JOIN providers p ON s.providerId = p.id
            WHERE s.providerId IS NOT NULL AND p.id IS NULL
        )
        THEN 'SUCCESS ✓'
        ELSE 'NEEDS REVIEW ⚠️'
    END as value;

SELECT 'Verification completed!' as status;