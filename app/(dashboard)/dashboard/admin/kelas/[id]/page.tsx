import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { KelasForm } from "@/components/admin/KelasForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit Kelas" };

export default async function AdminKelasEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const kelasId = Number(id);
  if (!kelasId) notFound();

  const [kelas, jurusan] = await Promise.all([
    db.kelas.findUnique({ where: { id: kelasId } }),
    db.jurusan.findMany({ orderBy: { namaJurusan: "asc" } }),
  ]);
  if (!kelas) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/kelas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Edit Kelas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui nama kelas atau pindahkan ke jurusan lain.
        </p>
      </div>

      <KelasForm
        kelasId={kelasId}
        jurusan={jurusan.map((j) => ({ id: j.id, namaJurusan: j.namaJurusan }))}
        backHref="/dashboard/admin/kelas"
        initial={{
          namaKelas: kelas.namaKelas,
          jurusanId: kelas.jurusanId,
        }}
      />
    </div>
  );
}
