import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { daftarKegiatan } from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal, tipeMateriLabel } from "@/lib/utils";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";
import { WowInit } from "@/components/WowInit";

// Garis tepi + bayangan keras yang mengikuti bentuk tiket berlekuk
const TICKET_FILTER =
  "drop-shadow(2px 0 0 #0F1B3D) drop-shadow(-2px 0 0 #0F1B3D) drop-shadow(0 2px 0 #0F1B3D) drop-shadow(0 -2px 0 #0F1B3D) drop-shadow(6px 6px 0 #0F1B3D)";

const INFO_TONES = ["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"] as const;

const TIPE_TONE: Record<string, string> = {
  PDF: "#FFE08A",
  VIDEO: "#E6DCFF",
  LINK: "#CFE7FF",
};

const CSS = `
.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.mock-in { animation: mock-in 1s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.record-spin { animation: spin-slow 5s linear infinite; }
.tonearm { transform-origin: 292px 52px; animation: tonearm 9s ease-in-out infinite; }
.eq { transform-origin: center; animation: eq 1s ease-in-out infinite; }
.bar-progress { animation: bar-progress 14s linear infinite; }

/* Tiket info: lekuk di garis sobekan */
.tk-top, .tk-bot { --r: 13px; }
.tk-top {
  -webkit-mask-image:
    radial-gradient(circle var(--r) at 0 100%, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 100%, transparent 97%, #000 100%);
  mask-image:
    radial-gradient(circle var(--r) at 0 100%, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 100%, transparent 97%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.tk-bot {
  -webkit-mask-image:
    radial-gradient(circle var(--r) at 0 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 0, transparent 97%, #000 100%);
  mask-image:
    radial-gradient(circle var(--r) at 0 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 0, transparent 97%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes mock-in { from { opacity: 0; transform: translateX(56px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes tonearm { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(3.5deg); } }
@keyframes eq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes bar-progress { from { width: 4%; } to { width: 100%; } }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .mock-in, .record-spin, .tonearm, .eq, .wow { animation: none !important; }
  .bar-progress { animation: none !important; width: 45%; }
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

// Durasi dalam menit dari dua string "HH:MM"
function durasiMenit(mulai: string, selesai: string) {
  const [h1, m1] = mulai.split(":").map(Number);
  const [h2, m2] = selesai.split(":").map(Number);
  const v = h2 * 60 + m2 - (h1 * 60 + m1);
  return Number.isFinite(v) && v > 0 ? v : null;
}

// Piringan hitam kuning berlabel SMK Kosgoro
function Vinyl({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="record-spin h-full w-full">
      <defs>
        <path id={id} d="M100,100 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
      </defs>
      <circle cx="100" cy="100" r="98" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="3" />
      {[91, 86, 81, 50, 45, 40].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#B87A00" strokeOpacity="0.4" strokeWidth="1" />
      ))}
      <text fontSize="12" fontWeight="800" fill="#0F1B3D">
        <textPath href={`#${id}`} textLength="400" lengthAdjust="spacing">
          Belajar seru • Daftar 1 klik • Bareng guru • Materi lengkap •
        </textPath>
      </text>
      <circle cx="100" cy="100" r="31" fill="#0F1B3D" />
      <circle cx="100" cy="100" r="26" fill="none" stroke="#FFC83D" strokeWidth="1" strokeDasharray="3 3" />
      <text x="100" y="94" textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFC83D">SMK</text>
      <text x="100" y="125" textAnchor="middle" fontSize="6.5" fontWeight="700" fill="#fff">KOSGORO</text>
      <circle cx="100" cy="103" r="4" fill="#E3F2FF" stroke="#0F1B3D" strokeWidth="1" />
    </svg>
  );
}

// Turntable lengkap: badan, vinyl berputar, tonearm bergerak
function Turntable() {
  return (
    <div
      aria-hidden
      className="relative aspect-[340/270] w-full drop-shadow-[0_22px_26px_rgba(15,27,61,0.4)]"
    >
      <svg viewBox="0 0 340 270" className="absolute inset-0 h-full w-full">
        <rect x="8" y="22" width="324" height="240" rx="24" fill="#8CCBFF" />
        <rect x="8" y="10" width="324" height="240" rx="24" fill="#E3F2FF" stroke="#fff" strokeWidth="2" />
        <rect x="20" y="22" width="300" height="216" rx="16" fill="none" stroke="#0F1B3D" strokeOpacity="0.1" strokeWidth="1.5" />
        <circle cx="132" cy="130" r="112" fill="#C5E0FB" stroke="#8CCBFF" strokeWidth="2" />
        <circle cx="132" cy="130" r="105" fill="#0F1B3D" />
        <rect x="248" y="158" width="28" height="18" rx="6" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="1.5" />
        <text x="262" y="171" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F1B3D">33</text>
        <rect x="284" y="158" width="28" height="18" rx="6" fill="#fff" stroke="#0F1B3D" strokeWidth="1.5" />
        <text x="298" y="171" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0F1B3D">45</text>
        <circle cx="262" cy="210" r="14" fill="#0F1B3D" stroke="#fff" strokeWidth="2" />
        <line x1="262" y1="210" x2="262" y2="199" stroke="#FFC83D" strokeWidth="3" strokeLinecap="round" />
        <circle cx="298" cy="210" r="14" fill="#0F1B3D" stroke="#fff" strokeWidth="2" />
        <line x1="298" y1="210" x2="307" y2="204" stroke="#FFC83D" strokeWidth="3" strokeLinecap="round" />
        <circle cx="298" cy="143" r="4" fill="#22C55E" className="animate-pulse motion-reduce:animate-none" />
      </svg>

      <div className="absolute aspect-square" style={{ left: "9.41%", top: "11.11%", width: "58.82%" }}>
        <Vinyl id="ring-detail-tt" />
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-60"
          style={{
            background:
              "conic-gradient(from 25deg, transparent 0 28%, rgba(255,255,255,0.55) 34%, transparent 40% 78%, rgba(255,255,255,0.4) 84%, transparent 90%)",
          }}
        />
      </div>

      <svg viewBox="0 0 340 270" className="absolute inset-0 h-full w-full">
        <g className="tonearm">
          <circle cx="304" cy="36" r="9" fill="#0F1B3D" />
          <polyline points="292,52 236,112 218,142" fill="none" stroke="#0F1B3D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(218 142) rotate(31)">
            <rect x="-8" y="-4" width="16" height="26" rx="4" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="2.5" />
            <rect x="-1.5" y="20" width="3" height="7" rx="1.5" fill="#0F1B3D" />
          </g>
        </g>
        <circle cx="292" cy="52" r="17" fill="#fff" stroke="#0F1B3D" strokeWidth="3" />
        <circle cx="292" cy="52" r="6" fill="#0F1B3D" />
      </svg>
    </div>
  );
}

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatanId = Number(id);
  if (!kegiatanId) notFound();

  await syncKegiatanStatuses();

  const kegiatan = await db.kegiatan.findUnique({
    where: { id: kegiatanId },
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: true,
    },
  });
  if (!kegiatan) notFound();

  const session = await getSession();
  let sudahTerdaftar = false;
  if (session?.role === "SISWA") {
    const siswa = await db.siswa.findFirst({ where: { userId: session.userId } });
    if (siswa) {
      const p = await db.pendaftaran.findUnique({
        where: { siswaId_kegiatanId: { siswaId: siswa.id, kegiatanId } },
      });
      sudahTerdaftar = Boolean(p);
    }
  }

  // Kegiatan lain untuk bagian "Putar berikutnya"
  const lainnya = await db.kegiatan.findMany({
    where: { id: { not: kegiatanId } },
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    take: 3,
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: { select: { tipe: true, filePath: true } },
    },
  });

  const canAccessMateri = session?.role === "SISWA";
  const cover = resolveKegiatanCover(kegiatan.coverUrl, kegiatan.materi) || "/gambarsekolah.jpg";
  const durasi = durasiMenit(kegiatan.waktuMulai, kegiatan.waktuSelesai);

  const infoRows = [
    { icon: "calendar_today", label: "Hari & Tanggal", value: formatTanggal(kegiatan.tanggal) },
    { icon: "schedule", label: "Waktu", value: `${kegiatan.waktuMulai} - ${kegiatan.waktuSelesai} WIB` },
    { icon: "school", label: "Guru Pengajar", value: kegiatan.guru.user.nama },
    { icon: "category", label: "Mata Pelajaran", value: kegiatan.mapel.namaMapel },
  ];

  return (
    <>
      <style>{CSS}</style>
      <WowInit />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b-2 border-[#0F1B3D] bg-[#DCF0FF]">
        {/* sampul kegiatan sebagai tekstur latar */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: `url("${cover}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#C9E6FF]/80 via-[#DCF0FF]/90 to-[#EAF6FF]" />
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
          <Link
            href="/kegiatan"
            style={d(0)}
            className="hero-in group inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
          >
            <Icon name="arrow_back" className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5" />
            Kembali ke Daftar Kegiatan
          </Link>

          <div className="mt-10 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div style={d(80)} className="hero-in flex flex-wrap items-center gap-2.5">
                <StatusBadge status={kegiatan.status} />
                <span className="rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                  {kegiatan.mapel.namaMapel}
                </span>
              </div>

              <h1
                style={d(160)}
                className="hero-in mt-5 text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0F1B3D] sm:text-5xl lg:text-6xl"
              >
                {kegiatan.judulPembelajaran}
              </h1>

              <div style={d(240)} className="hero-in mt-7 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#0F1B3D] font-display text-sm font-extrabold text-[#FFC83D]">
                  {inisial(kegiatan.guru.user.nama)}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-semibold text-[#0F1B3D]/60">Guru pengajar</span>
                  <span className="block font-display text-lg font-extrabold text-[#0F1B3D]">
                    {kegiatan.guru.user.nama}
                  </span>
                </span>
              </div>

              {/* pemutar durasi */}
              <div
                style={d(320)}
                className="hero-in mt-8 max-w-lg rounded-2xl border-2 border-[#0F1B3D] bg-white p-4 shadow-[5px_5px_0_0_#0F1B3D]"
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D]">
                    <Icon name="play_arrow" className="text-3xl" filled />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F1B3D]">
                      <span>{kegiatan.waktuMulai}</span>
                      <span>{kegiatan.waktuSelesai} WIB</span>
                    </div>
                    <div aria-hidden className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#DCEBFF]">
                      <div className="bar-progress h-full rounded-full bg-gradient-to-r from-[#1E5FE0] to-[#38B6FF]" />
                    </div>
                  </div>
                  <span aria-hidden className="flex h-8 shrink-0 items-end gap-1">
                    {[0, 1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className="eq h-8 w-1 rounded-full bg-[#1E78E6]"
                        style={{ animationDelay: `${n * 0.17}s` }}
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0F1B3D]/65">
                  <Icon name="calendar_today" className="text-base text-[#1E78E6]" filled />
                  {formatTanggal(kegiatan.tanggal)}
                  {durasi && <span className="text-[#0F1B3D]/40">|</span>}
                  {durasi && <span>Durasi {durasi} menit</span>}
                </p>
              </div>
            </div>

            <div style={d(150)} className="mock-in relative mx-auto hidden w-full max-w-md lg:mr-0 lg:block lg:max-w-none">
              <Turntable />
            </div>
          </div>
        </div>
      </section>

      {/* ISI */}
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
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
            <div className="space-y-8">
              {/* deskripsi: catatan sampul album */}
              <div className="wow animate__fadeInUp overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-white shadow-[6px_6px_0_0_#0F1B3D]">
                <div
                  aria-hidden
                  className="relative aspect-[21/8] border-b-2 border-[#0F1B3D] bg-sky-100 bg-cover bg-center"
                  style={{ backgroundImage: `url("${cover}")` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                    {kegiatan.mapel.namaMapel}
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#CFE7FF] text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                      <Icon name="description" className="text-2xl" filled />
                    </span>
                    <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">Deskripsi Kegiatan</h2>
                  </div>
                  <p className="mt-5 whitespace-pre-line leading-relaxed text-[#0F1B3D]/75">
                    {kegiatan.deskripsi || "Belum ada deskripsi untuk kegiatan ini."}
                  </p>
                </div>
              </div>

              {/* peserta */}
              <div
                className="wow animate__fadeInUp rounded-3xl border-2 border-[#0F1B3D] bg-[#CDF3DD] p-6 shadow-[6px_6px_0_0_#0F1B3D] sm:p-8"
                data-wow-delay="0.1s"
              >
                <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">Daftar Peserta</h2>
                <div className="mt-4 flex items-center gap-4">
                  <span aria-hidden className="flex shrink-0 -space-x-2.5">
                    {["#CFE7FF", "#FFE08A", "#E6DCFF", "#FFFFFF"].map((c) => (
                      <span
                        key={c}
                        className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#0F1B3D] text-[#0F1B3D]/70"
                        style={{ backgroundColor: c }}
                      >
                        <Icon name="person" className="text-xl" filled />
                      </span>
                    ))}
                  </span>
                  <p className="text-sm font-medium text-[#0F1B3D]/80 sm:text-base">
                    <span className="mr-1.5 font-display text-3xl font-extrabold text-[#0F1B3D]">
                      {kegiatan.jumlahSiswaDaftar}
                    </span>
                    siswa telah mendaftar pada kegiatan ini.
                  </p>
                </div>
              </div>

              {/* materi sebagai tracklist */}
              {canAccessMateri && session && kegiatan.materi.length > 0 && (
                <div
                  className="wow animate__fadeInUp rounded-3xl border-2 border-[#0F1B3D] bg-white p-6 shadow-[6px_6px_0_0_#0F1B3D] sm:p-8"
                  data-wow-delay="0.15s"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#E6DCFF] text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                      <Icon name="library_music" className="text-2xl" filled />
                    </span>
                    <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">Materi Pembelajaran</h2>
                  </div>
                  <ol className="mt-5">
                    {kegiatan.materi.map((m, i) => (
                      <li key={m.id} className="border-b-2 border-dashed border-[#0F1B3D]/20 last:border-b-0">
                        <a
                          href={m.filePath}
                          target={m.tipe === "LINK" ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 rounded-2xl px-3 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#F7FBFF] hover:shadow-[3px_3px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] motion-reduce:transition-none"
                        >
                          <span className="w-8 shrink-0 font-display text-xl font-extrabold text-[#0F1B3D]/30 transition-colors group-hover:text-[#1E78E6]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]"
                            style={{ backgroundColor: TIPE_TONE[m.tipe] ?? "#CFE7FF" }}
                          >
                            <Icon
                              name={m.tipe === "PDF" ? "picture_as_pdf" : m.tipe === "VIDEO" ? "play_circle" : "link"}
                              className="text-2xl"
                              filled
                            />
                          </span>
                          <span className="min-w-0 flex-1 font-display text-base font-bold text-[#0F1B3D]">
                            {m.judulMateri}
                          </span>
                          <span className="hidden shrink-0 rounded-full border-2 border-[#0F1B3D] bg-white px-3 py-1 text-xs font-bold text-[#0F1B3D] sm:inline-block">
                            {tipeMateriLabel[m.tipe]}
                          </span>
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none">
                            <Icon name="play_arrow" className="text-xl" filled />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* materi terkunci untuk non-siswa */}
              {!canAccessMateri && kegiatan.materi.length > 0 && (
                <div
                  className="wow animate__fadeInUp flex items-start gap-4 rounded-3xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/70 p-6 sm:p-8"
                  data-wow-delay="0.15s"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                    <Icon name="lock" className="text-2xl" filled />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">Materi Pembelajaran</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#0F1B3D]/70">
                      {kegiatan.materi.length} materi tersedia untuk siswa yang terdaftar. Masuk sebagai siswa untuk mengaksesnya.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* tiket info + aksi daftar */}
            <aside className="lg:sticky lg:top-28">
              <div className="wow animate__fadeInRight" data-wow-delay="0.1s">
                <div style={{ filter: TICKET_FILTER }}>
                  <div className="tk-top rounded-t-3xl bg-white p-6 pb-8 text-[#0F1B3D]">
                    <h3 className="font-display text-xl font-extrabold">Info Kegiatan</h3>
                    <dl className="mt-5 space-y-4 text-sm">
                      {infoRows.map((r, i) => (
                        <div key={r.label} className="flex items-start gap-3">
                          <span
                            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] text-[#0F1B3D]"
                            style={{ backgroundColor: INFO_TONES[i % INFO_TONES.length] }}
                          >
                            <Icon name={r.icon} className="text-xl" filled />
                          </span>
                          <div className="min-w-0 pt-0.5">
                            <dt className="text-xs font-semibold text-[#0F1B3D]/60">{r.label}</dt>
                            <dd className="font-bold">{r.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="tk-bot relative -mt-px rounded-b-3xl bg-[#FFE08A] p-6 pt-8 text-[#0F1B3D]">
                    <span
                      aria-hidden
                      className="absolute inset-x-7 top-0 border-t-2 border-dashed border-[#0F1B3D]/40"
                    />
                    {session ? (
                      session.role === "SISWA" ? (
                        sudahTerdaftar ? (
                          <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#0F1B3D] bg-[#CDF3DD] px-4 py-3 text-sm font-bold">
                            <Icon name="check_circle" className="text-xl text-[#12823F]" filled />
                            Anda sudah terdaftar di kegiatan ini.
                          </div>
                        ) : kegiatan.status === "SELESAI" ? (
                          <p className="rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-3 text-sm font-semibold text-[#0F1B3D]/80">
                            Kegiatan sudah selesai, pendaftaran ditutup.
                          </p>
                        ) : (
                          <form action={daftarKegiatan}>
                            <input type="hidden" name="kegiatanId" value={kegiatanId} />
                            <button
                              type="submit"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#fff] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE08A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                            >
                              <Icon name="how_to_reg" className="text-xl text-[#FFC83D]" />
                              Daftar Kegiatan Ini
                            </button>
                          </form>
                        )
                      ) : (
                        <Link
                          href={`/dashboard/${session.role.toLowerCase()}`}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3.5 text-base font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
                        >
                          <Icon name="dashboard" className="text-xl" />
                          Buka Dashboard
                        </Link>
                      )
                    ) : (
                      <div className="space-y-3.5 text-center">
                        <p className="text-sm font-medium text-[#0F1B3D]/80">
                          Login sebagai siswa untuk mendaftar dan mengakses materi.
                        </p>
                        <Link
                          href="/login"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#fff] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE08A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                        >
                          <Icon name="login" className="text-xl text-[#FFC83D]" />
                          Masuk
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* PUTAR BERIKUTNYA */}
      {lainnya.length > 0 && (
        <section className="relative overflow-hidden border-t-2 border-[#0F1B3D] bg-[#FFF6D6]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
            <div className="wow animate__fadeInUp flex flex-wrap items-end justify-between gap-5">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-[#0F1B3D] sm:text-4xl">
                  Putar berikutnya
                </h2>
                <p className="mt-2 text-base text-[#0F1B3D]/70">Kegiatan lain yang tersedia di SMK Kosgoro.</p>
              </div>
              <Link
                href="/kegiatan"
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3 text-sm font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
              >
                Semua kegiatan
                <Icon name="arrow_forward" className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {lainnya.map((k, i) => (
                <div key={k.id} className="wow animate__fadeInUp" data-wow-delay={`${i * 0.12}s`}>
                  <Link
                    href={`/kegiatan/${k.id}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-4"
                  >
                    {/* sampul + vinyl yang meluncur keluar saat di-hover */}
                    <div className="relative aspect-[1.25/1]">
                      <div
                        aria-hidden
                        className="absolute left-[6%] top-[4%] z-0 aspect-square w-[66%] transition-transform duration-500 ease-out group-hover:translate-x-[40%] motion-reduce:transition-none"
                      >
                        <Vinyl id={`ring-next-${k.id}`} />
                      </div>
                      <div className="relative z-10 aspect-square w-[72%] -rotate-2 overflow-hidden rounded-2xl border-2 border-[#0F1B3D] bg-[#17408F] shadow-[6px_6px_0_0_#0F1B3D] transition-transform duration-300 group-hover:-rotate-1 motion-reduce:transition-none">
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url("${resolveKegiatanCover(k.coverUrl, k.materi) || "/gambarsekolah.jpg"}")`,
                          }}
                        />
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/90 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 max-w-[85%] truncate rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                          {k.mapel.namaMapel}
                        </span>
                      </div>
                    </div>
                    <h3 className="mt-4 line-clamp-2 font-display text-lg font-extrabold leading-snug text-[#0F1B3D]">
                      {k.judulPembelajaran}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#0F1B3D]/70">
                      <span className="truncate font-semibold">{k.guru.user.nama}</span>
                      <span aria-hidden className="text-[#0F1B3D]/30">|</span>
                      <span className="shrink-0">{formatTanggal(k.tanggal)}</span>
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}