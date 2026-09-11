import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { toKegiatanCardData } from "@/lib/mappers";
import { KegiatanCard } from "@/components/KegiatanCard";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Riwayat Belajar" };

export default async function SiswaRiwayatPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  const riwayat = await db.pendaftaran.findMany({
    where: { siswaId: siswa.id },
    orderBy: { tanggalDaftar: "desc" },
    include: {
      kegiatan: {
        include: { mapel: true, guru: { include: { user: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Riwayat Belajar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Semua kegiatan yang pernah Anda ikuti beserta status kehadirannya.
        </p>
      </div>

      {riwayat.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Icon name="history_toggle_off" className="text-4xl text-slate-300" />
          <p className="font-medium text-slate-600">Anda belum mengikuti kegiatan apa pun.</p>
          <Link href="/dashboard/siswa/kegiatan" className="btn-primary">
            Jelajahi Kegiatan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {riwayat.map((r) => (
            <div key={r.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon name="history" className="text-2xl" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display font-bold text-slate-900">
                    {r.kegiatan.judulPembelajaran}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.kegiatan.mapel.namaMapel} • Daftar {formatTanggal(r.tanggalDaftar)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={r.kegiatan.status} />
                    {r.statusKehadiran && (
                      <span className="badge border-amber-200 bg-amber-50 text-amber-700">
                        {r.statusKehadiran === "HADIR" ? "Hadir" : "Tidak Hadir"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/siswa/kegiatan/${r.kegiatan.id}`}
                className="btn-outline shrink-0"
              >
                Buka Kegiatan
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}