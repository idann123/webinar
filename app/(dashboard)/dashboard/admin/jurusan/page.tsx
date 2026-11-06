import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { addJurusan, deleteJurusan } from "@/lib/actions/admin";
import { MasterForm } from "@/components/admin/MasterForm";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Data Jurusan" };

export default async function AdminJurusanPage() {
  await requireRole("ADMIN");
  const jurusan = await db.jurusan.findMany({
    orderBy: { namaJurusan: "asc" },
    include: { _count: { select: { kelas: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Data Jurusan</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola jurusan untuk pengelompokan kelas.</p>
      </div>

      <MasterForm
        action={addJurusan}
        actionLabel="Tambah Jurusan"
        fields={[{ name: "namaJurusan", label: "Nama Jurusan", type: "text", placeholder: "Contoh: RPL" }]}
      />

      {jurusan.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada data jurusan.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Nama Jurusan</th>
                <th className="px-4 py-3">Jumlah Kelas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jurusan.map((j) => (
                <tr key={j.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{j.namaJurusan}</td>
                  <td className="px-4 py-3 text-slate-600">{j._count.kelas} kelas</td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmForm
                      action={deleteJurusan}
                      message={`Hapus jurusan "${j.namaJurusan}"? Semua kelas di dalamnya juga terhapus.`}
                    >
                      <input type="hidden" name="id" value={j.id} />
                      <button type="submit" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Hapus jurusan">
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