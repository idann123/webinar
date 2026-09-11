import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d;
}

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
          mapelGuru: {
            create: [{ mapelId: mapelJarkom.id }, { mapelId: mapelMatematika.id }],
          },
        },
      },
    },
  });

  console.log("Membuat siswa contoh...");
  const siswaBian = await prisma.user.create({
    data: {
      nama: "Muhammad Bian",
      email: "siswa@kosgoro.sch.id",
      password: await bcrypt.hash("siswa123", 10),
      role: "SISWA",
      siswa: { create: { kelasId: kelasRPL1.id } },
    },
    include: { siswa: true },
  });

  const guruBudi = await prisma.guru.findFirstOrThrow({ where: { user: { email: "budi@kosgoro.sch.id" } } });
  const guruSarah = await prisma.guru.findFirstOrThrow({ where: { user: { email: "sarah@kosgoro.sch.id" } } });

  console.log("Membuat kegiatan pembelajaran...");
  const akt1 = await prisma.kegiatan.create({
    data: {
      judulPembelajaran: "Dasar Pemrograman Web: HTML & CSS",
      mapelId: mapelPemweb.id,
      guruId: guruBudi.id,
      tanggal: daysFromNow(7),
      waktuMulai: "09:00",
      waktuSelesai: "11:30",
      status: "BELUM_MULAI",
      deskripsi:
        "Belajar struktur dasar halaman web dengan HTML dan styling menggunakan CSS. Dilanjutkan dengan latihan membuat landing page sederhana.",
    },
  });

  await prisma.kegiatan.create({
    data: {
      judulPembelajaran: "Latihan Soal & Strategi Ujian Matematika",
      mapelId: mapelMatematika.id,
      guruId: guruSarah.id,
      tanggal: daysFromNow(-3),
      waktuMulai: "08:30",
      waktuSelesai: "10:00",
      status: "BERLANGSUNG",
      deskripsi:
        "Pembahasan soal-soal ujian semester dan tips mengerjakan soal cerita dengan cepat dan tepat.",
    },
  });

  const akt3 = await prisma.kegiatan.create({
    data: {
      judulPembelajaran: "Jaringan Komputer & Pengenalan IP Addressing",
      mapelId: mapelJarkom.id,
      guruId: guruSarah.id,
      tanggal: daysFromNow(0),
      waktuMulai: "14:00",
      waktuSelesai: "16:00",
      status: "BELUM_MULAI",
      deskripsi:
        "Memahami konsep dasar jaringan, model OSI, kelas IP, subnetting sederhana, dan praktik konfigurasi.",
    },
  });

  console.log("Membuat materi & pendaftaran contoh...");
  await prisma.materi.createMany({
    data: [
      {
        kegiatanId: akt1.id,
        judulMateri: "Slide Presentasi HTML & CSS",
        filePath: "https://www.w3schools.com/html/html_intro.asp",
        tipe: "LINK",
      },
      {
        kegiatanId: akt1.id,
        judulMateri: "Video Tutorial Dasar HTML",
        filePath: "https://www.youtube.com/watch?v=pQN-pnXPaVg",
        tipe: "VIDEO",
      },
      {
        kegiatanId: akt3.id,
        judulMateri: "Materi Jaringan Komputer",
        filePath: "https://www.netacad.com/courses/networking",
        tipe: "LINK",
      },
    ],
  });

  await prisma.pendaftaran.create({
    data: {
      siswaId: siswaBian.siswa!.id,
      kegiatanId: akt3.id,
      statusKehadiran: "HADIR",
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