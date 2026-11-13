import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { MapelForm } from "@/components/admin/MapelForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Edit Mapel" };

export default async function AdminMapelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const mapelId = Number(id);
  if (!mapelId) notFound();

  const mapel = await db.mapel.findUnique({ where: { id: mapelId } });
  if (!mapel) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/admin/mapel"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Edit Mapel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Perbarui nama mata pelajaran. Penugasan guru dan kegiatan terkait tidak berubah.
        </p>
      </div>

      <MapelForm
        mapelId={mapelId}
        backHref="/dashboard/admin/mapel"
        initial={{ namaMapel: mapel.namaMapel }}
      />
    </div>
  );
}
