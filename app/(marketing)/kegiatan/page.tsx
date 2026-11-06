import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";
import { WowInit } from "@/components/WowInit";

export const metadata = { title: "Kegiatan Pembelajaran" };

export const dynamic = "force-dynamic";

const TONES = ["#FFC83D", "#9BE3BB", "#C6B0FF", "#8CCBFF"] as const;

// Garis tepi + bayangan keras yang mengikuti bentuk tiket berlekuk
const TICKET_FILTER =
  "drop-shadow(2px 0 0 #0F1B3D) drop-shadow(-2px 0 0 #0F1B3D) drop-shadow(0 2px 0 #0F1B3D) drop-shadow(0 -2px 0 #0F1B3D) drop-shadow(6px 6px 0 #0F1B3D)";

const CSS = `
.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.disc-slow { animation: spin-slow 9s linear infinite; }
.eq { transform-origin: center; animation: eq 1s ease-in-out infinite; }
.marquee { animation: marquee 50s linear infinite; }
.day-pop { animation: day-pop .6s cubic-bezier(.34,1.56,.64,1) both; animation-delay: var(--d, 0ms); }
.chip-float { animation: chip-float 5s ease-in-out infinite; animation-delay: var(--cd, 0s); }
.rec-dot { animation: rec 1.4s ease-in-out infinite; }

/* Tiket horizontal: lekuk di garis sobekan (jarak dari kanan = --stub) */
.ticket-h {
  --r: 14px;
  -webkit-mask-image:
    radial-gradient(circle var(--r) at calc(100% - var(--stub)) 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at calc(100% - var(--stub)) 100%, transparent 97%, #000 100%);
  mask-image:
    radial-gradient(circle var(--r) at calc(100% - var(--stub)) 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at calc(100% - var(--stub)) 100%, transparent 97%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

/* Jalur timeline berhenti di baris terakhir */
.tl-row:last-child .tl-line { bottom: auto; height: 3rem; }

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes eq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes day-pop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
@keyframes chip-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes rec { 0%,100% { opacity: 1; } 50% { opacity: .25; } }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .disc-slow, .eq, .day-pop, .chip-float, .rec-dot, .marquee, .wow { animation: none !important; }
}
`;

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function inisial(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// Kalender bulanan: tanggal yang punya kegiatan ditandai kuning
function Kalender({
  tahun,
  bulan,
  hariAktif,
}: {
  tahun: number;
  bulan: number;
  hariAktif: Set<number>;
}) {
  const awal = (new Date(tahun, bulan, 1).getDay() + 6) % 7; // Senin = 0
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
  const sel: (number | null)[] = [
    ...Array.from({ length: awal }, () => null),
    ...Array.from({ length: jumlahHari }, (_, i) => i + 1),
  ];
  const judul = new Date(tahun, bulan, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-white shadow-[8px_8px_0_0_#0F1B3D]">
        <div className="flex items-center justify-between border-b-2 border-[#0F1B3D] bg-gradient-to-r from-[#0F1B3D] via-[#17408F] to-[#1E78E6] px-5 py-3.5 text-white">
          <span className="font-display text-lg font-extrabold">{judul}</span>
          <Icon name="calendar_month" className="text-2xl text-[#FFC83D]" filled />
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#0F1B3D]/55">
            {HARI.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {sel.map((n, i) =>
              n === null ? (
                <span key={`k${i}`} />
              ) : hariAktif.has(n) ? (
                <span
                  key={n}
                  style={{ "--d": `${400 + i * 30}ms` } as CSSProperties}
                  className="day-pop grid aspect-square place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-sm font-extrabold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]"
                >
                  {n}
                </span>
              ) : (
                <span
                  key={n}
                  className="grid aspect-square place-items-center rounded-xl text-sm font-semibold text-[#0F1B3D]/70"
                >
                  {n}
                </span>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 border-t-2 border-dashed border-[#0F1B3D]/25 bg-[#FFF6D6] px-5 py-3 text-sm font-bold text-[#0F1B3D]">
          <Icon name="videocam" className="text-xl text-[#1E78E6]" filled />
          {hariAktif.size} hari ada webinar
        </div>
      </div>

      <div className="chip-float absolute -left-6 -top-5" style={{ "--cd": "0.4s" } as CSSProperties}>
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#E5372E] py-1.5 pl-3 pr-3.5 text-xs font-extrabold text-white shadow-[3px_3px_0_0_#0F1B3D]">
          <span className="rec-dot h-2 w-2 rounded-full bg-white" />
          Jadwal LIVE
        </span>
      </div>
    </div>
  );
}

export default async function KegiatanPublicPage({
  searchParams,
}: {
  searchParams: Promise<{ mapel?: string }>;
}) {
  const { mapel: mapelFilter } = await searchParams;

  await syncKegiatanStatuses();

  const kegiatan = await db.kegiatan.findMany({
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: { select: { tipe: true, filePath: true } },
    },
  });

  const semua = kegiatan.map((k) => {
    const tgl = new Date(k.tanggal);
    return {
      id: k.id,
      judul: k.judulPembelajaran,
      mapel: k.mapel.namaMapel,
      guru: k.guru.user.nama,
      status: k.status,
      hari: tgl.toLocaleDateString("id-ID", { weekday: "long" }),
      day: tgl.getDate(),
      mon: tgl.toLocaleDateString("id-ID", { month: "short" }),
      waktu: `${k.waktuMulai} - ${k.waktuSelesai} WIB`,
      daftar: k.jumlahSiswaDaftar,
      cover: resolveKegiatanCover(k.coverUrl, k.materi) || "/gambarsekolah.jpg",
    };
  });

  // Ringkasan + daftar mapel untuk filter
  const mapelCount = new Map<string, number>();
  for (const k of semua) mapelCount.set(k.mapel, (mapelCount.get(k.mapel) ?? 0) + 1);
  const mapelList = Array.from(mapelCount.entries());
  const totalDaftar = semua.reduce((n, k) => n + k.daftar, 0);

  const items = mapelFilter ? semua.filter((k) => k.mapel === mapelFilter) : semua;

  // Kalender: bulan dari kegiatan pertama (atau bulan ini bila belum ada)
  const acuan = kegiatan.length > 0 ? new Date(kegiatan[0].tanggal) : new Date();
  const kalTahun = acuan.getFullYear();
  const kalBulan = acuan.getMonth();
  const hariAktif = new Set<number>(
    kegiatan
      .map((k) => new Date(k.tanggal))
      .filter((t) => t.getFullYear() === kalTahun && t.getMonth() === kalBulan)
      .map((t) => t.getDate()),
  );

  const ribbon =
    mapelList.length >= 3
      ? mapelList.map(([m]) => m)
      : ["Webinar pembelajaran", "Materi lengkap", "Tanya jawab langsung", "Daftar sekali klik"];
  const ribbonLoop = Array.from({ length: Math.ceil(10 / ribbon.length) }, () => ribbon).flat();

  const stats = [
    { label: "Kegiatan", value: semua.length },
    { label: "Pendaftar", value: totalDaftar },
    { label: "Mata pelajaran", value: mapelList.length },
  ];

  return (
    <>
      <style>{CSS}</style>
      <WowInit />

      {/* HEADER: poster line-up */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#C9E6FF] via-[#DCF0FF] to-[#EAF6FF]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -bottom-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.6),transparent)]" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-36">
          {/* kalender jadwal webinar */}
          <div className="absolute right-6 top-36 hidden w-[22rem] lg:block xl:right-4">
            <Kalender tahun={kalTahun} bulan={kalBulan} hariAktif={hariAktif} />
          </div>

          <span
            style={d(0)}
            className="hero-in inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-1.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <Icon name="event_available" className="text-lg" filled />
            Katalog Pembelajaran
          </span>

          <h1
            style={d(100)}
            className="hero-in mt-6 font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-[#0F1B3D] sm:text-6xl lg:text-7xl"
          >
            Kegiatan
            <span className="relative block w-fit text-[#1E78E6]">
              Pembelajaran
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-3 left-0 h-3 w-full"
              >
                <path
                  d="M2 9 C 30 1, 55 15, 85 7 S 140 1, 170 8 S 235 14, 298 4"
                  fill="none"
                  stroke="#FFC83D"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p style={d(200)} className="hero-in mt-8 max-w-xl text-base leading-relaxed text-[#0F1B3D]/75 sm:text-lg">
            Semua kegiatan pembelajaran yang tersedia di SMK Kosgoro. Silakan
            <Link
              href="/login"
              className="mx-1.5 font-bold text-[#1E78E6] underline decoration-2 underline-offset-4 hover:text-[#1E5FD8]"
            >
              masuk
            </Link>
            untuk mendaftar dan mengakses materi.
          </p>

          <dl style={d(300)} className="hero-in mt-9 flex flex-wrap gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col-reverse rounded-2xl border-2 border-[#0F1B3D] bg-white px-5 py-3 shadow-[4px_4px_0_0_#0F1B3D]"
              >
                <dt className="text-xs font-semibold text-[#0F1B3D]/65">{s.label}</dt>
                <dd className="font-display text-3xl font-extrabold text-[#0F1B3D]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* pita mata pelajaran bergulir */}
        <div aria-hidden className="relative overflow-hidden border-y-2 border-[#0F1B3D] bg-[#FFC83D] py-3 text-[#0F1B3D]">
          <div className="marquee flex w-max">
            {[0, 1].map((k) => (
              <ul key={k} className="flex shrink-0 items-center">
                {ribbonLoop.map((m, i) => (
                  <li key={i} className="flex items-center whitespace-nowrap font-display text-lg font-bold">
                    {m}
                    <span className="mx-6 text-xl">✦</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* DAFTAR: filter + timeline */}
      <section className="relative overflow-hidden bg-[#F7FBFF]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          {/* filter mapel */}
          {mapelList.length > 1 && (
            <nav aria-label="Filter mata pelajaran" className="mb-12 flex flex-wrap items-center gap-3">
              <span className="mr-1 inline-flex items-center gap-2 text-sm font-bold text-[#0F1B3D]/70">
                <Icon name="tune" className="text-xl" />
                Mapel
              </span>
              {[["Semua", semua.length] as [string, number], ...mapelList].map(([nama, jml], i) => {
                const aktif = i === 0 ? !mapelFilter : mapelFilter === nama;
                return (
                  <Link
                    key={nama}
                    href={i === 0 ? "/kegiatan" : `/kegiatan?mapel=${encodeURIComponent(nama)}`}
                    scroll={false}
                    aria-current={aktif ? "page" : undefined}
                    className={`inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] px-4 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 ${
                      aktif
                        ? "bg-[#0F1B3D] text-white shadow-[3px_3px_0_0_#FFC83D]"
                        : "bg-white text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D]"
                    }`}
                  >
                    {nama}
                    <span
                      className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-extrabold ${
                        aktif ? "bg-[#FFC83D] text-[#0F1B3D]" : "bg-[#DCEBFF] text-[#0F1B3D]"
                      }`}
                    >
                      {jml}
                    </span>
                  </Link>
                );
              })}
            </nav>
          )}

          {items.length === 0 ? (
            <div className="wow animate__fadeInUp rounded-3xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/70 px-6 py-16 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]">
                <Icon name="event_busy" className="text-3xl" filled />
              </span>
              <p className="mx-auto mt-6 max-w-sm font-display text-lg font-bold text-[#0F1B3D]">
                Belum ada kegiatan pembelajaran.
              </p>
            </div>
          ) : (
            <div>
              {items.map((k, i) => {
                const tone = TONES[i % TONES.length];
                return (
                  <div
                    key={k.id}
                    className="tl-row wow animate__fadeInUp grid grid-cols-1 gap-y-4 md:grid-cols-[6.5rem_3.5rem_1fr]"
                  >
                    {/* tanggal */}
                    <div className="flex items-baseline gap-3 md:block md:pt-1 md:text-right">
                      <p className="text-xs font-bold text-[#1E78E6] sm:text-sm">{k.hari}</p>
                      <p className="font-display text-5xl font-extrabold leading-none text-[#0F1B3D] md:mt-1 md:text-6xl">
                        {k.day}
                      </p>
                      <p className="text-sm font-bold text-[#0F1B3D]/70 md:mt-1">{k.mon}</p>
                    </div>

                    {/* jalur timeline + cakram mini */}
                    <div aria-hidden className="relative hidden md:block">
                      <span className="tl-line absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#0F1B3D]/30" />
                      <span className="absolute left-1/2 top-2 -translate-x-1/2">
                        <span className="disc-slow grid h-10 w-10 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] shadow-[2px_2px_0_0_#0F1B3D]">
                          <span className="relative h-4 w-4 rounded-full bg-[#0F1B3D]">
                            <span className="absolute left-1/2 top-0.5 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FFC83D]" />
                          </span>
                        </span>
                      </span>
                    </div>

                    {/* tiket */}
                    <div className="pb-10 md:pb-14">
                      <Link
                        href={`/kegiatan/${k.id}`}
                        className="group block transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-4 motion-reduce:transition-none"
                        style={{ filter: TICKET_FILTER }}
                      >
                        <div className="ticket-h flex items-stretch rounded-3xl bg-white text-[#0F1B3D] [--stub:7.5rem] sm:[--stub:9.5rem]">
                          <div
                            aria-hidden
                            className="relative hidden w-40 shrink-0 overflow-hidden rounded-l-3xl bg-sky-100 sm:block lg:w-52"
                          >
                            <div
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                              style={{ backgroundImage: `url("${k.cover}")` }}
                            />
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-5 sm:p-6">
                            <div className="flex flex-wrap items-center gap-2">
                              <StatusBadge status={k.status} />
                              <span
                                className="max-w-full truncate rounded-full border-2 border-[#0F1B3D] px-3 py-1 text-xs font-bold"
                                style={{ backgroundColor: tone }}
                              >
                                {k.mapel}
                              </span>
                            </div>
                            <h2 className="line-clamp-2 font-display text-xl font-extrabold leading-snug sm:text-2xl">
                              {k.judul}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                              <span className="flex min-w-0 items-center gap-2">
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0F1B3D] font-display text-[11px] font-extrabold text-[#FFC83D]">
                                  {inisial(k.guru)}
                                </span>
                                <span className="truncate font-semibold">{k.guru}</span>
                              </span>
                              <span className="inline-flex items-center gap-1.5 font-medium text-slate-500">
                                <Icon name="schedule" className="text-base text-[#1E78E6]" />
                                {k.waktu}
                              </span>
                            </div>
                          </div>

                          <div
                            className="flex w-[var(--stub)] shrink-0 flex-col items-center justify-center gap-1 rounded-r-3xl border-l-2 border-dashed border-[#0F1B3D]/40 px-2 py-5 text-center"
                            style={{ backgroundColor: tone }}
                          >
                            <span className="font-display text-4xl font-extrabold leading-none">{k.daftar}</span>
                            <span className="text-[11px] font-bold">siswa daftar</span>
                            <span className="mt-2 grid h-10 w-10 place-items-center rounded-full bg-[#0F1B3D] text-[#FFC83D] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">
                              <Icon name="arrow_forward" className="text-xl" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}