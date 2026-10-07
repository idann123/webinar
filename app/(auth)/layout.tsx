import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <header className="relative z-10 w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="group flex items-center gap-3 focus:outline-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-kosgoro.jpeg"
              alt="Logo SMK Kosgoro"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="leading-tight">
              <span className="block font-display text-base font-extrabold text-slate-900 transition-colors group-hover:text-brand-700">
                SMK Kosgoro
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-700">
                Pembelajaran Digital
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-brand-300 hover:bg-brand-50/60 hover:text-brand-700 hover:shadow-sm sm:gap-2.5 sm:py-2 sm:pl-2.5 sm:pr-4 sm:text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all duration-200 group-hover:bg-brand-600 group-hover:text-white sm:h-7 sm:w-7">
              <Icon
                name="arrow_back"
                className="text-sm transition-transform duration-200 group-hover:-translate-x-0.5 sm:text-base"
              />
            </span>
            <span className="hidden sm:inline">Kembali ke Beranda</span>
            <span className="sm:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}