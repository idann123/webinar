import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { addMapel, deleteMapel } from "@/lib/actions/admin";
import { MasterForm } from "@/components/admin/MasterForm";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Data Mapel" };

export default async function AdminMapelPage() {
  await requireRole("ADMIN");
  const mapel = await db.mapel.findMany({
    orderBy: { namaMapel: "asc" },
    include: { _count: { select: { mapelGuru: true, kegiatan: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Data Mata Pelajaran</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola mapel dan penugasan guru pengampu.</p>
      </div>

      <MasterForm
        action={addMapel}
        actionLabel="Tambah Mapel"
        fields={[{ name: "namaMapel", label: "Nama Mapel", type: "text", placeholder: "Contoh: Pemrograman Web" }]}
        />

      {mapel.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada data mapel.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Nama Mapel</th>
                <th className="px-4 py-3">Guru Pengampu</th>
                <th className="px-4 py-3">Jumlah Kegiatan</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mapel.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{m.namaMapel}</td>
                  <td className="px-4 py-3 text-slate-600">{m._count.mapelGuru} guru</td>
                  <td className="px-4 py-3 text-slate-600">{m._count.kegiatan} kegiatan</td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmForm
                      action={deleteMapel}
                      message={`Hapus mapel "${m.namaMapel}"? Penugasan guru ikut terhapus.`}
                    >
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Hapus mapel">
                        <Icon name="delete" className="text-xl" />
                      </button>
                    </ConfirmForm>
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