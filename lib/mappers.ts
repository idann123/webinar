import type { KegiatanCardData } from "@/components/KegiatanCard";

type KegiatanRow = {
  id: number;
  judulPembelajaran: string;
  tanggal: Date;
  waktuMulai: string;
  waktuSelesai: string;
  status: string;
  jumlahSiswaDaftar: number;
  deskripsi: string | null;
  mapel: { namaMapel: string };
  guru: { user: { nama: string } };
};

export function toKegiatanCardData(k: KegiatanRow): KegiatanCardData {
  return {
    id: k.id,
    judulPembelajaran: k.judulPembelajaran,
    mapel: k.mapel.namaMapel,
    guru: k.guru.user.nama,
    tanggal: k.tanggal,
    waktuMulai: k.waktuMulai,
    waktuSelesai: k.waktuSelesai,
    status: k.status,
    jumlahSiswaDaftar: k.jumlahSiswaDaftar,
    deskripsi: k.deskripsi,
  };
}