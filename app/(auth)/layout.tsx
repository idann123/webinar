import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kgr.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full scale-105 object-cover object-center blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/90 via-brand-900/85 to-brand-800/90" />
      </div>

      <header className="relative z-10 w-full border-b border-white/15 bg-brand-900/25 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="group flex items-center gap-3 focus:outline-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-kosgoro.jpeg"
              alt="Logo SMK Kosgoro"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/30 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="leading-tight">
              <span className="block font-display text-base font-extrabold text-white transition-colors group-hover:text-brand-200">
                SMK Kosgoro
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-brand-200">
                Pembelajaran Digital
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-2 pr-3.5 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-white/40 hover:bg-white/20 sm:gap-2.5 sm:py-2 sm:pl-2.5 sm:pr-4 sm:text-sm"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-200 group-hover:bg-brand-600 group-hover:text-white sm:h-7 sm:w-7">
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