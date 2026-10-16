import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { KegiatanCard, type KegiatanCardData } from "@/components/KegiatanCard";
import { toKegiatanCardData } from "@/lib/mappers";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

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

// Susunan bento: ukuran kartu berbeda-beda agar tidak terlihat seragam
const FEATURE_SPAN = [
  "md:col-span-4",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-4",
] as const;

// Obrolan dan reaksi pada tiruan ruang webinar (dekoratif)
const CHAT = [
  { nama: "Dimas", teks: "Materinya jelas banget! 🔥", delay: "0.8s", tone: "text-sky-300" },
  { nama: "Putri", teks: "Slidenya boleh dibagikan?", delay: "3.6s", tone: "text-emerald-300" },
  { nama: "Raka", teks: "Sudah paham, lanjut kak 👍", delay: "6.4s", tone: "text-amber-300" },
] as const;

const REACTIONS = [
  { e: "👏", x: "-18px", right: "8%", delay: "0s" },
  { e: "🔥", x: "14px", right: "22%", delay: "1.3s" },
  { e: "👍", x: "-10px", right: "36%", delay: "2.6s" },
  { e: "💡", x: "20px", right: "14%", delay: "3.9s" },
] as const;

const PESERTA = [
  { n: "DM", c: "bg-sky-400" },
  { n: "PU", c: "bg-emerald-400" },
  { n: "RK", c: "bg-amber-400" },
  { n: "AS", c: "bg-rose-400" },
] as const;

const CSS = `
html { scroll-behavior: smooth; scroll-padding-top: 5rem; }

@property --n { syntax: "<integer>"; inherits: false; initial-value: 0; }

.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.hero-in-right { animation: fade-left .9s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.float-slow { animation: float 6s ease-in-out infinite; }
.float-slow-alt { animation: float 5s ease-in-out 1s infinite reverse; }
.drift { animation: drift 14s ease-in-out infinite; }
.drift-alt { animation: drift 18s ease-in-out infinite reverse; }

/* Ruang webinar: titik LIVE, gelombang suara, grafik, obrolan, reaksi */
.kenburns { animation: kenburns 24s ease-in-out infinite alternate; }
.live-dot { animation: live 1.8s ease-in-out infinite; }
.wave { transform-origin: bottom; animation: wave 1s ease-in-out infinite; }
.bar-grow { transform-origin: bottom; animation: bar-grow .9s cubic-bezier(.16,1,.3,1) both; }
.chat-loop { animation: chat-loop 12s ease-in-out infinite both; }
.react { animation: react 4.5s ease-out infinite both; }
.bob { animation: bob 1.6s ease-in-out infinite; }
.count-up {
  counter-reset: n var(--n);
  animation: count 1.2s cubic-bezier(.16,1,.3,1) both;
  animation-delay: var(--d, 0ms);
  font-variant-numeric: tabular-nums;
}
.count-up::before { content: counter(n); }

@supports (animation-timeline: view()) {
  .reveal {
    animation: fade-up linear both;
    animation-timeline: view();
    animation-range: entry 0% entry 40%;
  }
}

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes fade-left { from { opacity: 0; transform: translateX(40px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,20px) scale(1.08); } }
@keyframes kenburns { from { transform: scale(1.03); } to { transform: scale(1.14) translate(-1.5%, -1%); } }
@keyframes live { 0%,100% { box-shadow: 0 0 0 0 rgb(239 68 68 / .65); } 50% { box-shadow: 0 0 0 6px rgb(239 68 68 / 0); } }
@keyframes wave { 0%,100% { transform: scaleY(.3); } 50% { transform: scaleY(1); } }
@keyframes bar-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes chat-loop { 0% { opacity: 0; transform: translateY(10px); } 6%,80% { opacity: 1; transform: none; } 90%,100% { opacity: 0; } }
@keyframes react { 0% { opacity: 0; transform: translateY(0) scale(.6); } 15% { opacity: 1; } 100% { opacity: 0; transform: translateY(-120px) translateX(var(--x, 0)) scale(1.15); } }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
@keyframes count { from { --n: 0; } to { --n: var(--to); } }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-in, .hero-in-right, .float-slow, .float-slow-alt, .drift, .drift-alt, .reveal,
  .live-dot, .wave, .bar-grow, .chat-loop, .react, .bob, .count-up, .kenburns { animation: none !important; }
  .react { display: none; }
}
`;

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

  const stats = [
    { value: kegiatanCount, label: "Webinar & kegiatan" },
    { value: siswaCount, label: "Siswa terdaftar" },
    { value: mapelCount, label: "Mata pelajaran" },
  ];

  return (
    <>
      <style>{CSS}</style>

      {/* HERO — ruang webinar */}
      <section className="relative overflow-hidden rounded-b-[2.5rem] bg-slate-950">
        {/* foto sekolah sebagai latar: terlihat jelas di kanan, gelap di kiri agar teks tetap terbaca */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <div
            className="kenburns absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/gambarsekolah.jpg)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </div>

        {/* cahaya + kisi halus */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(55% 55% at 85% 15%, rgb(56 189 248 / 0.32), transparent 70%), radial-gradient(50% 50% at 8% 95%, rgb(37 99 235 / 0.5), transparent 70%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="drift absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="drift-alt absolute right-0 top-40 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:pb-28 md:pt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* Kiri: pesan utama */}
          <div>
            <span
              style={d(0)}
              className="hero-in inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 py-1.5 pl-3 pr-4 text-xs font-semibold text-white backdrop-blur"
            >
              <span className="live-dot h-2 w-2 rounded-full bg-red-500" />
              Webinar pembelajaran digital · SMK Kosgoro
            </span>

            <h1
              style={d(100)}
              className="hero-in mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Belajar seru lewat webinar,{" "}
              <span className="bg-gradient-to-r from-sky-300 via-brand-300 to-sky-200 bg-clip-text text-transparent">
                bareng guru favoritmu
              </span>
            </h1>

            <p style={d(200)} className="hero-in mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Pilih webinar sesuai minatmu, daftar cuma sekali klik, lalu buka
              materinya kapan saja, dari laptop sampai HP.
            </p>

            <div style={d(300)} className="hero-in mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kegiatan"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-base font-bold text-brand-700 shadow-lg shadow-brand-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-50 active:scale-[0.98] sm:w-auto"
              >
                <Icon name="play_circle" className="text-xl" filled />
                Lihat jadwal webinar
              </Link>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/25 px-7 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                <Icon name="login" className="text-xl" />
                Masuk
              </Link>
            </div>

            <ul style={d(380)} className="hero-in mt-7 flex flex-wrap gap-2">
              {[
                { icon: "touch_app", t: "Daftar 1 klik" },
                { icon: "replay", t: "Materi bisa dibuka lagi" },
                { icon: "smartphone", t: "Bisa dari HP" },
              ].map((c) => (
                <li
                  key={c.t}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 ring-1 ring-white/10"
                >
                  <Icon name={c.icon} className="text-sm text-sky-300" />
                  {c.t}
                </li>
              ))}
            </ul>

            {!dbError && (
              <dl style={d(460)} className="hero-in mt-10 grid max-w-md grid-cols-3 divide-x divide-white/15">
                {stats.map((s, i) => (
                  <div key={s.label} className="px-4 first:pl-0">
                    <dd className="font-display text-2xl font-extrabold text-white sm:text-3xl">
                      <span
                        className="count-up"
                        style={{ "--to": s.value, "--d": `${600 + i * 120}ms` } as CSSProperties}
                      >
                        <span className="sr-only">{s.value}</span>
                      </span>
                      <span className="text-sky-300">+</span>
                    </dd>
                    <dt className="mt-0.5 text-xs text-slate-400">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Kanan: tiruan ruang webinar dengan data kegiatan terbaru */}
          <div style={d(250)} className="hero-in-right relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden className="absolute -inset-4 rounded-[2.25rem] bg-gradient-to-br from-brand-500/40 to-sky-400/30 blur-2xl" />

            <div className="float-slow relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/85 shadow-2xl shadow-black/50 backdrop-blur">
              {/* bilah judul jendela */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </span>
                <span className="truncate text-xs font-medium text-slate-300">Ruang Webinar · SMK Kosgoro</span>
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[11px] font-bold text-white">
                  <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
                  LIVE
                </span>
              </div>

              <div className="grid gap-3 p-3 sm:grid-cols-[1fr_10.5rem]">
                {/* panggung / slide */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-800 p-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">
                    <Icon name="event_available" className="text-sm" filled />
                    {spotlight ? spotlight.mapel : "Webinar pembelajaran"}
                  </span>
                  <h2 className="mt-3 max-w-[16rem] font-display text-xl font-extrabold leading-snug text-white sm:text-2xl">
                    {spotlight ? spotlight.judulPembelajaran : "Jadwal webinar akan tampil di sini"}
                  </h2>

                  <div className="mt-5 flex h-16 items-end gap-2">
                    {[40, 65, 50, 85, 70, 95].map((h, i) => (
                      <span
                        key={i}
                        className="bar-grow w-5 rounded-t-md bg-gradient-to-t from-sky-300 to-white/90"
                        style={{ height: `${h}%`, animationDelay: `${700 + i * 110}ms` }}
                      />
                    ))}
                  </div>

                  {/* pembicara */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-xl bg-slate-950/60 p-2 pr-3 backdrop-blur">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-display text-xs font-extrabold text-brand-700">
                      {spotlight ? inisial(spotlight.guru) : <Icon name="person" className="text-lg" filled />}
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-[7rem] truncate text-xs font-semibold text-white">
                        {spotlight ? spotlight.guru : "Guru pengajar"}
                      </span>
                      <span className="flex h-3 items-end gap-0.5">
                        {[0, 0.2, 0.4, 0.1].map((dl, i) => (
                          <span key={i} className="wave h-full w-0.5 rounded-full bg-emerald-300" style={{ animationDelay: `${dl}s` }} />
                        ))}
                      </span>
                    </span>
                  </div>

                  {/* reaksi melayang */}
                  <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-full">
                    {REACTIONS.map((r) => (
                      <span
                        key={r.e}
                        className="react absolute bottom-10 text-xl"
                        style={{ right: r.right, animationDelay: r.delay, "--x": r.x } as CSSProperties}
                      >
                        {r.e}
                      </span>
                    ))}
                  </div>
                </div>

                {/* obrolan */}
                <div className="hidden flex-col rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:flex">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                    <Icon name="chat" className="text-sm" />
                    Obrolan
                  </p>
                  <div className="mt-3 flex-1 space-y-2.5">
                    {CHAT.map((c) => (
                      <div key={c.nama} className="chat-loop" style={{ animationDelay: c.delay }}>
                        <p className={`text-[10px] font-bold ${c.tone}`}>{c.nama}</p>
                        <p className="rounded-lg rounded-tl-none bg-white/10 px-2 py-1.5 text-xs text-slate-100">{c.teks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* bilah kontrol + ajakan daftar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {PESERTA.map((p) => (
                      <span key={p.n} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-slate-900 ring-2 ring-slate-900 ${p.c}`}>
                        {p.n}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-300">
                    <span className="font-semibold text-white">{spotlight ? spotlight.jumlahSiswaDaftar : 0}</span> peserta
                    {spotlight && <> · {formatTanggal(spotlight.tanggal)}</>}
                  </span>
                </div>

                {spotlight ? (
                  <Link
                    href={`/kegiatan/${spotlight.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-300 active:scale-95"
                  >
                    Gabung sekarang
                    <Icon name="arrow_forward" className="text-base" />
                  </Link>
                ) : (
                  <Link
                    href="/kegiatan"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-white/20"
                  >
                    Buka katalog
                  </Link>
                )}
              </div>
            </div>

            {/* chip melayang */}
            <div className="float-slow-alt absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl border border-white/15 bg-white px-4 py-2.5 shadow-xl sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="check_circle" className="text-lg" filled />
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Pendaftaran
                <br />
                tercatat otomatis
              </span>
            </div>
            <div className="float-slow absolute -right-3 -top-4 hidden items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg sm:flex">
              <Icon name="pan_tool" className="text-sm" filled />
              Izin bertanya!
            </div>
          </div>
        </div>

        <a
          href="#fitur"
          aria-label="Gulir ke bagian fitur"
          className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-white md:inline-flex"
        >
          Jelajahi
          <Icon name="arrow_downward" className="bob text-base" />
        </a>
      </section>

      {/* FEATURES — bento */}
      <section id="fitur" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="reveal max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Kenapa belajar di platform ini?
          </h2>
          <p className="mt-3 text-slate-600">
            Dibangun khusus untuk kebutuhan siswa dan guru SMK Kosgoro.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6">
          {FEATURES.map((f, i) => {
            const featured = i === 0;
            return (
              <div key={f.title} className={`reveal ${FEATURE_SPAN[i]}`}>
                <div
                  className={`group relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${featured
                    ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white"
                    : "border border-slate-200 bg-white"
                    }`}
                >
                  {featured && (
                    <div aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
                  )}
                  <div
                    className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${featured ? "bg-white/15 text-white" : "bg-brand-100 text-brand-700"
                      }`}
                  >
                    <Icon name={f.icon} className="text-2xl" filled />
                  </div>
                  <h3 className="relative mt-6 font-display text-lg font-bold">{f.title}</h3>
                  <p
                    className={`relative mt-2 max-w-md text-sm leading-relaxed ${featured ? "text-brand-100" : "text-slate-500"
                      }`}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TENAGA PENDIDIK */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="reveal mx-auto max-w-2xl text-center">
            <span className="badge border-brand-200 bg-brand-50 text-brand-700">
              <Icon name="school" className="text-sm" filled />
              Tenaga Pendidik
            </span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Guru SMK Kosgoro Kota Bogor
            </h2>
            <p className="mt-3 text-slate-600">
              Didukung tenaga pendidik berpengalaman di setiap mata pelajaran.
            </p>
          </div>

          {guruList.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {guruList.map((g) => (
                <div
                  key={g.id}
                  className="reveal group card overflow-hidden text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100">
                    {g.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.foto}
                        alt={g.user.nama}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 font-display text-5xl font-extrabold text-white">
                        {inisial(g.user.nama)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {g.jabatan && (
                      <span className="badge border-brand-200 bg-brand-50 text-brand-700">
                        {g.jabatan}
                      </span>
                    )}
                    <h3 className="mt-3 font-display text-base font-bold text-slate-900">
                      {g.user.nama}
                    </h3>
                    {g.mapelGuru.length > 0 && (
                      <p className="mt-1.5 text-xs text-slate-500">
                        {g.mapelGuru.map((m) => m.mapel.namaMapel).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name={dbError ? "cloud_off" : "group_off"} className="text-3xl" />
              </div>
              <p className="mx-auto mt-4 max-w-sm text-sm text-slate-500">
                {dbError
                  ? "Data tenaga pendidik belum bisa dimuat. Muat ulang halaman beberapa saat lagi."
                  : "Belum ada data tenaga pendidik."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* RECENT */}
      <section id="kegiatan" className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Kegiatan pembelajaran
              </h2>
              <p className="mt-2 text-slate-600">Tiga kegiatan terbaru yang tersedia.</p>
            </div>
            <Link href="/kegiatan" className="btn-outline bg-white">
              Semua kegiatan
              <Icon name="arrow_forward" className="text-lg" />
            </Link>
          </div>

          {recentCards.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
              {recentCards.map((k) => (
                <div key={k.id} className="reveal h-full">
                  <KegiatanCard kegiatan={k} href={`/kegiatan/${k.id}`}>
                    <Link href={`/kegiatan/${k.id}`} className="btn-outline w-full">
                      Lihat detail
                    </Link>
                  </KegiatanCard>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name={dbError ? "cloud_off" : "event_busy"} className="text-3xl" />
              </div>
              <p className="mx-auto mt-4 max-w-sm text-sm text-slate-500">
                {dbError
                  ? "Data kegiatan belum bisa dimuat. Muat ulang halaman beberapa saat lagi."
                  : "Belum ada kegiatan yang tersedia."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="reveal">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 px-6 py-14 text-white shadow-2xl sm:px-14">
            <div aria-hidden className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-500/40 blur-3xl" />
            <div aria-hidden className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Siap untuk mulai belajar?
                </h2>
                <p className="mt-3 text-slate-300">
                  Masuk dengan akun sekolah Anda dan ikuti kegiatan pembelajaran
                  minggu ini.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Icon name="login" className="text-lg" />
                  Masuk
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}