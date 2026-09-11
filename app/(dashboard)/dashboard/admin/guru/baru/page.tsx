import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { GuruForm } from "@/components/admin/GuruForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Tambah Guru" };

export default async function AdminGuruBaruPage() {
  await requireRole("ADMIN");
  const mapel = await db.mapel.findMany({ orderBy: { namaMapel: "asc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/guru"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Tambah Guru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Guru baru akan langsung bisa login dan membuat kegiatan untuk mapel yang diampu.
        </p>
      </div>

      <GuruForm mapel={mapel.map((m) => ({ id: m.id, namaMapel: m.namaMapel }))} />
    </div>
  );
}