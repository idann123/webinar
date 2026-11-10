import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { WowInit } from "@/components/WowInit";

export const metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "Bagaimana cara mendaftar sebagai siswa?",
    a: "Buka menu Daftar di bagian atas, isi nama lengkap, email aktif, password minimal 6 karakter, dan pilih kelas. Setelah berhasil, Anda langsung masuk ke dashboard siswa.",
  },
  {
    q: "Apakah saya bisa mendaftar ke kegiatan yang sama dua kali?",
    a: "Tidak. Sistem otomatis mencegah pendaftaran ganda pada kegiatan yang sama. Anda tetap bisa mengikuti banyak kegiatan berbeda.",
  },
  {
    q: "Bagaimana cara mengakses materi pembelajaran?",
    a: "Pastikan Anda sudah terdaftar pada kegiatan tersebut melalui dashboard siswa. Materi dapat berupa file PDF untuk diunduh, video untuk ditonton, atau tautan eksternal.",
  },
  {
    q: "Lupa password, bagaimana?",
    a: "Hubungi admin sekolah melalui halaman Kontak. Admin dapat mereset password akun Anda menjadi password sementara.",
  },
  {
    q: "Apakah guru bisa membuat kegiatan sendiri?",
    a: "Ya. Guru login dengan akun dari admin, lalu pada menu Kegiatan Saya dapat membuat kegiatan baru, mengisi jadwal, mengunggah materi, dan melihat daftar siswa yang mendaftar.",
  },
  {
    q: "Apa fungsi status pada kegiatan?",
    a: "Status menunjukkan kondisi kegiatan: Belum Mulai, Berlangsung, atau Selesai. Guru dapat memperbarui status secara manual, dan kegiatan yang jadwalnya sudah lewat otomatis dianggap Berlangsung.",
  },
] as const;

const TONES = ["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"] as const;

const CSS = `
.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.chip-float { animation: chip-float 5s ease-in-out infinite; animation-delay: var(--cd, 0s); }
.hand-wiggle { transform-origin: 70% 90%; animation: hand 2.2s ease-in-out infinite; }

/* Jawaban muncul seperti balasan chat saat pertanyaan dibuka */
.faq-ans { animation: ans-in .4s cubic-bezier(.34,1.3,.64,1) both; transform-origin: top right; }

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes chip-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes hand { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-14deg); } 55% { transform: rotate(12deg); } 80% { transform: rotate(-6deg); } }
@keyframes ans-in { from { opacity: 0; transform: translateY(-8px) scale(.94); } to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .chip-float, .hand-wiggle, .faq-ans, .wow { animation: none !important; }
}
`;

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function FaqPage() {
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
          {/* lencana bulat melayang */}
          <span
            aria-hidden
            className="chip-float absolute left-4 top-44 hidden h-16 w-16 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] md:grid lg:left-0"
          >
            <Icon name="help" className="text-4xl" filled />
          </span>
          <span
            aria-hidden
            className="chip-float absolute right-4 top-56 hidden h-14 w-14 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#CDF3DD] text-[#12823F] shadow-[3px_3px_0_0_#0F1B3D] md:grid lg:right-0"
            style={{ "--cd": "1.4s" } as CSSProperties}
          >
            <Icon name="forum" className="text-3xl" filled />
          </span>

          <span
            style={d(0)}
            className="hero-in inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-1.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <Icon name="help" className="text-lg" filled />
            FAQ
          </span>

          <h1
            style={d(100)}
            className="hero-in mt-6 text-balance font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-[#0F1B3D] sm:text-6xl"
          >
            Pertanyaan yang
            <span className="relative mx-auto block w-fit text-[#1E78E6]">
              Sering Diajukan
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

          <p
            style={d(200)}
            className="hero-in mx-auto mt-8 inline-flex items-center gap-2.5 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <Icon name="forum" className="text-xl text-[#1E78E6]" filled />
            {FAQS.length} pertanyaan dan jawabannya
          </p>
        </div>
      </section>

      {/* TANYA JAWAB */}
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
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.75fr_1.45fr] lg:items-start">
            {/* kartu bantuan */}
            <aside className="lg:sticky lg:top-28">
              <div className="wow animate__fadeInUp rounded-3xl border-2 border-[#0F1B3D] bg-[#FFE08A] p-6 shadow-[6px_6px_0_0_#0F1B3D] sm:p-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]">
                  <Icon name="back_hand" className="hand-wiggle text-3xl" filled />
                </span>
                <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight text-[#0F1B3D]">
                  Masih ada pertanyaan?
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-[#0F1B3D]/75">
                  Hubungi admin sekolah melalui halaman Kontak, kami siap membantu.
                </p>
                <Link
                  href="/kontak"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#fff] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE08A] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Icon name="mail" className="text-xl text-[#FFC83D]" filled />
                  Hubungi kami
                </Link>
              </div>
            </aside>

            {/* percakapan */}
            <div className="space-y-7">
              {FAQS.map((f, i) => (
                <div
                  key={f.q}
                  className="wow animate__fadeInUp"
                  data-wow-delay={`${(i % 3) * 0.08}s`}
                >
                  <details className="group" {...({ name: "faq" } as object)}>
                    <summary className="flex cursor-pointer list-none items-start gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden">
                      <span
                        aria-hidden
                        className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] text-[#0F1B3D]"
                        style={{ backgroundColor: TONES[i % TONES.length] }}
                      >
                        <Icon name="person" className="text-xl" filled />
                      </span>
                      <span className="flex flex-1 items-center justify-between gap-4 rounded-2xl rounded-tl-sm border-2 border-[#0F1B3D] bg-white px-5 py-4 font-display text-base font-extrabold leading-snug text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] transition-all duration-200 hover:-translate-y-0.5 group-open:bg-[#FFF6D6] group-open:shadow-[2px_2px_0_0_#0F1B3D] motion-reduce:transition-none sm:text-lg">
                        <span>{f.q}</span>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0F1B3D] text-[#FFC83D] transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
                          <Icon name="add" className="text-xl" />
                        </span>
                      </span>
                    </summary>

                    <div className="faq-ans mt-4 flex items-start justify-end gap-3 pl-8 sm:pl-16">
                      <p className="rounded-2xl rounded-tr-sm border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-4 text-sm leading-relaxed text-white shadow-[4px_4px_0_0_#FFC83D] sm:text-base">
                        {f.a}
                      </p>
                      <span
                        aria-hidden
                        className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D]"
                      >
                        <Icon name="support_agent" className="text-xl" filled />
                      </span>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}