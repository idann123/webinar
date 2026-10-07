import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { ProfilForm } from "@/components/siswa/ProfilForm";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Profil Siswa" };

export default async function SiswaProfilPage() {
  const session = await requireRole("SISWA");

  const siswa = await db.siswa.findFirstOrThrow({
    where: { userId: session.userId },
    include: {
      user: true,
      kelas: { include: { jurusan: true } },
      pendaftaran: {
        include: {
          kegiatan: { include: { mapel: true } },
        },
      },
    },
  });

  const totalDiikuti = siswa.pendaftaran.length;
  const totalHadir = siswa.pendaftaran.filter((p) => p.statusKehadiran === "HADIR").length;
  const totalTidakHadir = totalDiikuti - totalHadir;
  const persentaseHadir = totalDiikuti > 0 ? Math.round((totalHadir / totalDiikuti) * 100) : 0;

  const idSiswa = `SISWA-${siswa.id.toString().padStart(4, "0")}`;

  // Data ditampilkan sekali saja di kartu informasi (tanpa duplikasi dengan header)
  const infoRows: { label: string; value: string; mono?: boolean }[] = [
    { label: "ID Siswa", value: idSiswa, mono: true },
    { label: "Email", value: siswa.user.email },
    { label: "Kelas", value: siswa.kelas.namaKelas },
    { label: "Jurusan", value: siswa.kelas.jurusan.namaJurusan },
    { label: "Terdaftar sejak", value: formatTanggal(siswa.user.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Judul halaman */}
      <header>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Profil saya</h1>
        <p className="mt-1 max-w-prose text-sm text-slate-500">
          Lihat data akademik dan ringkasan kehadiran Anda, lalu atur keamanan akun.
        </p>
      </header>

      {/* Kartu identitas */}
      <section aria-labelledby="identitas" className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-700 to-brand-600 sm:h-28" aria-hidden="true" />

        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <span
              aria-hidden="true"
              className="-mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-brand-50 font-display text-3xl font-extrabold text-brand-700 shadow-md sm:-mt-12 sm:h-24 sm:w-24 sm:text-4xl"
            >
              {siswa.user.nama.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 sm:pt-4">
              <h2
                id="identitas"
                className="break-words font-display text-xl font-bold text-slate-900 sm:text-2xl"
              >
                {siswa.user.nama}
              </h2>
              <p className="mt-0.5 break-all text-sm text-slate-500">{siswa.user.email}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge border-brand-200 bg-brand-50 text-brand-700">Siswa</span>
                <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                  {siswa.kelas.namaKelas}
                </span>
                <span className="badge border-slate-200 bg-slate-50 text-slate-700">
                  {siswa.kelas.jurusan.namaJurusan}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  Akun aktif
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ringkasan kehadiran: satu blok, bukan empat kotak yang sama */}
      <section aria-labelledby="kehadiran" className="card p-5 sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="kehadiran" className="font-display text-base font-bold text-slate-900">
            Ringkasan kehadiran
          </h2>
          <p className="text-sm text-slate-500">
            {totalDiikuti > 0
              ? `Dari ${totalDiikuti} kegiatan yang Anda ikuti`
              : "Belum ada kegiatan yang diikuti"}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <p className="font-display text-4xl font-extrabold text-brand-700">
            {persentaseHadir}
            <span className="text-2xl">%</span>
          </p>
          <p className="pb-1 text-sm text-slate-500">tingkat kehadiran</p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={persentaseHadir}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Persentase kehadiran"
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-brand-600"
            style={{ width: `${persentaseHadir}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <dt className="text-xs text-slate-500">Diikuti</dt>
            <dd className="mt-1 font-display text-lg font-bold text-slate-900">{totalDiikuti}</dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-slate-500">Hadir</dt>
            <dd className="mt-1 font-display text-lg font-bold text-emerald-700">{totalHadir}</dd>
          </div>
          <div className="px-2">
            <dt className="text-xs text-slate-500">Belum / tidak hadir</dt>
            <dd className="mt-1 font-display text-lg font-bold text-slate-900">
              {totalTidakHadir}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        {/* Informasi siswa */}
        <section aria-labelledby="info" className="card p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon name="badge" className="text-xl" />
            </span>
            <h2 id="info" className="font-display text-base font-bold text-slate-900">
              Data siswa
            </h2>
          </div>

          <dl className="mt-4 divide-y divide-slate-100 text-sm">
            {infoRows.map((row) => (
              <div key={row.label} className="py-3">
                <dt className="text-xs text-slate-500">{row.label}</dt>
                <dd
                  className={`mt-0.5 break-words font-semibold text-slate-800 ${
                    row.mono ? "font-mono" : ""
                  }`}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Keamanan akun */}
        <section aria-labelledby="keamanan" className="card p-5 sm:p-6 lg:col-span-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon name="security" className="text-xl" />
            </span>
            <div>
              <h2 id="keamanan" className="font-display text-base font-bold text-slate-900">
                Ganti kata sandi
              </h2>
              <p className="text-xs text-slate-500">
                Gunakan kata sandi yang sulit ditebak dan tidak dipakai di akun lain.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <ProfilForm />
          </div>
        </section>
      </div>
    </div>
  );
}