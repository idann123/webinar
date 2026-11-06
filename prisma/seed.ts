import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mengosongkan data lama...");
  await prisma.pendaftaran.deleteMany();
  await prisma.materi.deleteMany();
  await prisma.kegiatan.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mapelGuru.deleteMany();
  await prisma.mapel.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.jurusan.deleteMany();

  console.log("Membuat admin...");
  await prisma.user.create({
    data: {
      nama: "Administrator Kosgoro",
      email: "admin@kosgoro.sch.id",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  console.log("Membuat jurusan, kelas, mapel...");
  const tkj = await prisma.jurusan.create({ data: { namaJurusan: "TKJ" } });
  const rpl = await prisma.jurusan.create({ data: { namaJurusan: "RPL" } });
  const ak = await prisma.jurusan.create({ data: { namaJurusan: "Akuntansi" } });

  await prisma.kelas.create({ data: { namaKelas: "XI TKJ 1", jurusanId: tkj.id } });
  const kelasRPL1 = await prisma.kelas.create({ data: { namaKelas: "XI RPL 1", jurusanId: rpl.id } });
  await prisma.kelas.create({ data: { namaKelas: "XI RPL 2", jurusanId: rpl.id } });
  await prisma.kelas.create({ data: { namaKelas: "XI AK 1", jurusanId: ak.id } });

  await prisma.mapel.create({ data: { namaMapel: "Basis Data" } });
  const mapelPemweb = await prisma.mapel.create({ data: { namaMapel: "Pemrograman Web" } });
  const mapelJarkom = await prisma.mapel.create({ data: { namaMapel: "Jaringan Komputer" } });
  const mapelMatematika = await prisma.mapel.create({ data: { namaMapel: "Matematika" } });
  await prisma.mapel.create({ data: { namaMapel: "Akuntansi Dasar" } });

  console.log("Membuat guru...");
  await prisma.user.create({
    data: {
      nama: "Budi Santoso, S.Kom",
      email: "budi@kosgoro.sch.id",
      password: await bcrypt.hash("guru123", 10),
      role: "GURU",
      guru: {
        create: {
          nip: "1995010120221001",
          jabatan: "Waka. Bid. Kurikulum",
          foto: "https://smks-kosgoro.sch.id/public/uploads/1791117907_Pa_Kharis.jpg",
          mapelGuru: {
            create: [
              { mapelId: mapelPemweb.id },
              {
                mapelId: (
                  await prisma.mapel.findUniqueOrThrow({ where: { namaMapel: "Basis Data" } })
                ).id,
              },
            ],
          },
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      nama: "Sarah Anindita, M.Kom",
      email: "sarah@kosgoro.sch.id",
      password: await bcrypt.hash("guru123", 10),
      role: "GURU",
      guru: {
        create: {
          nip: "1998021520221002",
          jabatan: "Guru Mapel",
          foto: "https://smks-kosgoro.sch.id/public/uploads/1791123180_bu_holilah.jpg",
          mapelGuru: {
            create: [{ mapelId: mapelJarkom.id }, { mapelId: mapelMatematika.id }],
          },
        },
      },
    },
  });

  console.log("Membuat siswa contoh...");
  await prisma.user.create({
    data: {
      nama: "Muhammad Bian",
      email: "siswa@kosgoro.sch.id",
      password: await bcrypt.hash("siswa123", 10),
      role: "SISWA",
      siswa: { create: { kelasId: kelasRPL1.id } },
    },
  });

  console.log("Seed selesai. Akun contoh:");
  console.log("  Admin : admin@kosgoro.sch.id / admin123");
  console.log("  Guru  : budi@kosgoro.sch.id / guru123 (Pemweb, Basis Data)");
  console.log("  Guru  : sarah@kosgoro.sch.id / guru123 (Jarkom, Matematika)");
  console.log("  Siswa : siswa@kosgoro.sch.id / siswa123 (XI RPL 1)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });