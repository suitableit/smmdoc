-- Remove provider-related fields from service table
ALTER TABLE `service` DROP COLUMN IF EXISTS `providerId`;
ALTER TABLE `service` DROP COLUMN IF EXISTS `providerName`;
ALTER TABLE `service` DROP COLUMN IF EXISTS `providerServiceId`;
ALTER TABLE `service` DROP COLUMN IF EXISTS `providerApiUrl`;

-- Remove provider-related fields from neworder table
ALTER TABLE `neworder` DROP COLUMN IF EXISTS `providerOrderId`;
ALTER TABLE `neworder` DROP COLUMN IF EXISTS `providerStatus`;
ALTER TABLE `neworder` DROP COLUMN IF EXISTS `isProviderOrder`;
ALTER TABLE `neworder` DROP COLUMN IF EXISTS `providerResponse`;
ALTER TABLE `neworder` DROP COLUMN IF EXISTS `lastSyncAt`;

-- Drop provider-related indexes
DROP INDEX IF EXISTS `NewOrder_providerOrderId_idx` ON `neworder`;
DROP INDEX IF EXISTS `NewOrder_isProviderOrder_idx` ON `neworder`;
DROP INDEX IF EXISTS `NewOrder_lastSyncAt_idx` ON `neworder`;

-- Drop provider_order_log table
DROP TABLE IF EXISTS `provider_order_log`;

-- Drop api_providers table
DROP TABLE IF EXISTS `api_providers`;