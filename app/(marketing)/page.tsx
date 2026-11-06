import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import type { KegiatanCardData } from "@/components/KegiatanCard";
import { toKegiatanCardData } from "@/lib/mappers";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";
import { WowInit } from "@/components/WowInit";

export const metadata = { title: "Beranda" };

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    icon: "event_available",
    title: "Katalog Kegiatan",
    desc: "Lihat seluruh kegiatan pembelajaran berikut jadwal, mapel, dan guru pengajarnya.",
  },
  {
    icon: "how_to_reg",
    title: "Daftar Sekali Klik",
    desc: "Bergabung ke kegiatan cukup satu klik, tanpa antre dan langsung tercatat otomatis.",
  },
  {
    icon: "folder_open",
    title: "Materi Lengkap",
    desc: "Unduh PDF, tonton video, atau buka tautan materi pendukung tiap pembelajaran.",
  },
  {
    icon: "devices",
    title: "Akses dari HP",
    desc: "Belajar kapan saja dan di mana saja, tampilan responsif untuk semua perangkat.",
  },
] as const;

// Animasi WOW.js tiap kartu fitur (animate.css v4)
const FEATURE_ANIM = [
  "animate__fadeInLeft",
  "animate__fadeInRight",
  "animate__fadeInLeft",
  "animate__fadeInRight",
] as const;

// Susunan bento: ukuran kartu berbeda-beda agar tidak terlihat seragam
const FEATURE_SPAN = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
] as const;

type KatalogRow = { day: string; mon: string; title: string; sub: string } | null;

function FeatureHead({ f }: { f: (typeof FEATURES)[number] }) {
  return (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]">
        <Icon name={f.icon} className="text-2xl" filled />
      </span>
      <h3 className="mt-6 font-display text-2xl font-extrabold text-[#0F1B3D]">{f.title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#0F1B3D]/75 sm:text-base">{f.desc}</p>
    </>
  );
}

// Latar foto kartu guru bergantian
const GURU_TONE = ["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"] as const;

// Lebar garis hiasan barcode pada kartu ID guru (px)
const BARCODE = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1] as const;

// Warna chip mapel pada kartu kegiatan
const MAPEL_TONE = ["#FFC83D", "#9BE3BB", "#C6B0FF"] as const;

// Lencana bulat yang mengambang di tepi kartu webinar (dekoratif)
const BADGES = [
  { icon: "touch_app", pos: "-left-5 top-[36%]", bg: "#CFE7FF", fg: "text-[#1E5FD8]", delay: "0s" },
  { icon: "folder_open", pos: "-right-5 top-[40%]", bg: "#CDF3DD", fg: "text-[#12823F]", delay: "1.2s" },
  { icon: "smartphone", pos: "-bottom-6 left-[42%]", bg: "#E6DCFF", fg: "text-[#6D35D6]", delay: "2.4s" },
] as const;

const CSS = `
html { scroll-behavior: smooth; scroll-padding-top: 6rem; }

@property --n { syntax: "<integer>"; inherits: false; initial-value: 0; }

.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }

/* Jendela dashboard: masuk dari kanan, melayang pelan, miring 3D */
.mock-in { animation: mock-in 1s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.mock-float { animation: mock-float 7s ease-in-out infinite; }
.stage-tilt {
  transform: rotate(-2deg);
  transition: transform .6s cubic-bezier(.16,1,.3,1);
}
.stage-tilt:hover { transform: rotate(-.5deg); }

/* Chip kaca yang mengambang bergantian */
.chip-float { animation: chip-float 5s ease-in-out infinite; animation-delay: var(--cd, 0s); }

/* Demo klik: kursor menuju tombol, tombol berubah jadi "Terdaftar" */
.cursor-demo { animation: cursor-demo 8s ease-in-out 2.4s infinite both; }
.btn-demo { animation: btn-bg 8s ease-in-out 2.4s infinite; }
.lbl-a { animation: lbl-a 8s ease-in-out 2.4s infinite; }
.lbl-b { opacity: 0; animation: lbl-b 8s ease-in-out 2.4s infinite; }

.live-dot { animation: live 1.8s ease-in-out infinite; }
.rec-dot { animation: rec 1.4s ease-in-out infinite; }
.eq { transform-origin: center; animation: eq 1s ease-in-out infinite; }
.chat-pop { animation: chat-pop 9s ease-in-out infinite both; animation-delay: var(--cd, 0s); }
.rise { animation: rise 3.8s ease-out infinite both; animation-delay: var(--cd, 0s); }
.vscroll { animation: vscroll 16s linear infinite; }
.spin-slow { animation: spin-slow 22s linear infinite; }
.record-spin { animation: spin-slow 5s linear infinite; }
.tonearm { transform-origin: 292px 52px; animation: tonearm 9s ease-in-out infinite; }
.marquee { animation: marquee 45s linear infinite; }
.ring-pulse { animation: ring-pulse 3.6s ease-out infinite both; animation-delay: var(--cd, 0s); }

.count-up {
  counter-reset: n var(--n);
  animation: count 1.2s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--d, 0ms);
  font-variant-numeric: tabular-nums;
}
.count-up::before { content: counter(n); }

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes mock-in { from { opacity: 0; transform: translateX(56px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes mock-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes chip-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes cursor-demo {
  0% { opacity: 0; transform: translate(70px, 60px); }
  12% { opacity: 1; transform: translate(70px, 60px); }
  32% { opacity: 1; transform: translate(6px, 8px); }
  36% { transform: translate(6px, 8px) scale(.8); }
  40% { transform: translate(6px, 8px) scale(1); }
  78% { opacity: 1; transform: translate(6px, 8px); }
  88%,100% { opacity: 0; transform: translate(40px, 40px); }
}
@keyframes btn-bg { 0%,36% { background-color: #0F1B3D; } 40%,88% { background-color: #16A34A; } 96%,100% { background-color: #0F1B3D; } }
@keyframes lbl-a { 0%,36% { opacity: 1; } 40%,92% { opacity: 0; } 98%,100% { opacity: 1; } }
@keyframes lbl-b { 0%,36% { opacity: 0; } 40%,88% { opacity: 1; } 94%,100% { opacity: 0; } }
@keyframes rec { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@keyframes eq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes chat-pop {
  0% { opacity: 0; transform: translateY(10px); }
  6%,78% { opacity: 1; transform: none; }
  88%,100% { opacity: 0; transform: translateY(-6px); }
}
@keyframes rise {
  0% { opacity: 0; transform: translateY(0) scale(.6); }
  15% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-84px) scale(1.15); }
}
@keyframes live { 0%,100% { box-shadow: 0 0 0 0 rgb(16 185 129 / .6); } 50% { box-shadow: 0 0 0 6px rgb(16 185 129 / 0); } }
@keyframes marquee { to { transform: translateX(-50%); } }
@keyframes vscroll { to { transform: translateY(-50%); } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes ring-pulse { 0% { opacity: .55; transform: scale(1); } 100% { opacity: 0; transform: scale(1.9); } }
@keyframes tonearm { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(3.5deg); } }
@keyframes count { from { --n: 0; } to { --n: var(--to); } }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-in, .mock-in, .mock-float, .chip-float, .rec-dot, .eq, .chat-pop, .rise, .cursor-demo,
  .btn-demo, .lbl-a, .lbl-b, .live-dot, .marquee, .vscroll, .spin-slow, .record-spin, .tonearm, .ring-pulse, .wow, .count-up { animation: none !important; }
  .ring-pulse { display: none; }
  .stage-tilt { transition: none; }
  .rise { display: none; }
  .cursor-demo { display: none; }
  .count-up { --n: var(--to); }
}
`;

// Batang equalizer kecil penanda "sedang diputar"
function NowPlayingBars() {
  return (
    <span aria-hidden className="flex h-4 items-end gap-[2px]">
      {[0, 0.3, 0.6].map((delay) => (
        <span
          key={delay}
          className="eq block h-4 w-[3px] rounded-full bg-[#0F1B3D]"
          style={{ transformOrigin: "bottom", animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

// delay animasi masuk hero
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function getRecent() {
  return db.kegiatan.findMany({
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    take: 3,
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: { select: { tipe: true, filePath: true } },
    },
  });
}

function getGuru() {
  return db.guru.findMany({
    orderBy: { user: { nama: "asc" } },
    include: {
      user: { select: { nama: true } },
      mapelGuru: { include: { mapel: true } },
    },
  });
}

function inisial(nama: string) {
  return nama
    .replace(/,.*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatTanggal(value: Date | string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HomePage() {
  let kegiatanCount = 0;
  let siswaCount = 0;
  let mapelCount = 0;
  let recent: Awaited<ReturnType<typeof getRecent>> = [];
  let guruList: Awaited<ReturnType<typeof getGuru>> = [];
  let dbError = false;

  try {
    await syncKegiatanStatuses();
    const result = await Promise.all([
      db.kegiatan.count(),
      db.user.count({ where: { role: "SISWA" } }),
      db.mapel.count(),
      getRecent(),
      getGuru(),
    ]);
    [kegiatanCount, siswaCount, mapelCount, recent, guruList] = result;
  } catch (err) {
    dbError = true;
    console.error("Gagal memuat data beranda:", err);
  }

  const recentCards: KegiatanCardData[] = recent.map((k) => ({
    ...toKegiatanCardData(k),
    coverUrl: resolveKegiatanCover(k.coverUrl, k.materi),
  }));

  const spotlight = recentCards[0];


  // Nama mapel untuk pita bergulir di hero (cadangan bila data belum ada)
  const mapelNames = Array.from(
    new Set(guruList.flatMap((g) => g.mapelGuru.map((m) => m.mapel.namaMapel))),
  );
  const ribbon =
    mapelNames.length >= 3
      ? mapelNames
      : ["Webinar pembelajaran", "Materi lengkap", "Tanya jawab langsung", "Daftar sekali klik"];
  const ribbonLoop = Array.from({ length: Math.ceil(10 / ribbon.length) }, () => ribbon).flat();

  // Baris contoh untuk kartu "Katalog Kegiatan" (null = kerangka kosong)
  const katalogRows: KatalogRow[] =
    recentCards.length > 0
      ? recentCards.slice(0, 4).map((k) => {
          const [day, mon] = formatTanggal(k.tanggal).split(" ");
          return {
            day: day ?? "",
            mon: (mon ?? "").slice(0, 3).toUpperCase(),
            title: k.judulPembelajaran,
            sub: k.mapel,
          };
        })
      : [null, null, null, null];

  // Tracklist kartu CTA: maksimal 3 kegiatan terbaru
  const tracks = katalogRows.filter((r): r is NonNullable<KatalogRow> => r !== null).slice(0, 3);

  const stats = [
    { value: kegiatanCount, label: "Webinar & kegiatan" },
    { value: siswaCount, label: "Siswa terdaftar" },
    { value: mapelCount, label: "Mata pelajaran" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <WowInit />

      {/* HERO: biru muda + jendela dashboard miring */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#C9E6FF] via-[#DCF0FF] to-[#EAF6FF]">
        {/* dekorasi latar: lingkaran lembut + kisi titik */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -bottom-16 h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.6),transparent)]" />
          <div className="absolute -right-24 top-16 h-[36rem] w-[36rem] rounded-full bg-white/60" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 sm:pt-36 lg:pt-40">
          <div className="grid items-center gap-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
            {/* Kiri: pesan utama */}
            <div>
              <h1
                style={d(0)}
                className="hero-in max-w-xl text-balance font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-[#0F1B3D] sm:text-6xl lg:text-[4.25rem]"
              >
                Belajar seru lewat webinar,
                <span className="block text-[#1E78E6]">bareng guru favoritmu</span>
              </h1>

              <p
                style={d(120)}
                className="hero-in mt-6 max-w-lg text-base leading-relaxed text-[#0F1B3D]/75 sm:text-lg"
              >
                Pilih webinar sesuai minatmu, daftar cuma sekali klik, lalu buka
                materinya kapan saja, dari laptop sampai HP.
              </p>

              <div style={d(220)} className="hero-in mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/kegiatan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-6 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#FFC83D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Icon name="event_available" className="text-xl text-[#FFC83D]" filled />
                  Lihat jadwal webinar
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white/70 px-6 py-3.5 text-base font-bold text-[#0F1B3D] transition-all duration-150 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  <Icon name="login" className="text-xl" />
                  Masuk
                </Link>
              </div>

              {!dbError && (
                <dl style={d(320)} className="hero-in mt-12 grid max-w-md grid-cols-3">
                  {stats.map((s, i) => (
                    <div
                      key={s.label}
                      className="flex flex-col-reverse gap-1 border-l-2 border-[#0F1B3D]/15 pl-4 first:border-l-0 first:pl-0 sm:pl-6"
                    >
                      <dt className="text-xs text-[#0F1B3D]/65 sm:text-sm">{s.label}</dt>
                      <dd className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
                        <span
                          className="count-up"
                          style={{ "--to": s.value, "--d": `${600 + i * 120}ms` } as CSSProperties}
                        >
                          <span className="sr-only">{s.value}</span>
                        </span>
                        {s.value > 0 && <span className="text-[#1E78E6]">+</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Kanan: panggung webinar langsung */}
            <div
              style={d(150)}
              className="mock-in relative mx-auto mb-10 w-full max-w-md px-3 sm:max-w-lg sm:px-6 lg:mb-0 lg:max-w-none lg:pl-12 lg:pr-3"
            >
              <div className="mock-float relative">
                <div className="stage-tilt relative">
                  {/* kartu bertumpuk di belakang */}
                  <div
                    aria-hidden
                    className="absolute inset-0 translate-x-4 translate-y-4 rotate-[4deg] rounded-[1.75rem] border-2 border-[#0F1B3D] bg-[#FFC83D]"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 -translate-x-3 translate-y-2 -rotate-[3.5deg] rounded-[1.75rem] border-2 border-[#0F1B3D] bg-[#8CCBFF]"
                  />

                  {/* kartu utama */}
                  <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-[#0F1B3D] bg-white shadow-[0_30px_50px_-22px_rgba(15,27,61,0.55)]">
                    {/* layar webinar */}
                    <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-[#0F1B3D] bg-[#17408F]">
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url("${spotlight?.coverUrl || "/gambarsekolah.jpg"}")` }}
                      />
                      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/95 via-[#17408F]/70 to-[#1E78E6]/60" />

                      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#E5372E] px-2.5 py-1 text-[11px] font-bold text-white">
                        <span className="rec-dot h-1.5 w-1.5 rounded-full bg-white" />
                        LIVE
                      </span>
                      {spotlight && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#0F1B3D]">
                          <Icon name="group" className="text-sm" filled />
                          {spotlight.jumlahSiswaDaftar}
                        </span>
                      )}

                      {/* guru sedang berbicara */}
                      <div aria-hidden className="absolute inset-0 grid place-items-center pb-6">
                        <div className="flex items-center gap-4">
                          <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-[#FFC83D] bg-white font-display text-2xl font-extrabold text-[#0F1B3D] shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                            {spotlight ? inisial(spotlight.guru) : <Icon name="person" className="text-4xl" filled />}
                          </span>
                          <span className="flex h-9 items-center gap-1">
                            {[0, 1, 2, 3, 4].map((n) => (
                              <span
                                key={n}
                                className="eq h-9 w-1.5 rounded-full bg-[#FFC83D]"
                                style={{ animationDelay: `${n * 0.14}s` }}
                              />
                            ))}
                          </span>
                        </div>
                      </div>

                      {/* obrolan langsung */}
                      <div aria-hidden className="absolute bottom-3 left-3 w-[62%] space-y-1.5">
                        {[
                          { who: "Dimas", msg: "Materinya jelas banget!", tone: "text-[#1E5FD8]", cd: "0s" },
                          { who: "Putri", msg: "Slidenya boleh dibagikan?", tone: "text-[#12823F]", cd: "2.2s" },
                          { who: "Raka", msg: "Siap, ikut terus!", tone: "text-[#6D35D6]", cd: "4.4s" },
                        ].map((c) => (
                          <div
                            key={c.who}
                            className="chat-pop w-fit max-w-full rounded-xl bg-white/95 px-2.5 py-1.5 text-xs leading-tight text-[#0F1B3D] shadow-sm"
                            style={{ "--cd": c.cd } as CSSProperties}
                          >
                            <span className={`mr-1.5 font-bold ${c.tone}`}>{c.who}</span>
                            {c.msg}
                          </div>
                        ))}
                      </div>

                      {/* reaksi naik */}
                      <div aria-hidden className="absolute bottom-3 right-5 h-24 w-10">
                        {[
                          { icon: "favorite", color: "text-[#FF5A7A]", left: "left-0", cd: "0s" },
                          { icon: "thumb_up", color: "text-[#FFC83D]", left: "left-4", cd: "1.3s" },
                          { icon: "star", color: "text-[#FFC83D]", left: "left-1", cd: "2.5s" },
                        ].map((r) => (
                          <span
                            key={r.icon}
                            className={`rise absolute bottom-0 ${r.left} ${r.color}`}
                            style={{ "--cd": r.cd } as CSSProperties}
                          >
                            <Icon name={r.icon} className="text-2xl" filled />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* info + gabung */}
                    <div className="p-4 sm:p-5">
                      <p className="line-clamp-2 font-display text-lg font-extrabold leading-snug text-[#0F1B3D] sm:text-xl">
                        {spotlight ? spotlight.judulPembelajaran : "Jadwal webinar akan tampil di sini"}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-600">
                        {spotlight
                          ? `${spotlight.guru}, ${spotlight.mapel}`
                          : "Belum ada jadwal terbaru"}
                      </p>
                      {spotlight && (
                        <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Icon name="event_available" className="text-sm text-[#1E78E6]" filled />
                          {formatTanggal(spotlight.tanggal)}
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span aria-hidden className="flex shrink-0 -space-x-2">
                            {["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"].map((c) => (
                              <span
                                key={c}
                                className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[#0F1B3D]/70"
                                style={{ backgroundColor: c }}
                              >
                                <Icon name="person" className="text-base" filled />
                              </span>
                            ))}
                          </span>
                          <span className="min-w-0 text-xs leading-tight text-slate-500">
                            {spotlight ? (
                              <>
                                <b className="font-bold text-[#0F1B3D]">{spotlight.jumlahSiswaDaftar}</b> siswa sudah daftar
                              </>
                            ) : (
                              "Gabung dari mana saja"
                            )}
                          </span>
                        </div>

                        <span
                          aria-hidden
                          className="btn-demo relative inline-flex h-10 w-28 shrink-0 items-center justify-center rounded-xl bg-[#0F1B3D] text-sm font-bold text-white"
                        >
                          <span className="lbl-a">Gabung</span>
                          <span className="lbl-b absolute inset-0 grid place-items-center">Terdaftar</span>
                          <span className="cursor-demo pointer-events-none absolute left-1/2 top-1/2 z-10">
                            <svg viewBox="0 0 20 20" className="h-5 w-5 drop-shadow" fill="#fff" stroke="#0F1B3D" strokeWidth="1.4" strokeLinejoin="round">
                              <path d="M3 2l13 7-6 2-2 6z" />
                            </svg>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* lencana bulat melayang di tepi kartu */}
                  {BADGES.map((b) => (
                    <span
                      key={b.icon}
                      aria-hidden
                      className={`chip-float absolute grid h-14 w-14 place-items-center rounded-full border-2 border-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] ${b.pos}`}
                      style={{ backgroundColor: b.bg, "--cd": b.delay } as CSSProperties}
                    >
                      <Icon name={b.icon} className={`text-2xl ${b.fg}`} filled />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* pita bergulir: nama mata pelajaran */}
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

      {/* FEATURES: kartu berwarna dengan ilustrasi bergerak */}
      <section id="fitur" className="relative overflow-hidden bg-[#F7FBFF]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="wow animate__fadeInUp max-w-2xl">
            <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#0F1B3D] sm:text-5xl">
              Kenapa belajar di platform ini?
            </h2>
            <p className="mt-4 text-base text-[#0F1B3D]/70 sm:text-lg">
              Dibangun khusus untuk kebutuhan siswa dan guru SMK Kosgoro.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-6">
            {/* 1. Katalog: daftar kegiatan bergulir */}
            <div
              className={`wow ${FEATURE_ANIM[0]} ${FEATURE_SPAN[0]}`}
              data-wow-delay="0s"
            >
              <div className="group flex h-full flex-col gap-8 overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-[#CFE7FF] p-7 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D] sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-sm">
                  <FeatureHead f={FEATURES[0]} />
                  <Link
                    href="/kegiatan"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg font-bold text-[#0F1B3D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-2"
                  >
                    Buka katalog
                    <Icon name="arrow_forward" className="text-lg transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </div>

                <div
                  aria-hidden
                  className="relative h-56 w-full shrink-0 overflow-hidden rounded-2xl border-2 border-[#0F1B3D] bg-white/60 sm:w-[19rem]"
                  style={{
                    maskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)",
                  }}
                >
                  <div className="vscroll">
                    {[0, 1].map((k) => (
                      <div key={k} className="flex flex-col gap-2.5 px-3 pb-2.5 pt-3">
                        {katalogRows.map((r, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 rounded-xl border border-[#0F1B3D]/15 bg-white p-2.5"
                          >
                            {r ? (
                              <>
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#FFC83D] text-center font-display leading-none text-[#0F1B3D]">
                                  <span>
                                    <span className="block text-base font-extrabold">{r.day}</span>
                                    <span className="block text-[9px] font-bold">{r.mon}</span>
                                  </span>
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-bold text-[#0F1B3D]">{r.title}</span>
                                  <span className="block truncate text-xs text-slate-500">{r.sub}</span>
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="h-11 w-11 shrink-0 rounded-lg bg-[#FFC83D]/70" />
                                <span className="flex-1 space-y-2">
                                  <span className="block h-2.5 w-3/4 rounded bg-[#0F1B3D]/15" />
                                  <span className="block h-2 w-1/2 rounded bg-[#0F1B3D]/10" />
                                </span>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Daftar sekali klik: demo klik */}
            <div
              className={`wow ${FEATURE_ANIM[1]} ${FEATURE_SPAN[1]}`}
              data-wow-delay="0.1s"
            >
              <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-[#0F1B3D] bg-[#FFE08A] p-7 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D]">
                <FeatureHead f={FEATURES[1]} />
                <div aria-hidden className="mt-7">
                  <span className="btn-demo relative flex h-12 w-full items-center justify-center rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] text-sm font-bold text-white">
                    <span className="lbl-a">Daftar sekarang</span>
                    <span className="lbl-b absolute inset-0 grid place-items-center">Terdaftar</span>
                    <span className="cursor-demo pointer-events-none absolute left-1/2 top-1/2 z-10">
                      <svg viewBox="0 0 20 20" className="h-6 w-6 drop-shadow" fill="#fff" stroke="#0F1B3D" strokeWidth="1.4" strokeLinejoin="round">
                        <path d="M3 2l13 7-6 2-2 6z" />
                      </svg>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Materi lengkap: jenis materi mengambang */}
            <div
              className={`wow ${FEATURE_ANIM[2]} ${FEATURE_SPAN[2]}`}
              data-wow-delay="0s"
            >
              <div className="flex h-full flex-col justify-between rounded-3xl border-2 border-[#0F1B3D] bg-[#CDF3DD] p-7 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D]">
                <FeatureHead f={FEATURES[2]} />
                <div aria-hidden className="mt-7 flex flex-wrap gap-3">
                  {[
                    { icon: "picture_as_pdf", t: "PDF" },
                    { icon: "play_circle", t: "Video" },
                    { icon: "link", t: "Tautan" },
                  ].map((c, i) => (
                    <span
                      key={c.t}
                      className="chip-float inline-flex items-center gap-1.5 rounded-xl border-2 border-[#0F1B3D] bg-white px-3 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
                      style={{ "--cd": `${i * 0.6}s` } as CSSProperties}
                    >
                      <Icon name={c.icon} className="text-lg" filled />
                      {c.t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Akses dari HP: laptop + ponsel */}
            <div
              className={`wow ${FEATURE_ANIM[3]} ${FEATURE_SPAN[3]}`}
              data-wow-delay="0.1s"
            >
              <div className="flex h-full flex-col gap-8 overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-[#E6DCFF] p-7 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D] sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-sm">
                  <FeatureHead f={FEATURES[3]} />
                </div>

                <div aria-hidden className="relative mx-auto h-48 w-72 shrink-0 sm:mx-0">
                  {/* laptop */}
                  <div className="absolute left-0 top-2 w-60">
                    <div className="rounded-t-xl border-2 border-b-0 border-[#0F1B3D] bg-white p-2.5">
                      <div className="flex gap-2">
                        <div className="grid h-16 flex-1 place-items-center rounded-lg bg-[#1E78E6] text-white">
                          <Icon name="play_arrow" className="text-3xl" filled />
                        </div>
                        <div className="w-14 space-y-1.5 pt-1">
                          <span className="block h-2 rounded bg-[#0F1B3D]/20" />
                          <span className="block h-2 w-3/4 rounded bg-[#0F1B3D]/15" />
                          <span className="block h-2 w-1/2 rounded bg-[#0F1B3D]/10" />
                        </div>
                      </div>
                      <div className="mt-2.5 space-y-1.5">
                        <span className="block h-2 rounded bg-[#0F1B3D]/15" />
                        <span className="block h-2 w-2/3 rounded bg-[#0F1B3D]/10" />
                      </div>
                    </div>
                    <div className="h-2.5 rounded-b-xl border-2 border-[#0F1B3D] bg-[#FFC83D]" />
                  </div>

                  {/* ponsel */}
                  <div
                    className="chip-float absolute bottom-0 right-0 w-24 rounded-2xl border-2 border-[#0F1B3D] bg-white p-2 shadow-[4px_4px_0_0_#0F1B3D]"
                    style={{ "--cd": "0.6s" } as CSSProperties}
                  >
                    <span className="mx-auto mb-2 block h-1 w-8 rounded bg-[#0F1B3D]/30" />
                    <div className="grid h-14 place-items-center rounded-lg bg-[#1E78E6] text-white">
                      <Icon name="play_arrow" className="text-2xl" filled />
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <span className="block h-1.5 rounded bg-[#0F1B3D]/20" />
                      <span className="block h-1.5 w-2/3 rounded bg-[#0F1B3D]/10" />
                    </div>
                    <span className="mt-2.5 block h-6 rounded-md bg-[#0F1B3D]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TENAGA PENDIDIK: kartu ID guru */}
      <section className="relative overflow-hidden border-t-2 border-[#0F1B3D] bg-[#FFF6D6]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(255,200,61,0.45),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="wow animate__fadeInUp mx-auto max-w-2xl text-center">
            <span className="inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-1.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]">
              <Icon name="school" className="text-lg" filled />
              Tenaga Pendidik
            </span>
            <h2 className="mt-6 text-balance font-display text-4xl font-extrabold tracking-tight text-[#0F1B3D] sm:text-5xl">
              Guru SMK Kosgoro Kota Bogor
            </h2>
            <p className="mt-4 text-base text-[#0F1B3D]/70 sm:text-lg">
              Didukung tenaga pendidik berpengalaman di setiap mata pelajaran.
            </p>
          </div>

          {guruList.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 gap-x-7 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {guruList.map((g, i) => {
                const mapel = g.mapelGuru.map((m) => m.mapel.namaMapel);
                return (
                  <div
                    key={g.id}
                    className="wow animate__fadeInUp h-full"
                    data-wow-delay={`${(i % 4) * 0.12}s`}
                  >
                    <div
                      className={`group relative h-full rounded-3xl border-2 border-[#0F1B3D] bg-white p-3 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[8px_10px_0_0_#0F1B3D] ${
                        i % 2 === 0 ? "-rotate-1" : "rotate-1"
                      }`}
                    >
                      {/* tali kartu ID */}
                      <span
                        aria-hidden
                        className="absolute -top-7 left-1/2 h-8 w-5 -translate-x-1/2 border-x-2 border-t-2 border-[#0F1B3D] bg-[#FFC83D]"
                      />
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-2 z-10 h-2 w-12 -translate-x-1/2 rounded-full border-2 border-[#0F1B3D] bg-[#FFF6D6]"
                      />

                      {/* foto */}
                      <div
                        className="relative mt-5 aspect-[4/4.6] overflow-hidden rounded-2xl border-2 border-[#0F1B3D]"
                        style={{ backgroundColor: GURU_TONE[i % GURU_TONE.length] }}
                      >
                        {g.foto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={g.foto}
                            alt={g.user.nama}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#17408F] to-[#1E78E6] font-display text-6xl font-extrabold text-[#FFC83D]">
                            {inisial(g.user.nama)}
                          </div>
                        )}
                        {g.jabatan && (
                          <span className="absolute bottom-2.5 left-2.5 max-w-[88%] truncate rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                            {g.jabatan}
                          </span>
                        )}
                      </div>

                      {/* identitas */}
                      <div className="px-2 pb-3 pt-4">
                        <h3 className="font-display text-lg font-extrabold leading-snug text-[#0F1B3D]">
                          {g.user.nama}
                        </h3>
                        {mapel.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {mapel.slice(0, 2).map((m) => (
                              <span
                                key={m}
                                className="max-w-full truncate rounded-full bg-[#E8F3FF] px-2.5 py-1 text-[11px] font-semibold text-[#1E5FD8]"
                              >
                                {m}
                              </span>
                            ))}
                            {mapel.length > 2 && (
                              <span className="rounded-full bg-[#0F1B3D]/10 px-2.5 py-1 text-[11px] font-semibold text-[#0F1B3D]">
                                +{mapel.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* hiasan barcode kartu ID */}
                        <div aria-hidden className="mt-4 flex h-4 items-stretch gap-[3px] border-t-2 border-dashed border-[#0F1B3D]/25 pt-3">
                          {BARCODE.map((w, k) => (
                            <span key={k} className="bg-[#0F1B3D]/70" style={{ width: `${w}px` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="wow animate__fadeInUp mt-14 rounded-3xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/70 px-6 py-14 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]">
                <Icon name={dbError ? "cloud_off" : "group_off"} className="text-3xl" filled />
              </span>
              <p className="mx-auto mt-6 max-w-sm font-display text-lg font-bold text-[#0F1B3D]">
                {dbError ? "Data tenaga pendidik belum bisa dimuat" : "Belum ada data tenaga pendidik"}
              </p>
              {dbError && (
                <>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-[#0F1B3D]/65">
                    Muat ulang halaman beberapa saat lagi.
                  </p>
                  <Link
                    href="/"
                    prefetch={false}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#FFC83D]"
                  >
                    <Icon name="refresh" className="text-lg" />
                    Muat ulang
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* RECENT: kegiatan terbaru */}
      <section id="kegiatan" className="relative overflow-hidden border-y-2 border-[#0F1B3D] bg-[#DCEEFF]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="wow animate__fadeInUp flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="font-display text-4xl font-extrabold tracking-tight text-[#0F1B3D] sm:text-5xl">
                Kegiatan pembelajaran
              </h2>
              <p className="mt-3 text-base text-[#0F1B3D]/70 sm:text-lg">
                Tiga kegiatan terbaru yang tersedia.
              </p>
            </div>
            <Link
              href="/kegiatan"
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3 text-sm font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Semua kegiatan
              <Icon name="arrow_forward" className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {recentCards.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3">
              {recentCards.map((k, i) => (
                <div
                  key={k.id}
                  className="wow animate__fadeInUp h-full"
                  data-wow-delay={`${i * 0.15}s`}
                >
                  <Link
                    href={`/kegiatan/${k.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-white shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-[#0F1B3D] bg-sky-100">
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                        style={{ backgroundImage: `url("${k.coverUrl || "/gambarsekolah.jpg"}")` }}
                      />
                      <span
                        className="absolute left-3 top-3 max-w-[70%] truncate rounded-full border-2 border-[#0F1B3D] px-3 py-1 text-xs font-bold text-[#0F1B3D]"
                        style={{ backgroundColor: MAPEL_TONE[i % MAPEL_TONE.length] }}
                      >
                        {k.mapel}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="line-clamp-2 font-display text-xl font-extrabold leading-snug text-[#0F1B3D]">
                        {k.judulPembelajaran}
                      </h3>

                      <div className="mt-4 flex items-center gap-2.5">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0F1B3D] font-display text-xs font-extrabold text-[#FFC83D]">
                          {inisial(k.guru)}
                        </span>
                        <span className="min-w-0 leading-tight">
                          <span className="block truncate text-sm font-semibold text-[#0F1B3D]">{k.guru}</span>
                          <span className="block text-xs text-slate-500">Guru pengajar</span>
                        </span>
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-dashed border-[#0F1B3D]/25 pt-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 font-medium text-[#0F1B3D]/75">
                          <Icon name="event_available" className="text-lg text-[#1E78E6]" filled />
                          {formatTanggal(k.tanggal)}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-[#0F1B3D]/65">
                          <span className="font-display text-base font-extrabold text-[#1E78E6]">
                            {k.jumlahSiswaDaftar}
                          </span>{" "}
                          daftar
                        </span>
                      </div>

                      <span className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white transition-colors group-hover:bg-[#182a5c]">
                        Lihat detail
                        <Icon name="arrow_forward" className="text-base transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="wow animate__fadeInUp mt-12 rounded-3xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/70 px-6 py-14 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]">
                <Icon name={dbError ? "cloud_off" : "event_busy"} className="text-3xl" filled />
              </span>
              <p className="mx-auto mt-6 max-w-sm font-display text-lg font-bold text-[#0F1B3D]">
                {dbError ? "Data kegiatan belum bisa dimuat" : "Belum ada kegiatan yang tersedia"}
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-[#0F1B3D]/65">
                {dbError
                  ? "Muat ulang halaman beberapa saat lagi."
                  : "Kegiatan baru akan muncul di sini begitu dijadwalkan."}
              </p>
              {dbError && (
                <Link
                  href="/"
                  prefetch={false}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#FFC83D]"
                >
                  <Icon name="refresh" className="text-lg" />
                  Muat ulang
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA: kartu = sampul piringan hitam, turntable menembus tepi sampul */}
      <section className="overflow-x-clip bg-[#F7FBFF]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="wow animate__fadeInUp" data-wow-duration="1.2s">
            <div className="relative rounded-3xl border-2 border-[#0F1B3D] bg-[#FFC83D] px-6 py-12 shadow-[8px_8px_0_0_#0F1B3D] sm:px-12 md:py-16 md:pr-[300px] lg:pr-[360px]">
              <div className="relative max-w-xl">
                <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0F1B3D] sm:text-6xl">
                  Siap untuk mulai belajar?
                </h2>
                <p className="mt-4 text-base leading-relaxed text-[#0F1B3D]/80 sm:text-lg">
                  Masuk dengan akun sekolah Anda dan ikuti kegiatan pembelajaran minggu ini.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-7 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#fff] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFC83D] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <Icon name="login" className="text-xl" />
                    Masuk
                  </Link>
                  <Link
                    href="/kegiatan"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-7 py-3.5 text-base font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFC83D] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    Lihat kegiatan
                  </Link>
                </div>

                {/* tracklist tercetak di sampul: baris pertama sedang "diputar" */}
                {tracks.length > 0 && (
                  <div className="mt-10 max-w-md overflow-hidden rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]">
                    <div className="flex items-center gap-2.5 border-b-2 border-[#0F1B3D] px-4 py-2.5 text-[#0F1B3D]">
                      <Icon name="album" className="text-xl" filled />
                      <p className="text-sm font-bold">Diputar minggu ini</p>
                    </div>
                    <ol className="text-[#0F1B3D]">
                      {tracks.map((t, i) => (
                        <li
                          key={`${t.title}-${i}`}
                          className={`flex items-center gap-3 px-4 py-3 ${i === 0 ? "bg-[#CFE7FF]" : "border-t border-[#0F1B3D]/15"}`}
                        >
                          <span className="grid w-5 shrink-0 place-items-center text-sm font-extrabold tabular-nums text-[#0F1B3D]/50">
                            {i === 0 ? <NowPlayingBars /> : i + 1}
                          </span>
                          <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-sm font-bold">{t.title}</span>
                            <span className="block truncate text-xs text-[#0F1B3D]/60">{t.sub}</span>
                          </span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums text-[#0F1B3D]/70">
                            {t.day} {t.mon}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
                {/* turntable: vinyl kuning berputar + tonearm */}
                <div
                  aria-hidden
                  className="relative mx-auto mt-14 aspect-[340/270] w-[270px] drop-shadow-[8px_8px_0_#0F1B3D] md:absolute md:-right-3 md:top-1/2 md:mx-0 md:mt-0 md:-translate-y-1/2 lg:-right-6 lg:w-[340px]"
                >
                  {/* badan turntable */}
                  <svg viewBox="0 0 340 270" className="absolute inset-0 h-full w-full">
                    <rect x="8" y="22" width="324" height="240" rx="24" fill="#8CCBFF" />
                    <rect x="8" y="10" width="324" height="240" rx="24" fill="#E3F2FF" stroke="#fff" strokeWidth="2" />
                    <rect x="20" y="22" width="300" height="216" rx="16" fill="none" stroke="#0F1B3D" strokeOpacity="0.1" strokeWidth="1.5" />

                    {/* piringan (platter) */}
                    <circle cx="132" cy="130" r="112" fill="#C5E0FB" stroke="#8CCBFF" strokeWidth="2" />
                    <circle cx="132" cy="130" r="105" fill="#0F1B3D" />

                    {/* tombol kecepatan */}
                    <rect x="248" y="158" width="28" height="18" rx="6" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="1.5" />
                    <text x="262" y="171" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F1B3D">33</text>
                    <rect x="284" y="158" width="28" height="18" rx="6" fill="#fff" stroke="#0F1B3D" strokeWidth="1.5" />
                    <text x="298" y="171" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F1B3D">45</text>

                    {/* knob + lampu */}
                    <circle cx="262" cy="210" r="14" fill="#0F1B3D" stroke="#fff" strokeWidth="2" />
                    <line x1="262" y1="210" x2="262" y2="199" stroke="#FFC83D" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="298" cy="210" r="14" fill="#0F1B3D" stroke="#fff" strokeWidth="2" />
                    <line x1="298" y1="210" x2="307" y2="204" stroke="#FFC83D" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="298" cy="143" r="4" fill="#22C55E" className="animate-pulse motion-reduce:animate-none" />
                  </svg>

                  {/* vinyl kuning yang berputar */}
                  <div
                    className="absolute aspect-square"
                    style={{ left: "9.41%", top: "11.11%", width: "58.82%" }}
                  >
                    <svg viewBox="0 0 200 200" className="record-spin h-full w-full">
                      <defs>
                        <path id="ring-vinyl" d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
                      </defs>
                      <circle cx="100" cy="100" r="100" fill="#FFC83D" />
                      {[93, 88, 83, 50, 45, 40].map((r) => (
                        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#B87A00" strokeOpacity="0.4" strokeWidth="1" />
                      ))}
                      <text fontSize="12" fontWeight="800" fill="#0F1B3D">
                        <textPath href="#ring-vinyl" textLength="400" lengthAdjust="spacing">
                          Masuk • Belajar seru • Daftar 1 klik • Bareng guru •
                        </textPath>
                      </text>
                      <circle cx="100" cy="100" r="31" fill="#0F1B3D" />
                      <circle cx="100" cy="100" r="26" fill="none" stroke="#FFC83D" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="100" y="94" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFC83D">SMK</text>
                      <text x="100" y="125" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#fff">KOSGORO</text>
                      <circle cx="100" cy="103" r="4" fill="#E3F2FF" stroke="#0F1B3D" strokeWidth="1" />
                    </svg>
                  </div>

                  {/* tonearm */}
                  <svg viewBox="0 0 340 270" className="absolute inset-0 h-full w-full">
                    <g className="tonearm">
                      <circle cx="304" cy="36" r="9" fill="#0F1B3D" />
                      <polyline
                        points="292,52 236,112 218,142"
                        fill="none"
                        stroke="#0F1B3D"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <g transform="translate(218 142) rotate(31)">
                        <rect x="-8" y="-4" width="16" height="26" rx="4" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="2.5" />
                        <rect x="-1.5" y="20" width="3" height="7" rx="1.5" fill="#0F1B3D" />
                      </g>
                    </g>
                    <circle cx="292" cy="52" r="17" fill="#fff" stroke="#0F1B3D" strokeWidth="3" />
                    <circle cx="292" cy="52" r="6" fill="#0F1B3D" />
                  </svg>

                  {/* chip terdaftar */}
                  <div className="chip-float absolute -bottom-5 right-3" style={{ "--cd": "0.8s" } as CSSProperties}>
                    <div className="flex items-center gap-2.5 rounded-2xl border-2 border-[#0F1B3D] bg-white py-2 pl-2 pr-4 shadow-[4px_4px_0_0_#0F1B3D]">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#CDF3DD] text-[#12823F]">
                        <Icon name="check_circle" className="text-xl" filled />
                      </span>
                      <span className="leading-tight">
                        <span className="block whitespace-nowrap font-display text-sm font-extrabold text-[#0F1B3D]">
                          Terdaftar
                        </span>
                        <span className="block whitespace-nowrap text-xs font-semibold text-[#12823F]">
                          Tercatat otomatis
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}