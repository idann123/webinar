import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { deleteKegiatan } from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";
import { ConfirmForm } from "@/components/ConfirmForm";
import { StatusToggle } from "@/components/guru/StatusToggle";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggalShort } from "@/lib/utils";

export const metadata = { title: "Kegiatan Saya" };

export default async function GuruKegiatanPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({ where: { userId: session.userId } });

  const kegiatan = await db.kegiatan.findMany({
    where: { guruId: guru.id },
    orderBy: { tanggal: "desc" },
    include: {
      mapel: true,
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
            <div key={k.id} className="card p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={k.status} />
                    <span className="badge border-brand-200 bg-brand-50 text-brand-700">
                      {k.mapel.namaMapel}
                    </span>
                  </div>
                  <Link href={`/dashboard/guru/kegiatan/${k.id}`}>
                    <h3 className="mt-2.5 font-display text-lg font-bold text-slate-900 transition-colors hover:text-brand-700">
                      {k.judulPembelajaran}
                    </h3>
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatTanggalShort(k.tanggal)} • {k.waktuMulai} - {k.waktuSelesai} WIB
                  </p>
                  <p className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="folder_open" className="text-sm" /> {k._count.materi} materi
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="group" className="text-sm" /> {k._count.pendaftaran} peserta
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/guru/kegiatan/${k.id}`} className="btn-outline">
                    <Icon name="edit" className="text-lg" />
                    Kelola
                  </Link>
                  <ConfirmForm action={deleteKegiatan} message={`Hapus kegiatan "${k.judulPembelajaran}"? Semua materinya ikut terhapus.`}>
                    <input type="hidden" name="kegiatanId" value={k.id} />
                    <button type="submit" className="btn-danger">
                      <Icon name="delete" className="text-lg" />
                    </button>
                  </ConfirmForm>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-slate-500">Ubah status kegiatan:</p>
                <StatusToggle kegiatanId={k.id} current={k.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}