import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggal } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Ringkasan Siswa" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;
const BTN_OUTLINE = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3 text-sm font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[2px_2px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

const CSS = `
.rec-dot { animation: rec 1.4s ease-in-out infinite; }
@keyframes rec { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .rec-dot { animation: none !important; } }
`;

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
    { label: "Total kegiatan", value: totalKegiatan, icon: "event_available", bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Belum mulai", value: belumMulai, icon: "schedule", bg: "#FFE08A", fg: "#8A5A00" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", bg: "#CDF3DD", fg: "#12823F" },
    { label: "Selesai", value: selesai, icon: "check_circle", bg: "#E6DCFF", fg: "#6D35D6" },
    { label: "Yang saya ikuti", value: diikuti, icon: "how_to_reg", bg: "#FFD6DE", fg: "#C0264A" },
  ];

  const tanggalHariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <style>{CSS}</style>

      {/* Sapaan */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#0F1B3D]/60">{tanggalHariIni}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
            Halo, {session.nama.split(" ")[0]}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-white px-3 py-1 text-xs font-bold text-[#0F1B3D]">
            <Icon name="groups" className="text-sm text-[#1E78E6]" filled />
            {siswa.kelas.namaKelas}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-[#FFE08A] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
            <Icon name="account_tree" className="text-sm" filled />
            {siswa.kelas.jurusan.namaJurusan}
          </span>
        </div>
      </header>

      {/* Statistik ringkas */}
      <section aria-label="Statistik kegiatan">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`${CARD} flex items-center gap-3 p-3.5 last:col-span-2 sm:last:col-span-1`}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                style={{ backgroundColor: s.bg, color: s.fg }}
              >
                <Icon name={s.icon} className="text-xl" filled />
              </span>
              <div className="min-w-0">
                <dd className="font-display text-2xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                  {s.value}
                </dd>
                <dt className="mt-1 truncate text-xs font-semibold text-[#0F1B3D]/65">{s.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="space-y-6 lg:col-span-2">
          {/* Kegiatan terdekat */}
          <section aria-labelledby="terdekat" className={`${CARD} p-5 sm:p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="terdekat" className="font-display text-lg font-extrabold text-[#0F1B3D]">
                Kegiatan terdekat
              </h2>
              {terdekat?.status === "BERLANGSUNG" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5372E] px-2.5 py-1 text-[11px] font-bold text-white">
                  <span className="rec-dot h-1.5 w-1.5 rounded-full bg-white" />
                  LIVE
                </span>
              )}
            </div>

            {terdekat ? (
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div
                  className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
                  aria-hidden="true"
                >
                  <span className="text-sm font-bold">
                    {terdekat.tanggal.toLocaleDateString("id-ID", { month: "short" })}
                  </span>
                  <span className="font-display text-4xl font-extrabold leading-none">
                    {terdekat.tanggal.getDate()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                    {terdekat.mapel.namaMapel}
                  </span>
                  <p className="mt-2 font-display text-xl font-extrabold leading-snug text-[#0F1B3D]">
                    {terdekat.judulPembelajaran}
                  </p>
                  <p className="mt-1 text-sm text-[#0F1B3D]/65">
                    {terdekat.guru.user.nama} · {formatTanggal(terdekat.tanggal)}
                  </p>
                </div>

                <Link
                  href={`/dashboard/siswa/kegiatan/${terdekat.id}`}
                  className={`${BTN_PRIMARY} w-full sm:w-auto`}
                >
                  Lihat detail
                </Link>
              </div>
            ) : (
              <div className="mt-5 flex flex-col items-center rounded-xl border-2 border-dashed border-[#0F1B3D]/30 bg-[#F2F9FF] px-6 py-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
                  <Icon name="event_available" className="text-2xl" filled />
                </span>
                <p className="mt-4 text-sm font-bold text-[#0F1B3D]">Belum ada kegiatan mendatang</p>
                <p className="mt-1 text-sm text-[#0F1B3D]/65">
                  Kegiatan baru dari guru akan muncul di sini.
                </p>
              </div>
            )}
          </section>

          {/* Sedang berlangsung */}
          {daftarBerlangsung.length > 0 && (
            <section aria-labelledby="berlangsung" className={`${CARD} p-5 sm:p-6`}>
              <div className="flex items-center justify-between gap-3">
                <h2 id="berlangsung" className="font-display text-lg font-extrabold text-[#0F1B3D]">
                  Sedang berlangsung
                </h2>
                <Link
                  href="/dashboard/siswa/kegiatan"
                  className={`rounded-lg text-sm font-bold text-[#1E5FD8] underline-offset-4 hover:underline ${FOCUS}`}
                >
                  Lihat semua
                </Link>
              </div>

              <ul className="mt-3">
                {daftarBerlangsung.map((k, i) => (
                  <li key={k.id} className={i > 0 ? "border-t border-[#0F1B3D]/15" : ""}>
                    <Link
                      href={`/dashboard/siswa/kegiatan/${k.id}`}
                      className={`-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-[#CFE7FF]/50 ${FOCUS}`}
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#CDF3DD] text-[#12823F]">
                        <Icon name="play_circle" className="text-xl" filled />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#0F1B3D]">
                          {k.judulPembelajaran}
                        </p>
                        <p className="truncate text-xs text-[#0F1B3D]/60">
                          {k.mapel.namaMapel} · {k.guru.user.nama}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0F1B3D]/70">
                        {formatTanggal(k.tanggal)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Kolom samping */}
        <aside className="space-y-6">
          <section aria-labelledby="partisipasi" className={`${CARD} p-5 sm:p-6`}>
            <h2 id="partisipasi" className="font-display text-lg font-extrabold text-[#0F1B3D]">
              Partisipasi saya
            </h2>
            <p className="mt-3 font-display text-4xl font-extrabold tabular-nums text-[#0F1B3D]">
              {diikuti}
              <span className="text-lg font-bold text-[#0F1B3D]/40"> / {totalKegiatan}</span>
            </p>
            <p className="text-sm text-[#0F1B3D]/65">kegiatan sudah Anda ikuti</p>

            <div className="mt-4 flex items-center gap-3">
              <div
                role="progressbar"
                aria-valuenow={persenDiikuti}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Persentase kegiatan yang diikuti"
                className="h-4 flex-1 overflow-hidden rounded-full border-2 border-[#0F1B3D] bg-[#F2F9FF]"
              >
                <div
                  className={`h-full bg-[#FFC83D] ${persenDiikuti > 0 && persenDiikuti < 100 ? "border-r-2 border-[#0F1B3D]" : ""}`}
                  style={{ width: `${persenDiikuti}%` }}
                />
              </div>
              <span className="text-sm font-extrabold tabular-nums text-[#0F1B3D]">{persenDiikuti}%</span>
            </div>
          </section>

          <section aria-labelledby="aksi" className={`${CARD} p-5 sm:p-6`}>
            <h2 id="aksi" className="font-display text-lg font-extrabold text-[#0F1B3D]">
              Aksi cepat
            </h2>
            <div className="mt-4 space-y-3">
              <Link href="/dashboard/siswa/kegiatan" className={`${BTN_PRIMARY} w-full`}>
                <Icon name="event_available" className="text-lg" />
                Jelajahi kegiatan
              </Link>
              <Link href="/dashboard/siswa/riwayat" className={`${BTN_OUTLINE} w-full`}>
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