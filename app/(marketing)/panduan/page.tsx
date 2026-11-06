import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/Icon";
import { WowInit } from "@/components/WowInit";

export const metadata = { title: "Panduan Penggunaan" };

const STEPS = [
  {
    icon: "person_add",
    title: "1. Daftar Akun",
    desc: "Masuk ke halaman Daftar, isi nama, email, password, dan pilih kelas Anda. Role otomatis menjadi Siswa.",
  },
  {
    icon: "login",
    title: "2. Masuk ke Dashboard",
    desc: "Setelah mendaftar Anda diarahkan langsung ke dashboard siswa. Guru & admin masuk melalui akun dari sekolah.",
  },
  {
    icon: "event_available",
    title: "3. Pilih Kegiatan",
    desc: "Buka menu Kegiatan, gunakan filter status atau pencarian untuk menemukan pembelajaran yang sesuai.",
  },
  {
    icon: "how_to_reg",
    title: "4. Daftar Kegiatan",
    desc: "Klik tombol Daftar pada kegiatan yang diminati. Anda tidak bisa mendaftar dua kali pada kegiatan yang sama.",
  },
  {
    icon: "folder_open",
    title: "5. Akses Materi",
    desc: "Setelah terdaftar, buka materi pembelajaran: unduh PDF, tonton video, atau ikuti tautan yang disediakan guru.",
  },
  {
    icon: "history",
    title: "6. Pantau Riwayat",
    desc: "Menu Riwayat menampilkan seluruh kegiatan yang pernah Anda ikuti untuk memudahkan belajar ulang.",
  },
] as const;

const TONES = ["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF", "#CFE7FF", "#FFE08A"] as const;

const CSS = `
.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }

/* Jalur peta: mulai di simpul pertama, berhenti di simpul terakhir */
.step-row:first-child .rail { top: 2.5rem; }
.step-row:last-child .rail { bottom: auto; height: 3rem; }

/* Demo klik tombol Daftar */
.cursor-demo { animation: cursor-demo 8s ease-in-out 2.4s infinite both; }
.btn-demo { animation: btn-bg 8s ease-in-out 2.4s infinite; }
.lbl-a { animation: lbl-a 8s ease-in-out 2.4s infinite; }
.lbl-b { opacity: 0; animation: lbl-b 8s ease-in-out 2.4s infinite; }

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes cursor-demo {
  0% { opacity: 0; transform: translate(60px, 50px); }
  12% { opacity: 1; transform: translate(60px, 50px); }
  32% { opacity: 1; transform: translate(4px, 6px); }
  36% { transform: translate(4px, 6px) scale(.8); }
  40% { transform: translate(4px, 6px) scale(1); }
  78% { opacity: 1; transform: translate(4px, 6px); }
  88%,100% { opacity: 0; transform: translate(36px, 36px); }
}
@keyframes btn-bg { 0%,36% { background-color: #0F1B3D; } 40%,88% { background-color: #16A34A; } 96%,100% { background-color: #0F1B3D; } }
@keyframes lbl-a { 0%,36% { opacity: 1; } 40%,92% { opacity: 0; } 98%,100% { opacity: 1; } }
@keyframes lbl-b { 0%,36% { opacity: 0; } 40%,88% { opacity: 1; } 94%,100% { opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .btn-demo, .lbl-a, .lbl-b, .wow { animation: none !important; }
  .cursor-demo { display: none; }
}
`;

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const judul = (t: string) => t.replace(/^\d+\.\s*/, "");

// Pratinjau mini layar untuk tiap langkah (dekoratif)
function Mini({ i }: { i: number }) {
  const field =
    "flex h-7 items-center rounded-md border border-[#0F1B3D]/20 bg-[#F7FBFF] px-2.5 text-[11px] text-slate-400";

  let isi: ReactNode = null;

  if (i === 0) {
    isi = (
      <div className="space-y-2">
        {["Nama lengkap", "Email", "Password"].map((t) => (
          <div key={t} className={field}>
            {t}
          </div>
        ))}
        <div className="flex gap-2">
          <div className={`${field} flex-1 justify-between`}>
            Kelas
            <Icon name="expand_more" className="text-sm" />
          </div>
          <span className="grid h-7 w-20 place-items-center rounded-md border-2 border-[#0F1B3D] bg-[#FFC83D] text-[11px] font-bold text-[#0F1B3D]">
            Daftar
          </span>
        </div>
      </div>
    );
  } else if (i === 1) {
    isi = (
      <div className="flex gap-2.5">
        <div className="w-8 space-y-1.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#DCEBFF] text-[#1E78E6]">
            <Icon name="dashboard" className="text-base" filled />
          </span>
          <span className="block h-8 w-8 rounded-lg bg-[#0F1B3D]/10" />
          <span className="block h-8 w-8 rounded-lg bg-[#0F1B3D]/10" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <span className="block h-3 w-1/2 rounded bg-[#0F1B3D]/80" />
          <div className="grid grid-cols-3 gap-1.5">
            {["#CFE7FF", "#FFE08A", "#CDF3DD"].map((c) => (
              <span key={c} className="h-10 rounded-md border border-[#0F1B3D]/15" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="block h-2 rounded bg-[#0F1B3D]/10" />
          <span className="block h-2 w-2/3 rounded bg-[#0F1B3D]/10" />
        </div>
      </div>
    );
  } else if (i === 2) {
    isi = (
      <div className="space-y-2">
        <div className={`${field} gap-2`}>
          <Icon name="search" className="text-base" />
          Cari kegiatan
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#0F1B3D] px-2.5 py-1 text-[11px] font-bold text-white">Semua</span>
          {["Status", "Mapel"].map((t) => (
            <span key={t} className="inline-flex items-center gap-0.5 rounded-full border border-[#0F1B3D]/25 px-2.5 py-1 text-[11px] font-semibold text-[#0F1B3D]">
              {t}
              <Icon name="expand_more" className="text-sm" />
            </span>
          ))}
        </div>
      </div>
    );
  } else if (i === 3) {
    isi = (
      <div className="flex items-center gap-2.5">
        <span className="h-11 w-11 shrink-0 rounded-lg bg-[#CFE7FF]" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="block h-2.5 w-4/5 rounded bg-[#0F1B3D]/80" />
          <span className="block h-2 w-1/2 rounded bg-[#0F1B3D]/20" />
        </div>
        <span className="btn-demo relative inline-flex h-8 w-[5.25rem] shrink-0 items-center justify-center rounded-lg bg-[#0F1B3D] text-[11px] font-bold text-white">
          <span className="lbl-a">Daftar</span>
          <span className="lbl-b absolute inset-0 grid place-items-center">Terdaftar</span>
          <span className="cursor-demo pointer-events-none absolute left-1/2 top-1/2 z-10">
            <svg viewBox="0 0 20 20" className="h-5 w-5 drop-shadow" fill="#fff" stroke="#0F1B3D" strokeWidth="1.4" strokeLinejoin="round">
              <path d="M3 2l13 7-6 2-2 6z" />
            </svg>
          </span>
        </span>
      </div>
    );
  } else if (i === 4) {
    isi = (
      <div className="flex flex-wrap gap-2">
        {[
          { icon: "picture_as_pdf", t: "PDF", bg: "#FFE08A" },
          { icon: "play_circle", t: "Video", bg: "#E6DCFF" },
          { icon: "link", t: "Tautan", bg: "#CFE7FF" },
        ].map((c) => (
          <span
            key={c.t}
            className="inline-flex items-center gap-1.5 rounded-lg border-2 border-[#0F1B3D] px-2.5 py-1.5 text-xs font-bold text-[#0F1B3D]"
            style={{ backgroundColor: c.bg }}
          >
            <Icon name={c.icon} className="text-base" filled />
            {c.t}
          </span>
        ))}
      </div>
    );
  } else {
    isi = (
      <div className="space-y-2">
        {[80, 62, 70].map((w, k) => (
          <div key={k} className="flex items-center gap-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#CDF3DD] text-[#12823F]">
              <Icon name="check" className="text-sm" />
            </span>
            <span className="h-2.5 rounded bg-[#0F1B3D]/15" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className="mt-5 rounded-xl border-2 border-[#0F1B3D] bg-white p-3 shadow-[3px_3px_0_0_#0F1B3D]"
    >
      {isi}
    </div>
  );
}

export default function PanduanPage() {
  return (
    <>
      <style>{CSS}</style>
      <WowInit />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b-2 border-[#0F1B3D] bg-gradient-to-b from-[#C9E6FF] via-[#DCF0FF] to-[#EAF6FF]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -bottom-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.6),transparent)]" />
          <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-white/60" />
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

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-32 text-center sm:px-6 sm:pt-36">
          <span
            style={d(0)}
            className="hero-in inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-1.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <Icon name="menu_book" className="text-lg" filled />
            Panduan
          </span>

          <h1
            style={d(100)}
            className="hero-in mt-6 text-balance font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-[#0F1B3D] sm:text-6xl"
          >
            Cara Menggunakan
            <span className="relative mx-auto block w-fit text-[#1E78E6]">
              Website
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

          <p style={d(200)} className="hero-in mx-auto mt-8 max-w-xl text-base leading-relaxed text-[#0F1B3D]/75 sm:text-lg">
            Ikuti langkah-langkah berikut untuk mulai belajar di platform
            pembelajaran digital SMK Kosgoro.
          </p>

          {/* lompat ke langkah */}
          <nav
            aria-label="Lompat ke langkah"
            style={d(300)}
            className="hero-in mx-auto mt-9 flex max-w-3xl flex-wrap items-center justify-center gap-2.5"
          >
            {STEPS.map((s, i) => (
              <a
                key={s.title}
                href={`#langkah-${i + 1}`}
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-lg border-2 border-[#0F1B3D] font-display text-sm font-extrabold"
                  style={{ backgroundColor: TONES[i] }}
                >
                  {i + 1}
                </span>
                {judul(s.title)}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* PETA LANGKAH */}
      <section className="relative overflow-hidden bg-[#F7FBFF]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          {/* titik mulai */}
          <div className="wow animate__fadeInUp mb-6 flex md:justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#0F1B3D] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_#FFC83D]">
              <Icon name="flag" className="text-lg text-[#FFC83D]" filled />
              Mulai dari sini
            </span>
          </div>

          <div>
            {STEPS.map((s, i) => {
              const kiri = i % 2 === 0;
              return (
                <div
                  key={s.title}
                  id={`langkah-${i + 1}`}
                  className="step-row grid scroll-mt-28 grid-cols-[3.25rem_1fr] gap-x-4 md:grid-cols-[1fr_4.5rem_1fr] md:gap-x-6"
                >
                  {/* simpul + jalur */}
                  <div aria-hidden className="relative md:col-start-2 md:row-start-1">
                    <span className="rail absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#0F1B3D]/35" />
                    <span className="absolute left-1/2 top-3 -translate-x-1/2">
                      <span
                        className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#0F1B3D] font-display text-xl font-extrabold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] md:h-14 md:w-14 md:text-2xl"
                        style={{ backgroundColor: i === 0 ? "#FFC83D" : "#fff" }}
                      >
                        {i + 1}
                      </span>
                    </span>
                  </div>

                  {/* kartu langkah */}
                  <div
                    className={`pb-10 md:pb-14 ${
                      kiri ? "md:col-start-1" : "md:col-start-3"
                    } md:row-start-1`}
                  >
                    <div
                      className="wow animate__fadeInUp h-full"
                      data-wow-delay={`${(i % 2) * 0.1}s`}
                    >
                      <div
                        className="rounded-3xl border-2 border-[#0F1B3D] p-6 shadow-[6px_6px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#0F1B3D] motion-reduce:transition-none"
                        style={{ backgroundColor: TONES[i] }}
                      >
                        <div className="flex items-center gap-3.5">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                            <Icon name={s.icon} className="text-2xl" filled />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#0F1B3D]/60">Langkah {i + 1}</p>
                            <h2 className="font-display text-xl font-extrabold leading-tight text-[#0F1B3D]">
                              {judul(s.title)}
                            </h2>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-[#0F1B3D]/80">{s.desc}</p>
                        <Mini i={i} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* titik selesai */}
          <div className="wow animate__fadeInUp mt-2 flex md:justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#CDF3DD] px-4 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]">
              <Icon name="check_circle" className="text-lg text-[#12823F]" filled />
              Siap belajar
            </span>
          </div>

          {/* BANTUAN */}
          <div className="wow animate__fadeInUp mt-20" data-wow-delay="0.1s">
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0F1B3D] bg-[#0F1B3D] px-6 py-10 text-white shadow-[8px_8px_0_0_#FFC83D] sm:px-12 sm:py-12">
              <div
                aria-hidden
                className="absolute -right-28 -top-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(30,120,230,0.55),transparent)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)",
                  backgroundSize: "22px 22px",
                  maskImage: "linear-gradient(to right, black, transparent 70%)",
                  WebkitMaskImage: "linear-gradient(to right, black, transparent 70%)",
                }}
              />
              <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-5">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-white bg-[#FFC83D] text-[#0F1B3D]">
                    <Icon name="support_agent" className="text-3xl" filled />
                  </span>
                  <div>
                    <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Butuh Bantuan?</h2>
                    <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                      Hubungi panitia atau admin sekolah melalui halaman Kontak jika mengalami
                      kendala saat mendaftar, login, atau mengakses materi.
                    </p>
                  </div>
                </div>
                <Link
                  href="/kontak"
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl border-2 border-[#FFC83D] bg-[#FFC83D] px-6 py-3.5 text-base font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#fff] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B3D] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Icon name="mail" className="text-xl" filled />
                  Hubungi kami
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}