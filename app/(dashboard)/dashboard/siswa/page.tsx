import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggal } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Ringkasan Siswa" };

export default async function SiswaDashboardPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({
    where: { userId: session.userId },
    include: { kelas: { include: { jurusan: true } } },
  });

  await syncKegiatanStatuses();

  const [totalKegiatan, belumMulai, berlangsung, selesai, diikuti] = await Promise.all([
    db.kegiatan.count(),
    db.kegiatan.count({ where: { status: "BELUM_MULAI" } }),
    db.kegiatan.count({ where: { status: "BERLANGSUNG" } }),
    db.kegiatan.count({ where: { status: "SELESAI" } }),
    db.pendaftaran.count({ where: { siswaId: siswa.id } }),
  ]);

  const [terdekat, sedangBerlangsung] = await Promise.all([
    db.kegiatan.findFirst({
      where: { status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } },
      orderBy: { tanggal: "asc" },
      include: { mapel: true, guru: { include: { user: true } } },
    }),
    db.kegiatan.findMany({
      where: { status: "BERLANGSUNG" },
      orderBy: { tanggal: "asc" },
      take: 4,
      include: { mapel: true, guru: { include: { user: true } } },
    }),
  ]);

  // Kegiatan terdekat sudah tampil di kartu utama, jadi tidak diulang di daftar
  const daftarBerlangsung = sedangBerlangsung.filter((k) => k.id !== terdekat?.id).slice(0, 3);

  const persenDiikuti = totalKegiatan > 0 ? Math.round((diikuti / totalKegiatan) * 100) : 0;

  const stats = [
    { label: "Total kegiatan", value: totalKegiatan, icon: "event_available", color: "bg-brand-100 text-brand-700" },
    { label: "Belum mulai", value: belumMulai, icon: "schedule", color: "bg-sky-100 text-sky-700" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", color: "bg-emerald-100 text-emerald-700" },
    { label: "Selesai", value: selesai, icon: "check_circle", color: "bg-slate-100 text-slate-600" },
    { label: "Yang saya ikuti", value: diikuti, icon: "how_to_reg", color: "bg-amber-100 text-amber-700" },
  ];

  const tanggalHariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Sapaan */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{tanggalHariIni}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Halo, {session.nama.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge border-slate-200 bg-white text-slate-700">{siswa.kelas.namaKelas}</span>
          <span className="badge border-slate-200 bg-white text-slate-700">
            {siswa.kelas.jurusan.namaJurusan}
          </span>
        </div>
      </header>

      {/* Statistik ringkas */}
      <section aria-label="Statistik kegiatan">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="card flex items-center gap-3 p-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                <Icon name={s.icon} className="text-xl" filled />
              </span>
              <div className="min-w-0">
                <dd className="font-display text-xl font-extrabold leading-none text-slate-900">
                  {s.value}
                </dd>
                <dt className="mt-1 text-xs font-medium text-slate-500">{s.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="space-y-6 lg:col-span-2">
          {/* Kegiatan terdekat */}
          <section aria-labelledby="terdekat" className="card p-5 sm:p-6">
            <h2 id="terdekat" className="font-display text-base font-bold text-slate-900">
              Kegiatan terdekat
            </h2>

            {terdekat ? (
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700"
                  aria-hidden="true"
                >
                  <span className="text-xs font-semibold">
                    {terdekat.tanggal.toLocaleDateString("id-ID", { month: "short" })}
                  </span>
                  <span className="font-display text-3xl font-extrabold leading-none">
                    {terdekat.tanggal.getDate()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="badge border-brand-200 bg-brand-50 text-brand-700">
                    {terdekat.mapel.namaMapel}
                  </span>
                  <p className="mt-2 font-display text-lg font-bold leading-snug text-slate-900">
                    {terdekat.judulPembelajaran}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {terdekat.guru.user.nama} · {formatTanggal(terdekat.tanggal)}
                  </p>
                </div>

                <Link
                  href={`/dashboard/siswa/kegiatan/${terdekat.id}`}
                  className="btn-primary w-full sm:w-auto"
                >
                  Lihat detail
                </Link>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-700">Belum ada kegiatan mendatang</p>
                <p className="mt-1 text-sm text-slate-500">
                  Kegiatan baru dari guru akan muncul di sini.
                </p>
              </div>
            )}
          </section>

          {/* Sedang berlangsung */}
          {daftarBerlangsung.length > 0 && (
            <section aria-labelledby="berlangsung" className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 id="berlangsung" className="font-display text-base font-bold text-slate-900">
                  Sedang berlangsung
                </h2>
                <Link
                  href="/dashboard/siswa/kegiatan"
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  Lihat semua
                </Link>
              </div>

              <ul className="mt-3 divide-y divide-slate-100">
                {daftarBerlangsung.map((k) => (
                  <li key={k.id}>
                    <Link
                      href={`/dashboard/siswa/kegiatan/${k.id}`}
                      className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Icon name="play_circle" className="text-xl" filled />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {k.judulPembelajaran}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {k.mapel.namaMapel} · {k.guru.user.nama}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">{formatTanggal(k.tanggal)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Kolom samping */}
        <aside className="space-y-6">
          <section aria-labelledby="partisipasi" className="card p-5 sm:p-6">
            <h2 id="partisipasi" className="font-display text-base font-bold text-slate-900">
              Partisipasi saya
            </h2>
            <p className="mt-3 font-display text-3xl font-extrabold text-brand-700">
              {diikuti}
              <span className="text-base font-semibold text-slate-400"> / {totalKegiatan}</span>
            </p>
            <p className="text-sm text-slate-500">kegiatan sudah Anda ikuti</p>

            <div
              role="progressbar"
              aria-valuenow={persenDiikuti}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Persentase kegiatan yang diikuti"
              className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"
            >
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${persenDiikuti}%` }} />
            </div>
          </section>

          <section aria-labelledby="aksi" className="card p-5 sm:p-6">
            <h2 id="aksi" className="font-display text-base font-bold text-slate-900">
              Aksi cepat
            </h2>
            <div className="mt-4 space-y-2.5">
              <Link href="/dashboard/siswa/kegiatan" className="btn-primary w-full">
                <Icon name="event_available" className="text-lg" />
                Jelajahi kegiatan
              </Link>
              <Link href="/dashboard/siswa/riwayat" className="btn-outline w-full">
                <Icon name="history" className="text-lg" />
                Lihat riwayat belajar
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}