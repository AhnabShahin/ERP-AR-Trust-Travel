-- Email verification code (6-digit, hashed) + expiry / attempt tracking.
ALTER TABLE `users`
  ADD COLUMN `email_verify_code_hash` VARCHAR(191) NULL,
  ADD COLUMN `email_verify_expiry` DATETIME(3) NULL,
  ADD COLUMN `email_verify_attempts` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `email_verify_sent_at` DATETIME(3) NULL;

-- Backfill: every account that already exists keeps its access. Only NEW
-- signups created after this migration go through the email-code flow, so
-- mark all current rows as verified to avoid locking anyone out.
UPDATE `users` SET `isEmailVerified` = true WHERE `isEmailVerified` = false;
