-- DropIndex
DROP INDEX `airport_desks_locationId_fkey` ON `airport_desks`;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `customerId` VARCHAR(191) NULL,
    ADD COLUMN `invoiceId` VARCHAR(191) NULL,
    ADD COLUMN `scheduledEnd` DATETIME(3) NULL,
    ADD COLUMN `scheduledStart` DATETIME(3) NULL,
    ADD COLUMN `serviceType` VARCHAR(191) NOT NULL DEFAULT 'tour-service',
    ADD COLUMN `startedAt` DATETIME(3) NULL,
    ADD COLUMN `tripStatus` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
    ADD COLUMN `vehicleId` VARCHAR(191) NULL,
    ADD COLUMN `vehicleName` VARCHAR(191) NULL,
    ADD COLUMN `vehiclePlate` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `drivers` ADD COLUMN `company` VARCHAR(191) NULL,
    ADD COLUMN `driverType` VARCHAR(191) NOT NULL DEFAULT 'first-party',
    MODIFY `vehicle` VARCHAR(191) NULL,
    MODIFY `plateNumber` VARCHAR(191) NULL,
    MODIFY `vehicleType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `fleet_vehicles` ADD COLUMN `ownership` VARCHAR(191) NOT NULL DEFAULT 'owned',
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'Available';

-- CreateTable
CREATE TABLE `trip_status_logs` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NULL,
    `fromStatus` VARCHAR(191) NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NULL,
    `vehicleId` VARCHAR(191) NULL,
    `actorId` VARCHAR(191) NULL,
    `actorName` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `trip_status_logs_bookingId_idx`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `bookings_tripStatus_idx` ON `bookings`(`tripStatus`);

-- CreateIndex
CREATE INDEX `bookings_serviceType_idx` ON `bookings`(`serviceType`);

-- AddForeignKey
ALTER TABLE `staff_ledger_entries` ADD CONSTRAINT `staff_ledger_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `airport_desks` ADD CONSTRAINT `airport_desks_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
