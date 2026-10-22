-- Move uploads from DB blobs to on-disk files.
-- Existing blob rows are reset (files now live under UPLOAD_DIR); the table keeps
-- only a host-less disk path per upload, never the bytes.
DELETE FROM `uploads`;

ALTER TABLE `uploads` DROP COLUMN `bytes`;

ALTER TABLE `uploads` ADD COLUMN `path` VARCHAR(191) NOT NULL;
