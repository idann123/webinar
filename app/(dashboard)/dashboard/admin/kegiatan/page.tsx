import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggalShort } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Pantau Kegiatan" };

export default async function AdminKegiatanPage() {
  await requireRole("ADMIN");
  const kegiatan = await db.kegiatan.findMany({
    orderBy: { tanggal: "desc" },
    include: {
      mapel: true,
      guru: { include: { user: true } },
      _count: { select: { materi: true, pendaftaran: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Pantau Kegiatan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rekap seluruh kegiatan pembelajaran dari semua guru.
        </p>
      </div>

      {kegiatan.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada kegiatan.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Kegiatan</th>
                <th className="px-4 py-3">Guru</th>
                <th className="px-4 py-3">Mapel</th>
                <th className="px-4 py-3">Jadwal</th>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Materi</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kegiatan.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{k.judulPembelajaran}</p>
                    <p className="mt-0.5 line-clamp-1 max-w-[240px] text-xs text-slate-500">
                      {k.deskripsi || "-"}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{k.guru.user.nama}</td>
                  <td className="px-4 py-3.5 text-slate-600">{k.mapel.namaMapel}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {formatTanggalShort(k.tanggal)}
                    <span className="block text-xs text-slate-400">
                      {k.waktuMulai} - {k.waktuSelesai}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{k._count.pendaftaran}</td>
                  <td className="px-4 py-3.5 text-slate-600">{k._count.materi}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={k.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Link href="/dashboard/admin" className="btn-outline">
        <Icon name="arrow_back" className="text-lg" /> Kembali
      </Link>
    </div>
  );
}