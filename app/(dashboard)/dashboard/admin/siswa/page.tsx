import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { deleteSiswa, resetUserPassword, toggleUserStatus } from "@/lib/actions/admin";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export const metadata = { title: "Kelola Siswa" };

export default async function AdminSiswaPage() {
  await requireRole("ADMIN");
  const siswa = await db.siswa.findMany({
    orderBy: { user: { nama: "asc" } },
    include: {
      user: true,
      kelas: { include: { jurusan: true } },
      _count: { select: { pendaftaran: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Kelola Siswa</h1>
        <p className="mt-1 text-sm text-slate-500">
          {siswa.length} siswa terdaftar. Akun siswa dibuat sendiri lewat halaman registrasi.
        </p>
      </div>

      {siswa.length === 0 ? (
        <div className="card p-12 text-center text-sm text-slate-400">Belum ada siswa terdaftar.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Kelas</th>
                <th className="px-4 py-3">Terdaftar Di</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {siswa.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{s.user.nama}</td>
                  <td className="px-4 py-3.5 text-slate-600">{s.user.email}</td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {s.kelas ? `${s.kelas.namaKelas} - ${s.kelas.jurusan.namaJurusan}` : "-"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{s._count.pendaftaran} kegiatan</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                        s.user.status === "AKTIF"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      <Icon name="circle" className="text-[8px]" filled />
                      {s.user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-1">
                      <ConfirmForm
                        action={toggleUserStatus}
                        message={
                          s.user.status === "AKTIF"
                            ? `Nonaktifkan akun ${s.user.nama}?`
                            : `Aktifkan kembali akun ${s.user.nama}?`
                        }
                      >
                        <input type="hidden" name="id" value={s.user.id} />
                        <input
                          type="hidden"
                          name="status"
                          value={s.user.status === "AKTIF" ? "NONAKTIF" : "AKTIF"}
                        />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Ubah status"
                        >
                          <Icon name={s.user.status === "AKTIF" ? "block" : "lock_open"} className="text-xl" />
                        </button>
                      </ConfirmForm>
                      <ConfirmForm
                        action={resetUserPassword}
                        message={`Reset password menjadi "kosgoro123" untuk ${s.user.nama}?`}
                      >
                        <input type="hidden" name="id" value={s.user.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                          aria-label="Reset password"
                        >
                          <Icon name="key" className="text-xl" />
                        </button>
                      </ConfirmForm>
                      <ConfirmForm
                        action={deleteSiswa}
                        message={`Hapus akun siswa ${s.user.nama}?`}
                      >
                        <input type="hidden" name="id" value={s.user.id} />
                        <button
                          type="submit"
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          aria-label="Hapus siswa"
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