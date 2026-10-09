import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { GuruForm } from "@/components/admin/GuruForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit Guru" };

export default async function AdminGuruEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const guruId = Number(id);
  if (!guruId) notFound();

  const [guru, mapel] = await Promise.all([
    db.guru.findUnique({
      where: { id: guruId },
      include: { user: true, mapelGuru: true },
    }),
    db.mapel.findMany({ orderBy: { namaMapel: "asc" } }),
  ]);
  if (!guru) notFound();

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
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Edit Guru</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui data akun, jabatan, foto, dan mata pelajaran yang diampu.
        </p>
      </div>

      <GuruForm
        guruId={guruId}
        mapel={mapel.map((m) => ({ id: m.id, namaMapel: m.namaMapel }))}
        backHref="/dashboard/admin/guru"
        initial={{
          nama: guru.user.nama,
          nip: guru.nip,
          email: guru.user.email,
          jabatan: guru.jabatan ?? "",
          foto: guru.foto ?? "",
          mapelIds: guru.mapelGuru.map((m) => m.mapelId),
        }}
      />
    </div>
  );
}
