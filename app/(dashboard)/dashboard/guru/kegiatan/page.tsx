import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { KegiatanCardGuru } from "@/components/guru/KegiatanCardGuru";
import { inferKegiatanCoverUrl } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Kegiatan Saya" };

export default async function GuruKegiatanPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({ where: { userId: session.userId } });

  await syncKegiatanStatuses();

  const kegiatan = await db.kegiatan.findMany({
    where: { guruId: guru.id },
    orderBy: { tanggal: "desc" },
    include: {
      mapel: true,
      materi: { select: { tipe: true, filePath: true } },
      _count: { select: { materi: true, pendaftaran: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Kegiatan Saya</h1>
          <p className="mt-1 text-sm text-slate-500">
            {kegiatan.length} kegiatan pembelajaran yang Anda buat.
          </p>
        </div>
        <Link href="/dashboard/guru/kegiatan/baru" className="btn-primary">
          <Icon name="add_circle" className="text-xl" />
          Buat Kegiatan Baru
        </Link>
      </div>

      {kegiatan.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Icon name="event_busy" className="text-4xl text-slate-300" />
          <p className="font-medium text-slate-600">Anda belum membuat kegiatan apa pun.</p>
          <Link href="/dashboard/guru/kegiatan/baru" className="btn-primary">
            Buat Kegiatan Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {kegiatan.map((k) => (
            <KegiatanCardGuru
              key={k.id}
              id={k.id}
              judulPembelajaran={k.judulPembelajaran}
              mapel={k.mapel.namaMapel}
              tanggal={k.tanggal}
              waktuMulai={k.waktuMulai}
              waktuSelesai={k.waktuSelesai}
              status={k.status}
              jumlahPeserta={k._count.pendaftaran}
              jumlahMateri={k._count.materi}
              coverUrl={k.coverUrl ?? inferKegiatanCoverUrl(k.materi)}
            />
          ))}
        </div>
      )}
    </div>
  );
}