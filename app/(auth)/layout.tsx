import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#DCF0FF]">
      {/* latar: foto sekolah samar + gradasi biru muda + kisi titik */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kgr.jpg"
          alt=""
          className="h-full w-full scale-105 object-cover object-center opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9E6FF]/90 via-[#DCF0FF]/92 to-[#EAF6FF]" />
        <div className="absolute -left-40 -bottom-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.6),transparent)]" />
        <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-white/50" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
          }}
        />
      </div>

      <header className="relative z-10 w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-4 focus-visible:ring-offset-[#DCF0FF]"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white shadow-[3px_3px_0_0_#0F1B3D] transition-transform duration-200 group-hover:-rotate-3 motion-reduce:transition-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-kosgoro.jpeg"
                alt="Logo SMK Kosgoro"
                className="h-9 w-9 object-contain"
              />
            </span>
            <div className="leading-tight">
              <span className="block font-display text-lg font-extrabold text-[#0F1B3D]">SMK Kosgoro</span>
              <span className="block text-sm font-medium text-[#1E78E6]">Pembelajaran digital</span>
            </div>
          </Link>

          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-3.5 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none sm:px-4"
          >
            <Icon
              name="arrow_back"
              className="text-lg transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            <span className="hidden sm:inline">Kembali ke Beranda</span>
            <span className="sm:hidden">Beranda</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}