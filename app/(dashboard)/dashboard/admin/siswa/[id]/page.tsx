import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { SiswaForm } from "@/components/admin/SiswaForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit Siswa" };

export default async function AdminSiswaEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const siswaId = Number(id);
  if (!siswaId) notFound();

  const [siswa, kelas] = await Promise.all([
    db.siswa.findUnique({
      where: { id: siswaId },
      include: { user: true },
    }),
    db.kelas.findMany({
      orderBy: [{ jurusan: { namaJurusan: "asc" } }, { namaKelas: "asc" }],
      include: { jurusan: true },
    }),
  ]);
  if (!siswa) notFound();

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
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Edit Siswa</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui data akun, kelas, dan password siswa bila diperlukan.
        </p>
      </div>

      <SiswaForm
        siswaId={siswaId}
        kelas={kelas.map((k) => ({
          id: k.id,
          namaKelas: k.namaKelas,
          namaJurusan: k.jurusan.namaJurusan,
        }))}
        backHref="/dashboard/admin/siswa"
        initial={{
          nama: siswa.user.nama,
          email: siswa.user.email,
          kelasId: siswa.kelasId,
        }}
      />
    </div>
  );
}
