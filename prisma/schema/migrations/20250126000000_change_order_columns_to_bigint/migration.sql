-- AlterTable: Change min_order and max_order from INTEGER to BIGINT
-- Note: If table name is 'service' (singular), change 'services' to 'service' below

-- Try services (plural) first - this is what the schema indicates
ALTER TABLE `services` MODIFY COLUMN `min_order` BIGINT NOT NULL;
ALTER TABLE `services` MODIFY COLUMN `max_order` BIGINT NOT NULL;

-- If the above fails, the table might be named 'service' (singular)
-- Uncomment the lines below and comment out the lines above:
-- ALTER TABLE `service` MODIFY COLUMN `min_order` BIGINT NOT NULL;
-- ALTER TABLE `service` MODIFY COLUMN `max_order` BIGINT NOT NULL;

