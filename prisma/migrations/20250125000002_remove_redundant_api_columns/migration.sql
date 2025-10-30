-- Remove redundant API columns that duplicate existing functionality
-- apiServiceId is replaced by providerServiceId
-- apiProviderId is replaced by providerId

-- Remove redundant columns
ALTER TABLE `services` DROP COLUMN IF EXISTS `apiServiceId`;
ALTER TABLE `services` DROP COLUMN IF EXISTS `apiProviderId`;