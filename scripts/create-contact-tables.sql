-- Contact System Database Tables
-- Run this SQL to create contact-related tables

-- Contact Settings Table
CREATE TABLE IF NOT EXISTS `contact_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contactSystemEnabled` boolean NOT NULL DEFAULT true,
  `maxPendingContacts` int NOT NULL DEFAULT 3,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Categories Table
CREATE TABLE IF NOT EXISTS `contact_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `contact_categories_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'Unread',
  `categoryId` int NOT NULL,
  `attachments` text,
  `adminReply` text,
  `repliedAt` datetime(3),
  `repliedBy` int,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `contact_messages_userId_idx` (`userId`),
  KEY `contact_messages_categoryId_idx` (`categoryId`),
  KEY `contact_messages_status_idx` (`status`),
  CONSTRAINT `contact_messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `contact_messages_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `contact_categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `contact_messages_repliedBy_fkey` FOREIGN KEY (`repliedBy`) REFERENCES `User` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Contact Settings
INSERT IGNORE INTO `contact_settings` (`contactSystemEnabled`, `maxPendingContacts`) 
VALUES (true, 3);

-- Insert Default Contact Categories
INSERT IGNORE INTO `contact_categories` (`name`) VALUES 
('General Inquiry'),
('Business Partnership'),
('Media & Press'),
('Technical Support'),
('Billing & Payments'),
('Order Issues'),
('Account Management'),
('API & Integration'),
('Other');
