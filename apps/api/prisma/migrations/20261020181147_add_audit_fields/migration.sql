-- DropIndex
DROP INDEX `airport_desks_locationId_fkey` ON `airport_desks`;

-- AlterTable
ALTER TABLE `airport_desks` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `commission_rules` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `currency_history` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `currency_items` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `desk_assignments` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `drivers` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `finance_expenses` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `fleet_vehicles` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `guest_tiers` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `guests` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hotel_bookings` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `hotel_vendors` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `locations` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `salary_records` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `service_categories` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `staff_ledger_entries` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tour_guides` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tour_packages` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `createdBy` VARCHAR(191) NULL,
    ADD COLUMN `createdByName` VARCHAR(191) NULL,
    ADD COLUMN `updatedBy` VARCHAR(191) NULL,
    ADD COLUMN `updatedByName` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `staff_ledger_entries` ADD CONSTRAINT `staff_ledger_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `airport_desks` ADD CONSTRAINT `airport_desks_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
