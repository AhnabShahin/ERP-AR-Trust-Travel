/*
  Warnings:

  - You are about to drop the column `entity` on the `system_audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `system_audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `system_audit_logs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `system_audit_logs_entity_idx` ON `system_audit_logs`;

-- AlterTable
ALTER TABLE `system_audit_logs` DROP COLUMN `entity`,
    DROP COLUMN `entityId`,
    DROP COLUMN `ipAddress`,
    ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `role` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NULL,
    ADD COLUMN `timestamp` VARCHAR(191) NULL,
    MODIFY `details` TEXT NULL;

-- CreateTable
CREATE TABLE `salary_records` (
    `id` VARCHAR(191) NOT NULL,
    `employeeName` VARCHAR(191) NOT NULL,
    `roleTitle` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `fixedBaseMonthlyQAR` DOUBLE NOT NULL DEFAULT 0,
    `accruedCommissionQAR` DOUBLE NOT NULL DEFAULT 0,
    `netPayableQAR` DOUBLE NOT NULL DEFAULT 0,
    `paymentCycle` VARCHAR(191) NOT NULL,
    `payoutStatus` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_rules` (
    `id` VARCHAR(191) NOT NULL,
    `targetRole` VARCHAR(191) NOT NULL,
    `ruleDescription` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `rateValue` DOUBLE NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `appliesTo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_settings` (
    `key` VARCHAR(191) NOT NULL,
    `value` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `system_audit_logs_category_idx` ON `system_audit_logs`(`category`);
