-- DropIndex
DROP INDEX `airport_desks_locationId_fkey` ON `airport_desks`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `driverType` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `staff_ledger_entries` ADD CONSTRAINT `staff_ledger_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `airport_desks` ADD CONSTRAINT `airport_desks_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
