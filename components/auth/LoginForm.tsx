"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/Icon";

// Semua animasi ada di file ini (CSS murni, tanpa file tambahan)
const css = `
@keyframes lg-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(229 55 46 / 0.7); } 50% { box-shadow: 0 0 0 6px rgb(229 55 46 / 0); } }
@keyframes lg-wave  { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
@keyframes lg-grow  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes lg-chat  { 0% { opacity: 0; transform: translateY(12px) scale(0.96); } 8%, 68% { opacity: 1; transform: none; } 80%, 100% { opacity: 0; transform: translateY(-6px); } }
@keyframes lg-hand  { 0%, 55% { opacity: 0; transform: scale(0.6) rotate(-12deg); } 62%, 90% { opacity: 1; transform: scale(1) rotate(0); } 100% { opacity: 0; } }
@keyframes lg-slide { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: none; } }
@keyframes lg-form  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes lg-card  { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes lg-shake { 0%, 100% { transform: none; } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
@keyframes lg-spin  { to { transform: rotate(360deg); } }
@keyframes lg-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

.lg-live  { animation: lg-pulse 1.8s ease-in-out infinite; }
.lg-wave  { transform-origin: bottom; animation: lg-wave 1s ease-in-out infinite; }
.lg-bar   { transform-origin: bottom; animation: lg-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-chat  { animation: lg-chat 10s ease-in-out infinite both; }
.lg-hand  { animation: lg-hand 10s ease-in-out infinite both; }
.lg-slide { animation: lg-slide 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-form  { animation: lg-form 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-card  { animation: lg-card 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-shake { animation: lg-shake 0.4s ease; }
.lg-spin  { animation: lg-spin 0.7s linear infinite; }
.lg-float { animation: lg-float 5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .lg-live, .lg-wave, .lg-bar, .lg-chat, .lg-hand, .lg-slide, .lg-form, .lg-card, .lg-shake, .lg-spin, .lg-float { animation: none !important; }
  .lg-chat, .lg-hand { opacity: 1; }
}
`;

const peserta = [
  { n: "DM", c: "#CFE7FF" },
  { n: "PU", c: "#CDF3DD" },
  { n: "RK", c: "#FFE08A" },
  { n: "AS", c: "#FFD9D2" },
  { n: "NF", c: "#E6DCFF" },
];

const chat = [
  { nama: "Dimas", teks: "Materinya jelas, Pak!", delay: "0.8s", tone: "text-[#1E5FD8]" },
  { nama: "Putri", teks: "Boleh minta slidenya?", delay: "3.6s", tone: "text-[#12823F]" },
  { nama: "Raka", teks: "Sudah paham, lanjut ✅", delay: "6.4s", tone: "text-[#6D35D6]" },
];

// Ilustrasi pengajar berheadset
function Pengajar() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className="h-full w-full">
      <rect width="100" height="100" fill="#8CCBFF" />
      <circle cx="82" cy="18" r="22" fill="#B9DEFF" />
      <path d="M10 100 C10 74 29 66 50 66 C71 66 90 74 90 100 Z" fill="#0F1B3D" />
      <path d="M39 67 L50 83 L61 67 Z" fill="#fff" />
      <rect x="44" y="55" width="12" height="15" rx="5" fill="#E8A97E" />
      <circle cx="50" cy="42" r="19" fill="#F2B98F" />
      <path d="M31 42 A19 19 0 0 1 69 42 C64 34 56 31 50 31 C44 31 36 34 31 42 Z" fill="#1B2A4E" />
      <circle cx="43" cy="45" r="2" fill="#0F1B3D" />
      <circle cx="57" cy="45" r="2" fill="#0F1B3D" />
      <path d="M44 52 Q50 57 56 52" stroke="#0F1B3D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 44 C30 26 70 26 70 44" fill="none" stroke="#FFC83D" strokeWidth="3.5" />
      <rect x="25" y="42" width="8" height="13" rx="3.5" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="1.5" />
      <rect x="67" y="42" width="8" height="13" rx="3.5" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="1.5" />
      <path d="M29 55 Q33 64 44 61" stroke="#FFC83D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="45" cy="61" r="2.5" fill="#0F1B3D" />
    </svg>
  );
}

function RuangWebinar() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0F1B3D] via-[#17408F] to-[#1E78E6] p-8 text-white lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.5),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom right, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(to bottom right, black, transparent 70%)",
        }}
      />

      <div className="lg-slide relative">
        <h2 className="font-display text-3xl font-extrabold leading-tight">
          Kelas digital,
          <br />
          <span className="text-[#FFC83D]">kapan pun Anda siap.</span>
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
          Ikuti webinar, akses materi, dan pantau kegiatan belajar SMK Kosgoro dalam satu tempat.
        </p>
      </div>

      {/* Tiruan ruang webinar */}
      <div className="lg-slide relative mt-8" style={{ animationDelay: "150ms" }}>
        <div className="lg-float rounded-2xl border-2 border-white/90 bg-[#F6FAFF] p-3 text-[#0F1B3D] shadow-[6px_6px_0_0_#FFC83D]">
          <div className="flex items-center justify-between gap-2 px-1 pb-2.5 text-xs">
            <span className="flex items-center gap-1.5 rounded-full bg-[#E5372E] px-2.5 py-1 font-bold text-white">
              <span className="lg-live h-1.5 w-1.5 rounded-full bg-white" />
              LIVE
            </span>
            <span className="truncate font-bold">Sesi 3 · Pengantar Jaringan Komputer</span>
            <span className="flex shrink-0 items-center gap-1 font-bold text-[#0F1B3D]/70">
              <Icon name="group" className="text-sm" filled />
              128
            </span>
          </div>

          <div className="relative grid grid-cols-[1fr_5.5rem] gap-2.5 rounded-xl border-2 border-[#0F1B3D] bg-gradient-to-br from-[#17408F] via-[#1E5FE0] to-[#38B6FF] p-2.5">
            <div className="rounded-lg bg-white p-3.5">
              <p className="font-display text-base font-extrabold">Topologi Jaringan</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Perbandingan kecepatan transfer</p>
              <div className="mt-3 flex h-16 items-end gap-2">
                {[45, 70, 55, 90, 65].map((h, i) => (
                  <div
                    key={i}
                    className="lg-bar w-full rounded-t-md"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i % 2 === 0 ? "#1E78E6" : "#FFC83D",
                      animationDelay: `${500 + i * 120}ms`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-white ring-2 ring-[#FFC83D]">
                <Pengajar />
                <span className="absolute bottom-1 left-1 flex h-3.5 items-end gap-0.5 rounded bg-[#0F1B3D]/85 px-1 py-0.5">
                  {[0, 0.2, 0.4].map((dl, i) => (
                    <span key={i} className="lg-wave h-full w-0.5 rounded-full bg-[#FFC83D]" style={{ animationDelay: `${dl}s` }} />
                  ))}
                </span>
              </div>
              <span className="text-center text-[10px] font-semibold text-white/85">Pengajar</span>
            </div>

            <span
              className="lg-hand absolute -top-3 right-3 flex items-center gap-1 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]"
              style={{ animationDelay: "2s" }}
            >
              <Icon name="pan_tool" className="text-xs" filled />
              Izin bertanya
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between px-1">
            <div className="flex -space-x-2">
              {peserta.map((p) => (
                <span
                  key={p.n}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0F1B3D] text-[10px] font-extrabold text-[#0F1B3D]"
                  style={{ backgroundColor: p.c }}
                >
                  {p.n}
                </span>
              ))}
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[10px] font-extrabold text-[#0F1B3D]">
                +123
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {["mic", "videocam", "chat"].map((ic) => (
                <span key={ic} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0F1B3D] bg-white text-[#0F1B3D]">
                  <Icon name={ic} className="text-sm" filled />
                </span>
              ))}
            </div>
          </div>

          {/* Obrolan yang bergantian muncul */}
          <div className="pointer-events-none absolute -left-5 bottom-14 w-48">
            {chat.map((c) => (
              <div
                key={c.nama}
                className="lg-chat rounded-xl border-2 border-[#0F1B3D] bg-white px-3 py-2 text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
                style={{ animationDelay: c.delay, position: "absolute", bottom: 0, left: 0, width: "100%" }}
              >
                <p className={`text-[10px] font-extrabold ${c.tone}`}>{c.nama}</p>
                <p className="text-xs font-medium">{c.teks}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="lg-slide relative mt-8 text-xs font-medium text-white/60" style={{ animationDelay: "300ms" }}>
        SMK Kosgoro · Pembelajaran Digital
      </p>
    </div>
  );
}

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPw, setShowPw] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const input =
    "w-full rounded-xl border-2 border-[#0F1B3D] bg-[#F7FBFF] py-3 pl-11 pr-4 text-sm font-semibold text-[#0F1B3D] outline-none transition-all duration-150 placeholder:font-medium placeholder:text-slate-400 focus:bg-white focus:shadow-[3px_3px_0_0_#FFC83D] focus:ring-2 focus:ring-[#1E78E6] focus:ring-offset-2";

  return (
    <div className="lg-card w-full max-w-5xl overflow-hidden rounded-[2rem] border-2 border-[#0F1B3D] bg-white shadow-[8px_8px_0_0_#FFC83D] lg:grid lg:grid-cols-[1.05fr_1fr]">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <RuangWebinar />

      <div className="flex flex-col justify-center bg-white p-6 sm:p-10">
        <div className="lg-form mb-5 inline-flex w-fit items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFE08A] px-3.5 py-1 text-xs font-extrabold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D] lg:hidden">
          <span className="lg-live h-2 w-2 rounded-full bg-[#E5372E]" />
          Kelas digital sedang berjalan
        </div>

        <div className="lg-form">
          <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]">
            <Icon name="login" className="text-3xl" filled />
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-[#0F1B3D]">
            Masuk ke ruang belajar
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#0F1B3D]/70">
            Gunakan akun dari sekolah untuk bergabung ke kelas dan webinar Anda.
          </p>
        </div>

        <form
          action={formAction}
          onSubmit={() => setAttempt((a) => a + 1)}
          className="mt-7 space-y-5"
        >
          <div className="lg-form" style={{ animationDelay: "80ms" }}>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#0F1B3D]">
              Email
            </label>
            <div className="group relative">
              <Icon
                name="person"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-[#0F1B3D]/50 transition-colors group-focus-within:text-[#1E78E6]"
              />
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="nama@email.com"
                className={input}
              />
            </div>
          </div>

          <div className="lg-form" style={{ animationDelay: "160ms" }}>
            <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#0F1B3D]">
              Kata sandi
            </label>
            <div className="group relative">
              <Icon
                name="lock"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-[#0F1B3D]/50 transition-colors group-focus-within:text-[#1E78E6]"
              />
              <input
                id="password"
                name="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={`${input} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#0F1B3D]/60 transition-colors hover:bg-[#DCEBFF] hover:text-[#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6]"
              >
                <Icon name={showPw ? "visibility_off" : "visibility"} className="text-xl" />
              </button>
            </div>
          </div>

          {state.error && (
            <div
              key={attempt}
              role="alert"
              className="lg-shake flex items-start gap-2.5 rounded-xl border-2 border-[#0F1B3D] bg-[#FFD9D2] px-4 py-3 text-sm font-bold text-[#8A1C14] shadow-[3px_3px_0_0_#0F1B3D]"
            >
              <Icon name="error" className="mt-0.5 text-lg" filled />
              {state.error}
            </div>
          )}

          <div className="lg-form" style={{ animationDelay: "240ms" }}>
            <button
              type="submit"
              disabled={pending}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-4 py-3.5 text-base font-bold text-white shadow-[4px_4px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#FFC83D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0_0_#FFC83D]"
            >
              {pending ? (
                <>
                  <span className="lg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                  Memeriksa akun…
                </>
              ) : (
                <>
                  Masuk ke kelas
                  <Icon
                    name="login"
                    className="text-xl text-[#FFC83D] transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>

          <p className="lg-form text-center text-sm text-[#0F1B3D]/70" style={{ animationDelay: "320ms" }}>
            Lupa kata sandi?{" "}
            <Link
              href="/kontak"
              className="font-bold text-[#1E78E6] underline decoration-2 underline-offset-4 hover:text-[#1E5FD8]"
            >
              Hubungi admin sekolah
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}