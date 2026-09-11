import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { deleteGuru, resetUserPassword, toggleUserStatus } from "@/lib/actions/admin";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kelola Guru" };

export default async function AdminGuruPage() {
  await requireRole("ADMIN");
  const guru = await db.guru.findMany({
    orderBy: { user: { nama: "asc" } },
    include: {
      user: true,
      mapelGuru: { include: { mapel: true } },
      _count: { select: { kegiatan: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Kelola Guru</h1>
          <p className="mt-1 text-sm text-slate-500">
            {guru.length} guru terdaftar. Aktifkan/nonaktifkan akun, reset password, atau hapus.
          </p>
        </div>
        <Link href="/dashboard/admin/guru/baru" className="btn-primary">
          <Icon name="person_add" className="text-xl" />
          Tambah Guru
        </Link>
      </div>

      {guru.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada guru terdaftar.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Nama & NIP</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mapel Diampu</th>
                <th className="px-4 py-3">Kegiatan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guru.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{g.user.nama}</p>
                    <p className="text-xs text-slate-500">{g.nip}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{g.user.email}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {g.mapelGuru.map((m) => m.mapel.namaMapel).join(", ")}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{g._count.kegiatan}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        g.user.status === "AKTIF"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      <Icon name="circle" className="text-[8px]" filled />
                      {g.user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <ConfirmForm
                        action={toggleUserStatus}
                        message={
                          g.user.status === "AKTIF"
                            ? `Nonaktifkan akun ${g.user.nama}?`
                            : `Aktifkan kembali akun ${g.user.nama}?`
                        }
                      >
                        <input type="hidden" name="id" value={g.user.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={g.user.status === "AKTIF" ? "NONAKTIF" : "AKTIF"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Ubah status"
                        >
                          <Icon name={g.user.status === "AKTIF" ? "block" : "lock_open"} className="text-xl" />
                        </button>
                      </ConfirmForm>
                      <ConfirmForm
                        action={resetUserPassword}
                        message={`Reset password menjadi "kosgoro123" untuk ${g.user.nama}?`}
                      >
                        <input type="hidden" name="id" value={g.user.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Reset password"
                        >
                          <Icon name="key" className="text-xl" />
                        </button>
                      </ConfirmForm>
                      <ConfirmForm
                        action={deleteGuru}
                        message={`Hapus akun guru ${g.user.nama}? Semua kegiatannya ikut terhapus.`}
                      >
                        <input type="hidden" name="id" value={g.user.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Hapus guru"
                        >
                          <Icon name="delete" className="text-xl" />
                        </button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}