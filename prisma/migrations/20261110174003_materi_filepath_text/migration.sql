-- Widened materi.filePath from VARCHAR(191) to TEXT so long material URLs
-- no longer fail with Prisma error P2000 when a guru adds a link.

ALTER TABLE `materi` MODIFY `filePath` TEXT NOT NULL;
