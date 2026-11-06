import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { KegiatanForm } from "@/components/guru/KegiatanForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Buat Kegiatan" };

export default async function GuruKegiatanBaruPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({
    where: { userId: session.userId },
    include: { mapelGuru: true },
  });

  const mapel = await db.mapel.findMany({
    where: { id: { in: guru.mapelGuru.map((m) => m.mapelId) } },
    orderBy: { namaMapel: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/guru/kegiatan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Buat Kegiatan Baru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Isi judul, pilih mapel yang Anda ampu, lalu tentukan jadwal pelaksanaannya.
        </p>
      </div>

      <KegiatanForm mapel={mapel.map((m) => ({ id: m.id, namaMapel: m.namaMapel }))} backHref="/dashboard/guru/kegiatan" />
    </div>
  );
}