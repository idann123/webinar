import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { KegiatanCard, type KegiatanCardData } from "@/components/KegiatanCard";
import { toKegiatanCardData } from "@/lib/mappers";
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

const CSS = `
html { scroll-behavior: smooth; scroll-padding-top: 5rem; }

.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.hero-in-right { animation: fade-left .9s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.float-slow { animation: float 6s ease-in-out infinite; }
.float-slow-alt { animation: float 5s ease-in-out 1s infinite reverse; }
.drift { animation: drift 14s ease-in-out infinite; }
.drift-alt { animation: drift 18s ease-in-out infinite reverse; }

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

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .hero-in, .hero-in-right, .float-slow, .float-slow-alt, .drift, .drift-alt, .reveal { animation: none !important; }
}
`;

// delay animasi masuk hero
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function getRecent() {
  return db.kegiatan.findMany({
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    take: 3,
    include: { mapel: true, guru: { include: { user: true } } },
  });
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
  let dbError = false;

  try {
    await syncKegiatanStatuses();
    const result = await Promise.all([
      db.kegiatan.count(),
      db.user.count({ where: { role: "SISWA" } }),
      db.mapel.count(),
      getRecent(),
    ]);
    [kegiatanCount, siswaCount, mapelCount, recent] = result;
  } catch (err) {
    dbError = true;
    console.error("Gagal memuat data beranda:", err);
  }

  const recentCards: KegiatanCardData[] = recent.map(toKegiatanCardData);

  const spotlight = recentCards[0];

  const stats = [
    { value: kegiatanCount, label: "Kegiatan" },
    { value: siswaCount, label: "Siswa terdaftar" },
    { value: mapelCount, label: "Mata pelajaran" },
  ];

  return (
    <>
      <style>{CSS}</style>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* pola titik + cahaya lembut */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.35) 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="drift absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="drift-alt absolute -right-16 top-20 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Kiri: teks */}
          <div>
            <span style={d(0)} className="hero-in inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1.5 pl-2 pr-4 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
                <Icon name="school" className="text-sm" filled />
              </span>
              Platform pembelajaran digital SMK Kosgoro
            </span>

            <h1 style={d(100)} className="hero-in mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Belajar bersama guru, langsung dari sekolah
            </h1>

            <p style={d(200)} className="hero-in mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Temukan kegiatan pembelajaran sesuai minatmu, daftar dengan satu
              klik, dan akses semua materi dalam satu platform untuk siswa dan
              guru SMK Kosgoro.
            </p>

            <div style={d(300)} className="hero-in mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/kegiatan"
                className="btn-primary w-full px-7 py-3 text-base shadow-lg shadow-brand-600/25 sm:w-auto"
              >
                <Icon name="explore" className="text-xl" />
                Lihat kegiatan
              </Link>
              <Link href="/register" className="btn-outline w-full bg-white/70 px-7 py-3 text-base backdrop-blur sm:w-auto">
                <Icon name="person_add" className="text-xl" />
                Daftar sebagai siswa
              </Link>
            </div>

            {!dbError && (
              <dl style={d(400)} className="hero-in mt-12 grid max-w-md grid-cols-3 divide-x divide-slate-200">
                {stats.map((s) => (
                  <div key={s.label} className="px-4 first:pl-0">
                    <dd className="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      {s.value}
                      <span className="text-brand-600">+</span>
                    </dd>
                    <dt className="mt-0.5 text-xs text-slate-500">{s.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Kanan: pratinjau kegiatan */}
          <div style={d(250)} className="hero-in-right relative mx-auto w-full max-w-md lg:max-w-none">
            <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-200/60 to-sky-200/60 blur-2xl" />

            <div className="float-slow relative rounded-3xl border border-white/70 bg-white p-6 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  <Icon name="event_available" className="text-sm" filled />
                  {spotlight ? spotlight.mapel : "Kegiatan pembelajaran"}
                </span>
                <span className="text-xs text-slate-400">
                  {spotlight ? formatTanggal(spotlight.tanggal) : "Segera hadir"}
                </span>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold leading-snug text-slate-900">
                {spotlight ? spotlight.judulPembelajaran : "Jadwal kegiatan akan tampil di sini"}
              </h2>

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Icon name="person" className="text-xl" filled />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">Guru pengajar</p>
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {spotlight ? spotlight.guru : "-"}
                  </p>
                </div>
                {spotlight && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-slate-500">Peserta</p>
                    <p className="text-sm font-semibold text-slate-900">{spotlight.jumlahSiswaDaftar}</p>
                  </div>
                )}
              </div>

              {spotlight ? (
                <Link href={`/kegiatan/${spotlight.id}`} className="btn-primary mt-5 w-full">
                  Lihat detail
                  <Icon name="arrow_forward" className="text-lg" />
                </Link>
              ) : (
                <Link href="/kegiatan" className="btn-outline mt-5 w-full">
                  Buka katalog
                </Link>
              )}
            </div>

            {/* chip melayang */}
            <div className="float-slow-alt absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-lg sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Icon name="check_circle" className="text-lg" filled />
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Pendaftaran
                <br />
                tercatat otomatis
              </span>
            </div>
          </div>
        </div>
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
                className={`group relative h-full overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  featured
                    ? "bg-gradient-to-br from-brand-600 to-brand-700 text-white"
                    : "border border-slate-200 bg-white"
                }`}
              >
                {featured && (
                  <div aria-hidden className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
                )}
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                    featured ? "bg-white/15 text-white" : "bg-brand-100 text-brand-700"
                  }`}
                >
                  <Icon name={f.icon} className="text-2xl" filled />
                </div>
                <h3 className="relative mt-6 font-display text-lg font-bold">{f.title}</h3>
                <p
                  className={`relative mt-2 max-w-md text-sm leading-relaxed ${
                    featured ? "text-brand-100" : "text-slate-500"
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
                Buat akun siswa dan ikuti kegiatan pembelajaran minggu ini.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow transition hover:bg-brand-50"
              >
                <Icon name="person_add" className="text-lg" />
                Daftar sekarang
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}