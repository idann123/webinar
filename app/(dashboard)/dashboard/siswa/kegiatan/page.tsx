import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { toKegiatanCardData } from "@/lib/mappers";
import { SiswaKegiatanList } from "@/components/siswa/SiswaKegiatanList";

export const metadata = { title: "Kegiatan Siswa" };

export default async function SiswaKegiatanPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  const kegiatan = await db.kegiatan.findMany({
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    include: {
      mapel: true,
      guru: { include: { user: true } },
      pendaftaran: { where: { siswaId: siswa.id } },
    },
  });

  const items = kegiatan.map((k) => ({
    kegiatan: toKegiatanCardData(k),
    registered: k.pendaftaran.length > 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Kegiatan Pembelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">
          Daftar kegiatan, filter berdasarkan status, dan cari kegiatan favoritmu.
        </p>
      </div>
      <SiswaKegiatanList items={items} />
    </div>
  );
}