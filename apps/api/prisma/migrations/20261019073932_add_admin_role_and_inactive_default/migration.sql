-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('super-admin', 'admin', 'operations-manager', 'transit-agent', 'driver-guide', 'finance-accountant', 'vendor-partner', 'customer') NOT NULL DEFAULT 'customer',
    MODIFY `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'inactive';
