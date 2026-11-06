import Link from "next/link";
import { Icon } from "@/components/Icon";

const NAV_LINKS = [
  { href: "/", label: "Beranda", icon: "home" },
  { href: "/kegiatan", label: "Kegiatan", icon: "event_available" },
  { href: "/panduan", label: "Panduan", icon: "menu_book" },
  { href: "/faq", label: "FAQ", icon: "help" },
];

const ACCOUNT_LINKS = [
  { href: "/login", label: "Masuk", icon: "login" },
  { href: "/kontak", label: "Hubungi Kami", icon: "mail" },
];

// Tautan berbentuk pil bergaya neo
function Pill({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-3.5 py-2 text-sm font-bold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#FFF6D6] hover:shadow-[1px_1px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none"
    >
      <Icon name={icon} className="text-lg text-[#1E78E6]" filled />
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t-2 border-[#0F1B3D] bg-[#CFE7FF]">
      {/* kisi titik halus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-5 pt-10 sm:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:items-stretch">
          {/* Kartu identitas (putih, terang seperti kartu lain) */}
          <div className="flex flex-col justify-between gap-5 rounded-3xl border-2 border-[#0F1B3D] bg-white p-5 shadow-[5px_5px_0_0_#0F1B3D] sm:p-6 md:col-span-7">
            <div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-kosgoro.jpeg"
                  alt="Logo SMK Kosgoro"
                  className="h-12 w-12 object-contain"
                />
                <div className="leading-tight">
                  <p className="font-display text-lg font-extrabold text-[#0F1B3D]">SMK Kosgoro</p>
                  <p className="text-sm font-medium text-[#1E78E6]">Pembelajaran digital</p>
                </div>
              </div>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#0F1B3D]/70">
                Platform pembelajaran digital yang menghubungkan siswa, guru, dan
                sekolah dalam satu wadah. Lihat kegiatan pembelajaran, daftar, dan
                akses materi kapan saja, di mana saja.
              </p>
            </div>

            <div>
              <Link
                href="/kegiatan"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0_0_#FFC83D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none"
              >
                <Icon name="event_available" className="text-lg text-[#FFC83D]" filled />
                Lihat kegiatan
              </Link>
            </div>
          </div>

          {/* Kartu tautan (kuning): navigasi + akun jadi satu */}
          <div className="rounded-3xl border-2 border-[#0F1B3D] bg-[#FFE08A] p-5 shadow-[5px_5px_0_0_#0F1B3D] sm:p-6 md:col-span-5">
            <nav aria-label="Navigasi footer">
              <h4 className="font-display text-xs font-extrabold text-[#0F1B3D]">Navigasi</h4>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Pill {...l} />
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-label="Akun dan kontak"
              className="mt-5 border-t-2 border-dashed border-[#0F1B3D]/25 pt-5"
            >
              <h4 className="font-display text-xs font-extrabold text-[#0F1B3D]">Akun</h4>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {ACCOUNT_LINKS.map((l) => (
                  <li key={l.href}>
                    <Pill {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* baris bawah */}
        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t-2 border-[#0F1B3D]/15 pt-4 text-xs text-[#0F1B3D]/70 sm:flex-row">
          <p>© {new Date().getFullYear()} SMK Kosgoro. Hak cipta dilindungi.</p>

          <div className="flex items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-white py-0.5 pl-0.5 pr-3 font-bold text-[#0F1B3D]">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#FFC83D]">
                <Icon name="school" className="text-xs" filled />
              </span>
              Website Pembelajaran Digital
            </p>
            <Link
              href="#"
              aria-label="Kembali ke atas"
              className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] text-[#FFC83D] shadow-[2px_2px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_#FFC83D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transition-none"
            >
              <Icon name="arrow_upward" className="text-lg" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}