import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggalShort } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Ringkasan Guru" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;
const BTN_OUTLINE = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3 text-sm font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[2px_2px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

// Warna chip mapel bergantian, sama seperti kartu kegiatan di beranda
const MAPEL_TONE = ["#FFC83D", "#9BE3BB", "#C6B0FF", "#CFE7FF"] as const;

const CSS = `
.rec-dot { animation: rec 1.4s ease-in-out infinite; }
@keyframes rec { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .rec-dot { animation: none !important; } }
`;

export default async function GuruDashboardPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirst({
    where: { userId: session.userId },
    include: { mapelGuru: { include: { mapel: true } } },
  });
  if (!guru) throw new Error("Data guru tidak ditemukan");

  await syncKegiatanStatuses();

  const [totalKegiatan, belumMulai, berlangsung, selesai, jumlahPendaftar] = await Promise.all([
    db.kegiatan.count({ where: { guruId: guru.id } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "BELUM_MULAI" } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "BERLANGSUNG" } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "SELESAI" } }),
    db.pendaftaran.count({ where: { kegiatan: { guruId: guru.id } } }),
  ]);

  const terdekat = await db.kegiatan.findFirst({
    where: { guruId: guru.id, status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } },
    orderBy: { tanggal: "asc" },
    include: { mapel: true },
  });

  const cards = [
    { label: "Total kegiatan", value: totalKegiatan, icon: "event_available", bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Belum mulai", value: belumMulai, icon: "schedule", bg: "#FFE08A", fg: "#8A5A00" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", bg: "#CDF3DD", fg: "#12823F" },
    { label: "Selesai", value: selesai, icon: "check_circle", bg: "#E6DCFF", fg: "#6D35D6" },
    { label: "Total peserta", value: jumlahPendaftar, icon: "group", bg: "#FFD6DE", fg: "#C0264A" },
  ];

  const tanggalHariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const isBerlangsung = terdekat?.status === "BERLANGSUNG";

  return (
    <div className="space-y-8">
      <style>{CSS}</style>

      {/* Sapaan */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#0F1B3D]/60">{tanggalHariIni}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
            Halo, {session.nama.split(" ")[0]}!
          </h1>
          {guru.mapelGuru.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {guru.mapelGuru.map((m, i) => (
                <span
                  key={m.mapel.id}
                  className="inline-flex rounded-full border-2 border-[#0F1B3D] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]"
                  style={{ backgroundColor: MAPEL_TONE[i % MAPEL_TONE.length] }}
                >
                  {m.mapel.namaMapel}
                </span>
              ))}
            </div>
          )}
        </div>
        <Link href="/dashboard/guru/kegiatan/baru" className={`${BTN_PRIMARY} shrink-0`}>
          <Icon name="add_circle" className="text-xl" />
          Buat kegiatan baru
        </Link>
      </header>

      {/* Statistik ringkas */}
      <section aria-label="Statistik kegiatan">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((c) => (
            <div
              key={c.label}
              className={`${CARD} flex items-center gap-3 p-3.5 last:col-span-2 sm:last:col-span-1`}
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                style={{ backgroundColor: c.bg, color: c.fg }}
              >
                <Icon name={c.icon} className="text-xl" filled />
              </span>
              <div className="min-w-0">
                <dd className="font-display text-2xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                  {c.value}
                </dd>
                <dt className="mt-1 truncate text-xs font-semibold text-[#0F1B3D]/65">{c.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Kegiatan terdekat */}
        <section aria-labelledby="terdekat" className={`${CARD} p-5 sm:p-6 lg:col-span-2`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="terdekat" className="font-display text-lg font-extrabold text-[#0F1B3D]">
              Kegiatan terdekat
            </h2>
            {isBerlangsung && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5372E] px-2.5 py-1 text-[11px] font-bold text-white">
                <span className="rec-dot h-1.5 w-1.5 rounded-full bg-white" />
                LIVE
              </span>
            )}
          </div>

          {terdekat ? (
            <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div
                className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-[#0F1B3D] text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] ${
                  isBerlangsung ? "bg-[#CDF3DD]" : "bg-[#FFC83D]"
                }`}
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                    {terdekat.mapel.namaMapel}
                  </span>
                  <StatusBadge status={terdekat.status} />
                </div>
                <p className="mt-2 font-display text-xl font-extrabold leading-snug text-[#0F1B3D]">
                  {terdekat.judulPembelajaran}
                </p>
                <p className="mt-1 text-sm text-[#0F1B3D]/65">
                  {formatTanggalShort(terdekat.tanggal)}, {terdekat.waktuMulai} WIB
                </p>
              </div>

              <Link
                href={`/dashboard/guru/kegiatan/${terdekat.id}`}
                className={`${BTN_PRIMARY} w-full sm:w-auto`}
              >
                Kelola kegiatan ini
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center rounded-xl border-2 border-dashed border-[#0F1B3D]/30 bg-[#F2F9FF] px-6 py-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
                <Icon name="event_busy" className="text-2xl" filled />
              </span>
              <p className="mt-4 text-sm font-bold text-[#0F1B3D]">Belum ada kegiatan aktif</p>
              <p className="mt-1 text-sm text-[#0F1B3D]/65">
                Buat kegiatan baru supaya siswa bisa mendaftar.
              </p>
              <Link href="/dashboard/guru/kegiatan/baru" className={`${BTN_PRIMARY} mt-5`}>
                <Icon name="add_circle" className="text-lg" />
                Buat kegiatan
              </Link>
            </div>
          )}
        </section>

        {/* Aksi cepat */}
        <aside aria-labelledby="aksi" className={`${CARD} p-5 sm:p-6`}>
          <h2 id="aksi" className="font-display text-lg font-extrabold text-[#0F1B3D]">
            Aksi cepat
          </h2>
          <div className="mt-4 space-y-3">
            <Link href="/dashboard/guru/kegiatan/baru" className={`${BTN_PRIMARY} w-full`}>
              <Icon name="post_add" className="text-lg" />
              Buat kegiatan baru
            </Link>
            <Link href="/dashboard/guru/kegiatan" className={`${BTN_OUTLINE} w-full`}>
              <Icon name="event_available" className="text-lg" />
              Kelola semua kegiatan
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}