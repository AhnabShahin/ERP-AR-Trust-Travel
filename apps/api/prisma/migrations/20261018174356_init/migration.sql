-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('super-admin', 'operations-manager', 'transit-agent', 'driver-guide', 'finance-accountant', 'vendor-partner', 'customer') NOT NULL DEFAULT 'customer',
    `phone` VARCHAR(191) NULL,
    `avatar` TEXT NULL,
    `department` VARCHAR(191) NULL,
    `vendorId` VARCHAR(191) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `lastLogin` DATETIME(3) NULL,
    `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerifiedAt` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `nationality` VARCHAR(191) NULL,
    `passportNumber` VARCHAR(191) NULL,
    `passportExpiry` VARCHAR(191) NULL,
    `preferredLanguage` VARCHAR(191) NULL,
    `dietaryNotes` TEXT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `emergencyPhone` VARCHAR(191) NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `licenseCategory` VARCHAR(191) NULL,
    `experienceYears` INTEGER NULL,
    `spokenLanguages` JSON NULL,
    `companyName` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `pnr` VARCHAR(191) NOT NULL,
    `passengerName` VARCHAR(191) NOT NULL,
    `passengerPhone` VARCHAR(191) NOT NULL,
    `passengerEmail` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `flightNumber` VARCHAR(191) NOT NULL,
    `arrivalAirport` VARCHAR(191) NOT NULL,
    `arrivalTime` VARCHAR(191) NOT NULL,
    `terminalGate` VARCHAR(191) NULL,
    `pickupBay` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `packageName` VARCHAR(191) NOT NULL,
    `packageNameAr` VARCHAR(191) NULL,
    `paxCount` INTEGER NOT NULL DEFAULT 1,
    `totalQAR` DOUBLE NOT NULL DEFAULT 0,
    `paymentCurrency` VARCHAR(191) NOT NULL DEFAULT 'QAR',
    `paymentMethod` VARCHAR(191) NOT NULL,
    `driverId` VARCHAR(191) NULL,
    `driverName` VARCHAR(191) NULL,
    `driverVehicle` VARCHAR(191) NULL,
    `driverPhone` VARCHAR(191) NULL,
    `guideId` VARCHAR(191) NULL,
    `guideName` VARCHAR(191) NULL,
    `qrStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `qrCodeUrl` TEXT NULL,
    `voucherSent` BOOLEAN NOT NULL DEFAULT false,
    `bookingDate` VARCHAR(191) NULL,
    `bookingTime` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `deskId` VARCHAR(191) NULL,
    `deskCode` VARCHAR(191) NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'Airport Desk',
    `leadType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_pnr_key`(`pnr`),
    INDEX `bookings_qrStatus_idx`(`qrStatus`),
    INDEX `bookings_source_idx`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fleet_vehicles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `passengers` INTEGER NOT NULL,
    `luggage` INTEGER NOT NULL,
    `priceQAR` DOUBLE NOT NULL,
    `rateType` VARCHAR(191) NOT NULL,
    `features` JSON NOT NULL,
    `image` TEXT NOT NULL,
    `idealFor` VARCHAR(191) NOT NULL,
    `assignedDriverId` VARCHAR(191) NULL,
    `assignedDriverName` VARCHAR(191) NULL,
    `plateNumber` VARCHAR(191) NULL,
    `modelYear` VARCHAR(191) NULL,
    `showOnWebsite` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `vehicle` VARCHAR(191) NOT NULL,
    `plateNumber` VARCHAR(191) NOT NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `currentMission` VARCHAR(191) NULL,
    `activePassengers` INTEGER NULL,
    `totalTripsToday` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `image` TEXT NULL,
    `fleetVehicleId` VARCHAR(191) NULL,
    `priceQAR` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_guides` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `languages` JSON NOT NULL,
    `specialty` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `toursLedToday` INTEGER NOT NULL DEFAULT 0,
    `totalCommissionQAR` DOUBLE NOT NULL DEFAULT 0,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `assignedAirport` VARCHAR(191) NULL,
    `assignedDeskId` VARCHAR(191) NULL,
    `assignedDeskName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `hireDate` VARCHAR(191) NOT NULL,
    `baseSalaryMonthlyQAR` DOUBLE NOT NULL DEFAULT 0,
    `monthlyServiceTarget` INTEGER NOT NULL DEFAULT 0,
    `commissionPerServiceQAR` DOUBLE NOT NULL DEFAULT 0,
    `monthlyRecords` JSON NULL,
    `totalExpensesQAR` DOUBLE NOT NULL DEFAULT 0,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `emergencyContact` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guest_tiers` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `discountPercentage` DOUBLE NOT NULL DEFAULT 0,
    `badgeColor` VARCHAR(191) NULL,
    `minSpendQAR` DOUBLE NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guests` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `vipTier` VARCHAR(191) NOT NULL,
    `passportNo` VARCHAR(191) NULL,
    `totalBookings` INTEGER NOT NULL DEFAULT 0,
    `totalSpentQAR` DOUBLE NOT NULL DEFAULT 0,
    `lastArrivalAirport` VARCHAR(191) NULL,
    `lastFlight` VARCHAR(191) NULL,
    `lastTripDate` VARCHAR(191) NULL,
    `specialPreferences` TEXT NULL,
    `bookingIds` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_vendors` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `locationZone` VARCHAR(191) NOT NULL,
    `starRating` INTEGER NOT NULL,
    `contactPerson` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `commissionRate` DOUBLE NOT NULL DEFAULT 0,
    `desks` JSON NOT NULL,
    `roomOptions` JSON NOT NULL,
    `contractStatus` VARCHAR(191) NOT NULL,
    `totalBookings` INTEGER NOT NULL DEFAULT 0,
    `totalRevenueQAR` DOUBLE NOT NULL DEFAULT 0,
    `imageUrl` TEXT NULL,
    `amenities` JSON NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotel_bookings` (
    `id` VARCHAR(191) NOT NULL,
    `confirmationCode` VARCHAR(191) NOT NULL,
    `hotelId` VARCHAR(191) NOT NULL,
    `hotelName` VARCHAR(191) NOT NULL,
    `hotelLocation` VARCHAR(191) NULL,
    `guestName` VARCHAR(191) NOT NULL,
    `guestPhone` VARCHAR(191) NOT NULL,
    `guestEmail` VARCHAR(191) NOT NULL,
    `guestNationality` VARCHAR(191) NULL,
    `roomType` VARCHAR(191) NOT NULL,
    `roomsCount` INTEGER NOT NULL DEFAULT 1,
    `paxAdults` INTEGER NOT NULL DEFAULT 1,
    `paxChildren` INTEGER NOT NULL DEFAULT 0,
    `checkInDate` VARCHAR(191) NOT NULL,
    `checkOutDate` VARCHAR(191) NOT NULL,
    `nights` INTEGER NOT NULL,
    `mealPlan` VARCHAR(191) NOT NULL,
    `ratePerNightQAR` DOUBLE NOT NULL,
    `totalQAR` DOUBLE NOT NULL,
    `commissionRate` DOUBLE NOT NULL DEFAULT 0,
    `commissionEarnedQAR` DOUBLE NOT NULL DEFAULT 0,
    `bookingSource` VARCHAR(191) NOT NULL,
    `deskCode` VARCHAR(191) NULL,
    `agentName` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `paymentStatus` VARCHAR(191) NOT NULL,
    `bookingStatus` VARCHAR(191) NOT NULL,
    `specialRequests` TEXT NULL,
    `voucherSent` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotel_bookings_confirmationCode_key`(`confirmationCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `finance_expenses` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amountQAR` DOUBLE NOT NULL,
    `approvedBy` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `department` VARCHAR(191) NULL,
    `requestedBy` VARCHAR(191) NULL,
    `requestedByRole` VARCHAR(191) NULL,
    `submittedBy` VARCHAR(191) NULL,
    `receiptRef` VARCHAR(191) NULL,
    `receiptNumber` VARCHAR(191) NULL,
    `merchant` VARCHAR(191) NULL,
    `deskId` VARCHAR(191) NULL,
    `deskName` VARCHAR(191) NULL,
    `approvedAt` VARCHAR(191) NULL,
    `approvalNotes` TEXT NULL,
    `notes` TEXT NULL,
    `rejectedReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `finance_expenses_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency_items` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `rateToQAR` DOUBLE NOT NULL,
    `isPegged` BOOLEAN NOT NULL DEFAULT false,
    `peggedNote` VARCHAR(191) NULL,
    `bankAccount` VARCHAR(191) NULL,
    `cashVaultBalance` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `currency_items_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `currency_history` (
    `id` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NULL,
    `currencyCode` VARCHAR(191) NOT NULL,
    `currencyName` VARCHAR(191) NOT NULL,
    `rateToQAR` DOUBLE NOT NULL,
    `previousRateToQAR` DOUBLE NULL,
    `vaultBalance` DOUBLE NOT NULL,
    `balanceQAREquivalent` DOUBLE NOT NULL,
    `recordedBy` VARCHAR(191) NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `currency_history_currencyCode_idx`(`currencyCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_packages` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `serviceType` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `priceQAR` DOUBLE NOT NULL,
    `description` TEXT NOT NULL,
    `descriptionAr` TEXT NULL,
    `pickupLocation` VARCHAR(191) NULL,
    `includes` JSON NOT NULL,
    `image` TEXT NULL,
    `badge` VARCHAR(191) NULL,
    `groupSize` VARCHAR(191) NULL,
    `departure` VARCHAR(191) NULL,
    `rating` DOUBLE NULL,
    `reviewCount` INTEGER NULL,
    `originalPriceQAR` DOUBLE NULL,
    `isMultiDay` BOOLEAN NOT NULL DEFAULT false,
    `days` INTEGER NULL,
    `nights` INTEGER NULL,
    `highlights` JSON NULL,
    `excluded` JSON NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `showOnWebsite` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_categories` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameAr` VARCHAR(191) NULL,
    `serviceType` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `airport_desks` (
    `id` VARCHAR(191) NOT NULL,
    `airportCode` VARCHAR(191) NOT NULL,
    `airportName` VARCHAR(191) NOT NULL,
    `deskCode` VARCHAR(191) NOT NULL,
    `deskName` VARCHAR(191) NOT NULL,
    `deskNameAr` VARCHAR(191) NULL,
    `terminal` VARCHAR(191) NOT NULL,
    `zone` VARCHAR(191) NULL,
    `assignedEmployeeId` VARCHAR(191) NULL,
    `assignedEmployeeName` VARCHAR(191) NULL,
    `assignedEmployeeRole` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL,
    `shiftTiming` VARCHAR(191) NULL,
    `phoneExt` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `operatingHours` VARCHAR(191) NULL,
    `dailyTargetQAR` DOUBLE NULL,
    `currentDrawerCashQAR` DOUBLE NULL,
    `deskType` VARCHAR(191) NULL,
    `hotelVendorId` VARCHAR(191) NULL,
    `hotelName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `airport_desks_deskCode_key`(`deskCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `desk_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `deskId` VARCHAR(191) NOT NULL,
    `deskCode` VARCHAR(191) NOT NULL,
    `deskName` VARCHAR(191) NOT NULL,
    `airportCode` VARCHAR(191) NOT NULL,
    `terminal` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `employeeName` VARCHAR(191) NOT NULL,
    `employeeRole` VARCHAR(191) NOT NULL,
    `assignedDate` VARCHAR(191) NOT NULL,
    `shiftTiming` VARCHAR(191) NOT NULL,
    `assignedBy` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `titleAr` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `messageAr` TEXT NULL,
    `time` VARCHAR(191) NULL,
    `type` VARCHAR(191) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `actionLabel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actor` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `entity` VARCHAR(191) NULL,
    `entityId` VARCHAR(191) NULL,
    `details` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `system_audit_logs_entity_idx`(`entity`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
