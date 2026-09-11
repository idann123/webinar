import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-kosgoro.jpeg"
            alt="Logo SMK Kosgoro"
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <span className="font-display text-lg font-extrabold text-slate-900">
            SMK Kosgoro
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-brand-700"
        >
          Kembali ke Beranda
        </Link>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  );
}