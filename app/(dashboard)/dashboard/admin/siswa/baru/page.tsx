import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { SiswaForm } from "@/components/admin/SiswaForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Tambah Siswa" };

export default async function AdminSiswaBaruPage() {
  await requireRole("ADMIN");
  const kelas = await db.kelas.findMany({
    orderBy: [{ jurusan: { namaJurusan: "asc" } }, { namaKelas: "asc" }],
    include: { jurusan: true },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/siswa"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Tambah Siswa</h1>
        <p className="mt-1 text-sm text-slate-500">
          Siswa baru akan langsung bisa login dan mengikuti kegiatan sesuai kelasnya.
        </p>
      </div>

      <SiswaForm
        kelas={kelas.map((k) => ({
          id: k.id,
          namaKelas: k.namaKelas,
          namaJurusan: k.jurusan.namaJurusan,
        }))}
        backHref="/dashboard/admin/siswa"
      />
    </div>
  );
}
