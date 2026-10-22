-- Public website CMS: customer reviews + editable site content.

CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL DEFAULT 5,
    `date` VARCHAR(191) NULL,
    `tour` VARCHAR(191) NULL,
    `comment` TEXT NOT NULL,
    `avatar` TEXT NULL,
    `showOnWebsite` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdByName` VARCHAR(191) NULL,
    `updatedBy` VARCHAR(191) NULL,
    `updatedByName` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `site_content` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `group` VARCHAR(191) NULL,
    `label` VARCHAR(191) NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'text',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(191) NULL,
    `updatedByName` VARCHAR(191) NULL,

    UNIQUE INDEX `site_content_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
