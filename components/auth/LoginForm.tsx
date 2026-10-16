"use client";

import { useActionState, useState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/Icon";

// Semua animasi ada di file ini (CSS murni, tanpa file tambahan)
const css = `
@keyframes lg-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgb(248 113 113 / 0.7); } 50% { box-shadow: 0 0 0 6px rgb(248 113 113 / 0); } }
@keyframes lg-wave  { 0%, 100% { transform: scaleY(0.3); } 50% { transform: scaleY(1); } }
@keyframes lg-grow  { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes lg-chat  { 0% { opacity: 0; transform: translateY(12px) scale(0.96); } 8%, 68% { opacity: 1; transform: none; } 80%, 100% { opacity: 0; transform: translateY(-6px); } }
@keyframes lg-hand  { 0%, 55% { opacity: 0; transform: scale(0.6) rotate(-12deg); } 62%, 90% { opacity: 1; transform: scale(1) rotate(0); } 100% { opacity: 0; } }
@keyframes lg-slide { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: none; } }
@keyframes lg-form  { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes lg-shake { 0%, 100% { transform: none; } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
@keyframes lg-spin  { to { transform: rotate(360deg); } }

.lg-live  { animation: lg-pulse 1.8s ease-in-out infinite; }
.lg-wave  { transform-origin: bottom; animation: lg-wave 1s ease-in-out infinite; }
.lg-bar   { transform-origin: bottom; animation: lg-grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-chat  { animation: lg-chat 10s ease-in-out infinite both; }
.lg-hand  { animation: lg-hand 10s ease-in-out infinite both; }
.lg-slide { animation: lg-slide 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-form  { animation: lg-form 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
.lg-shake { animation: lg-shake 0.4s ease; }
.lg-spin  { animation: lg-spin 0.7s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .lg-live, .lg-wave, .lg-bar, .lg-chat, .lg-hand, .lg-slide, .lg-form, .lg-shake, .lg-spin { animation: none !important; }
  .lg-chat, .lg-hand { opacity: 1; }
}
`;

const peserta = [
  { n: "DM", c: "bg-sky-400" },
  { n: "PU", c: "bg-emerald-400" },
  { n: "RK", c: "bg-amber-400" },
  { n: "AS", c: "bg-rose-400" },
  { n: "NF", c: "bg-violet-400" },
];

const chat = [
  { nama: "Dimas", teks: "Materinya jelas, Pak!", delay: "0.8s" },
  { nama: "Putri", teks: "Boleh minta slidenya?", delay: "3.6s" },
  { nama: "Raka", teks: "Sudah paham, lanjut ✅", delay: "6.4s" },
];

function RuangWebinar() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-950/70 p-8 text-white backdrop-blur-sm lg:flex">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="lg-slide relative">
        <h2 className="font-display text-3xl font-extrabold leading-tight">
          Kelas digital,
          <br />
          kapan pun Anda siap.
        </h2>
        <p className="mt-2 max-w-sm text-sm text-white/75">
          Ikuti webinar, akses materi, dan pantau kegiatan belajar SMK Kosgoro dalam satu tempat.
        </p>
      </div>

      {/* Tiruan ruang webinar */}
      <div className="lg-slide relative mt-8 rounded-2xl bg-brand-950/60 p-3 ring-1 ring-white/15 backdrop-blur" style={{ animationDelay: "150ms" }}>
        <div className="flex items-center justify-between gap-2 px-1 pb-2.5 text-xs">
          <span className="flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 font-bold">
            <span className="lg-live h-1.5 w-1.5 rounded-full bg-white" />
            LIVE
          </span>
          <span className="truncate font-medium text-white/85">Sesi 3 · Pengantar Jaringan Komputer</span>
          <span className="flex shrink-0 items-center gap-1 text-white/70">
            <Icon name="group" className="text-sm" />
            128
          </span>
        </div>

        <div className="relative grid grid-cols-[1fr_auto] gap-3 rounded-xl bg-brand-950/75 p-4 ring-1 ring-white/10">
          <div>
            <p className="font-display text-base font-bold">Topologi Jaringan</p>
            <p className="mt-0.5 text-[11px] text-white/60">Perbandingan kecepatan transfer</p>
            <div className="mt-4 flex h-20 items-end gap-2">
              {[45, 70, 55, 90, 65].map((h, i) => (
                <div
                  key={i}
                  className="lg-bar w-full rounded-t-md bg-gradient-to-t from-sky-400 to-brand-200"
                  style={{ height: `${h}%`, animationDelay: `${500 + i * 120}ms` }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-end gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/30">
              <Icon name="school" className="text-2xl" filled />
            </span>
            <span className="flex h-4 items-end gap-0.5">
              {[0, 0.2, 0.4, 0.1].map((d, i) => (
                <span key={i} className="lg-wave h-full w-0.5 rounded-full bg-emerald-300" style={{ animationDelay: `${d}s` }} />
              ))}
            </span>
            <span className="text-[10px] text-white/60">Pengajar</span>
          </div>

          <span className="lg-hand absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-brand-950" style={{ animationDelay: "2s" }}>
            <Icon name="pan_tool" className="text-xs" filled />
            Izin bertanya
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex -space-x-2">
            {peserta.map((p) => (
              <span key={p.n} className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-brand-950 ring-2 ring-brand-950 ${p.c}`}>
                {p.n}
              </span>
            ))}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-[10px] font-semibold ring-2 ring-brand-950">+123</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            {["mic", "videocam", "chat"].map((ic) => (
              <span key={ic} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                <Icon name={ic} className="text-sm" />
              </span>
            ))}
          </div>
        </div>

        {/* Obrolan yang bergantian muncul */}
        <div className="pointer-events-none absolute -left-4 bottom-14 w-44 space-y-2">
          {chat.map((c) => (
            <div key={c.nama} className="lg-chat rounded-xl bg-white px-3 py-2 text-slate-800 shadow-lg" style={{ animationDelay: c.delay, position: "absolute", bottom: 0, left: 0, width: "100%" }}>
              <p className="text-[10px] font-bold text-brand-700">{c.nama}</p>
              <p className="text-xs">{c.teks}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="lg-slide relative mt-6 text-xs text-white/60" style={{ animationDelay: "300ms" }}>
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
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

  return (
    <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/95 shadow-2xl shadow-brand-950/50 backdrop-blur-xl lg:grid lg:grid-cols-[1.05fr_1fr] lg:bg-transparent lg:backdrop-blur-none">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <RuangWebinar />

      <div className="flex flex-col justify-center bg-white/95 p-6 backdrop-blur-xl sm:p-10 lg:bg-white/95">
        <div className="lg-form lg:hidden mb-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
          <span className="lg-live h-1.5 w-1.5 rounded-full bg-red-500" />
          Kelas digital sedang berjalan
        </div>

        <div className="lg-form">
          <h1 className="font-display text-2xl font-extrabold text-slate-900">Masuk ke ruang belajar</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gunakan akun dari sekolah untuk bergabung ke kelas dan webinar Anda.
          </p>
        </div>

        <form
          action={formAction}
          onSubmit={() => setAttempt((a) => a + 1)}
          className="mt-7 space-y-4"
        >
          <div className="lg-form" style={{ animationDelay: "80ms" }}>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <div className="group relative">
              <Icon name="person" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-brand-600" />
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="nama@email.com" className={input} />
            </div>
          </div>

          <div className="lg-form" style={{ animationDelay: "160ms" }}>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Kata sandi
            </label>
            <div className="group relative">
              <Icon name="lock" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-slate-400 transition-colors group-focus-within:text-brand-600" />
              <input id="password" name="password" type={showPw ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className={`${input} pr-12`} />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              >
                <Icon name={showPw ? "visibility_off" : "visibility"} className="text-xl" />
              </button>
            </div>
          </div>

          {state.error && (
            <div key={attempt} role="alert" className="lg-shake flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              <Icon name="error" className="mt-0.5 text-base" filled />
              {state.error}
            </div>
          )}

          <div className="lg-form" style={{ animationDelay: "240ms" }}>
            <button
              type="submit"
              disabled={pending}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {pending ? (
                <>
                  <span className="lg-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                  Memeriksa akun…
                </>
              ) : (
                <>
                  Masuk ke kelas
                  <Icon name="login" className="text-lg transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
