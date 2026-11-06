import { db } from "@/lib/db";
import { getWaktuMulai } from "@/lib/kegiatan-status";
import { formatTanggal } from "@/lib/utils";

export const MENIT_PENGINGAT_MULAI = 60;

export async function kirimNotifikasiKegiatanBaru(kegiatanId: number) {
  const kegiatan = await db.kegiatan.findUnique({
    where: { id: kegiatanId },
    include: { mapel: true },
  });
  if (!kegiatan) return;

  const siswa = await db.user.findMany({
    where: { role: "SISWA", status: "AKTIF" },
    select: { id: true },
  });
  if (siswa.length === 0) return;

  await db.notifikasi.createMany({
    data: siswa.map((s) => ({
      userId: s.id,
      kegiatanId: kegiatan.id,
      tipe: "KEGIATAN_BARU" as const,
      judul: "Kegiatan baru tersedia",
      pesan: `${kegiatan.judulPembelajaran} (${kegiatan.mapel.namaMapel}) pada ${formatTanggal(kegiatan.tanggal)} pukul ${kegiatan.waktuMulai} WIB.`,
      href: `/dashboard/siswa/kegiatan/${kegiatan.id}`,
    })),
    skipDuplicates: true,
  });
}

export async function sinkronNotifikasiSiswa(userId: number) {
  const siswa = await db.siswa.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!siswa) return;

  const now = new Date();
  const batas = new Date(now.getTime() + MENIT_PENGINGAT_MULAI * 60 * 1000);

  const pendaftaran = await db.pendaftaran.findMany({
    where: {
      siswaId: siswa.id,
      kegiatan: { status: "BELUM_MULAI" },
    },
    include: {
      kegiatan: { include: { mapel: true } },
    },
  });

  const data = pendaftaran.flatMap(({ kegiatan }) => {
    const mulai = getWaktuMulai(kegiatan.tanggal, kegiatan.waktuMulai);
    if (mulai <= now || mulai > batas) return [];

    const sisaMenit = Math.max(
      1,
      Math.ceil((mulai.getTime() - now.getTime()) / 60000)
    );

    return [
      {
        userId,
        kegiatanId: kegiatan.id,
        tipe: "AKAN_MULAI" as const,
        judul: "Kegiatan akan segera dimulai",
        pesan: `${kegiatan.judulPembelajaran} (${kegiatan.mapel.namaMapel}) dimulai dalam ${sisaMenit} menit, pukul ${kegiatan.waktuMulai} WIB.`,
        href: `/dashboard/siswa/kegiatan/${kegiatan.id}`,
      },
    ];
  });

  if (data.length > 0) {
    await db.notifikasi.createMany({ data, skipDuplicates: true });
  }
}
