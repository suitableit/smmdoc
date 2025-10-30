-- Add orderLink column to services table if it doesn't exist
-- This column stores the order link type: "link" or "username"

ALTER TABLE `services` ADD COLUMN IF NOT EXISTS `orderLink` VARCHAR(191) NOT NULL DEFAULT 'link';