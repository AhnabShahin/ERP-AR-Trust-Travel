-- Merge the standalone Guest directory into users (role = customer).
-- Customers are now just users; "guests" no longer exists as its own table,
-- and loyalty tiers belong to customers.

-- 1. Customer users can carry a VIP / loyalty tier (matches CustomerTier.name).
ALTER TABLE `users` ADD COLUMN `vipTier` VARCHAR(191) NULL;

-- 2. Tiers now belong to customers, not guests — rename the table, keeping rows.
RENAME TABLE `guest_tiers` TO `customer_tiers`;

-- 3. Drop the old Guest CRM directory. Its data is superseded by customer users.
DROP TABLE `guests`;
