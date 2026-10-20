-- AlterTable
ALTER TABLE `users` ADD COLUMN `assignedAirport` VARCHAR(191) NULL,
    ADD COLUMN `assignedDeskId` VARCHAR(191) NULL,
    ADD COLUMN `assignedDeskName` VARCHAR(191) NULL,
    ADD COLUMN `baseSalaryMonthlyQAR` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `commissionPerServiceQAR` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `hireDate` VARCHAR(191) NULL,
    ADD COLUMN `jobTitle` VARCHAR(191) NULL,
    ADD COLUMN `monthlyServiceTarget` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rating` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `staffStatus` VARCHAR(191) NULL,
    ADD COLUMN `totalExpensesQAR` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `role` ENUM('super-admin', 'admin', 'operations-manager', 'transit-agent', 'driver-guide', 'finance-accountant', 'vendor-partner', 'staff', 'customer') NOT NULL DEFAULT 'customer';

-- CreateTable
CREATE TABLE `staff_ledger_entries` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `month` VARCHAR(40) NOT NULL,
    `baseSalaryQAR` DOUBLE NOT NULL DEFAULT 0,
    `targetServices` INTEGER NOT NULL DEFAULT 0,
    `completedServices` INTEGER NOT NULL DEFAULT 0,
    `excessServices` INTEGER NOT NULL DEFAULT 0,
    `commissionRatePerService` DOUBLE NOT NULL DEFAULT 0,
    `commissionEarnedQAR` DOUBLE NOT NULL DEFAULT 0,
    `expensesReimbursedQAR` DOUBLE NOT NULL DEFAULT 0,
    `deductionsQAR` DOUBLE NOT NULL DEFAULT 0,
    `grossPayableQAR` DOUBLE NOT NULL DEFAULT 0,
    `amountPaidQAR` DOUBLE NOT NULL DEFAULT 0,
    `amountDueQAR` DOUBLE NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending Payout',
    `paidDate` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `staff_ledger_entries_userId_idx`(`userId`),
    UNIQUE INDEX `staff_ledger_entries_userId_month_key`(`userId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `staff_ledger_entries` ADD CONSTRAINT `staff_ledger_entries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
