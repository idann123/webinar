import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { JurusanForm } from "@/components/admin/JurusanForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit Jurusan" };

export default async function AdminJurusanEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const jurusanId = Number(id);
  if (!jurusanId) notFound();

  const jurusan = await db.jurusan.findUnique({ where: { id: jurusanId } });
  if (!jurusan) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/jurusan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Edit Jurusan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui nama jurusan. Kelas dan siswa di dalamnya tidak berubah.
        </p>
      </div>

      <JurusanForm
        jurusanId={jurusanId}
        backHref="/dashboard/admin/jurusan"
        initial={{ namaJurusan: jurusan.namaJurusan }}
      />
    </div>
  );
}
