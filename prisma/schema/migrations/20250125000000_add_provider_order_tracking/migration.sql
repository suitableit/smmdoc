-- CreateTable
CREATE TABLE `provider_order_log` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `providerResponse` TEXT NULL,
    `status` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProviderOrderLog_orderId_idx` (`orderId`),
    INDEX `ProviderOrderLog_action_idx` (`action`),
    INDEX `ProviderOrderLog_createdAt_idx` (`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `neworder` ADD COLUMN `providerOrderId` VARCHAR(191) NULL,
    ADD COLUMN `providerStatus` VARCHAR(191) NULL,
    ADD COLUMN `isProviderOrder` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `providerResponse` TEXT NULL,
    ADD COLUMN `lastSyncAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `service` ADD COLUMN `providerServiceId` VARCHAR(191) NULL,
    ADD COLUMN `providerApiUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `NewOrder_providerOrderId_idx` ON `neworder`(`providerOrderId`);

-- CreateIndex
CREATE INDEX `NewOrder_isProviderOrder_idx` ON `neworder`(`isProviderOrder`);

-- CreateIndex
CREATE INDEX `NewOrder_lastSyncAt_idx` ON `neworder`(`lastSyncAt`);

-- AddForeignKey
ALTER TABLE `provider_order_log` ADD CONSTRAINT `provider_order_log_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `neworder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;