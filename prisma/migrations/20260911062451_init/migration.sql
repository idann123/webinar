-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SISWA', 'GURU', 'ADMIN') NOT NULL DEFAULT 'SISWA',
    `status` ENUM('AKTIF', 'NONAKTIF') NOT NULL DEFAULT 'AKTIF',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `kelasId` INTEGER NOT NULL,

    UNIQUE INDEX `siswa_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `nip` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `guru_userId_key`(`userId`),
    UNIQUE INDEX `guru_nip_key`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jurusan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaJurusan` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `jurusan_namaJurusan_key`(`namaJurusan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaKelas` VARCHAR(191) NOT NULL,
    `jurusanId` INTEGER NOT NULL,

    UNIQUE INDEX `kelas_namaKelas_jurusanId_key`(`namaKelas`, `jurusanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mapel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaMapel` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `mapel_namaMapel_key`(`namaMapel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mapel_guru` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mapelId` INTEGER NOT NULL,
    `guruId` INTEGER NOT NULL,

    UNIQUE INDEX `mapel_guru_mapelId_guruId_key`(`mapelId`, `guruId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kegiatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `judulPembelajaran` VARCHAR(191) NOT NULL,
    `mapelId` INTEGER NOT NULL,
    `guruId` INTEGER NOT NULL,
    `tanggal` DATE NOT NULL,
    `waktuMulai` VARCHAR(191) NOT NULL,
    `waktuSelesai` VARCHAR(191) NOT NULL,
    `status` ENUM('BELUM_MULAI', 'BERLANGSUNG', 'SELESAI') NOT NULL DEFAULT 'BELUM_MULAI',
    `deskripsi` TEXT NULL,
    `jumlahSiswaDaftar` INTEGER NOT NULL DEFAULT 0,

    INDEX `kegiatan_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kegiatanId` INTEGER NOT NULL,
    `judulMateri` VARCHAR(191) NOT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `tipe` ENUM('PDF', 'VIDEO', 'LINK') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendaftaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `kegiatanId` INTEGER NOT NULL,
    `tanggalDaftar` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `statusKehadiran` ENUM('HADIR', 'TIDAK_HADIR') NULL,

    UNIQUE INDEX `pendaftaran_siswaId_kegiatanId_key`(`siswaId`, `kegiatanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_kelasId_fkey` FOREIGN KEY (`kelasId`) REFERENCES `kelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru` ADD CONSTRAINT `guru_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_jurusanId_fkey` FOREIGN KEY (`jurusanId`) REFERENCES `jurusan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mapel_guru` ADD CONSTRAINT `mapel_guru_mapelId_fkey` FOREIGN KEY (`mapelId`) REFERENCES `mapel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mapel_guru` ADD CONSTRAINT `mapel_guru_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_mapelId_fkey` FOREIGN KEY (`mapelId`) REFERENCES `mapel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kegiatan` ADD CONSTRAINT `kegiatan_guruId_fkey` FOREIGN KEY (`guruId`) REFERENCES `guru`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materi` ADD CONSTRAINT `materi_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendaftaran` ADD CONSTRAINT `pendaftaran_kegiatanId_fkey` FOREIGN KEY (`kegiatanId`) REFERENCES `kegiatan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
