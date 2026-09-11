import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { addKelas, deleteKelas } from "@/lib/actions/admin";
import { MasterForm } from "@/components/admin/MasterForm";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Data Kelas" };

export default async function AdminKelasPage() {
  await requireRole("ADMIN");
  const [jurusan, kelas] = await Promise.all([
    db.jurusan.findMany({ orderBy: { namaJurusan: "asc" } }),
    db.kelas.findMany({
      orderBy: [{ jurusan: { namaJurusan: "asc" } }, { namaKelas: "asc" }],
      include: { jurusan: true, _count: { select: { siswa: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Data Kelas</h1>
        <p className="mt-1 text-sm text-slate-500">Tambahkan kelas untuk tiap jurusan.</p>
      </div>

      <MasterForm
        action={addKelas}
        actionLabel="Tambah Kelas"
        fields={[
          { name: "namaKelas", label: "Nama Kelas", type: "text", placeholder: "Contoh: XI RPL 1" },
          {
            name: "jurusanId",
            label: "Jurusan",
            type: "select",
            options: jurusan.map((j) => ({ value: String(j.id), label: j.namaJurusan })),
          },
        ]}
      />

      {kelas.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada data kelas.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Nama Kelas</th>
                <th className="px-4 py-3">Jurusan</th>
                <th className="px-4 py-3">Jumlah Siswa</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kelas.map((k) => (
                <tr key={k.id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{k.namaKelas}</td>
                  <td className="px-4 py-3 text-slate-600">{k.jurusan.namaJurusan}</td>
                  <td className="px-4 py-3 text-slate-600">{k._count.siswa} siswa</td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmForm
                      action={deleteKelas}
                      message={`Hapus kelas "${k.namaKelas}"? Data siswa di kelas ini juga terhapus.`}
                    >
                      <input type="hidden" name="id" value={k.id} />
                      <button type="submit" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Hapus kelas">
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