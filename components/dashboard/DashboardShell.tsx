"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn, roleLabel } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { logoutAction } from "@/lib/actions/auth";

type Role = "SISWA" | "GURU" | "ADMIN";
type User = { nama: string; role: Role };

const LINKS: Record<Role, { href: string; label: string; icon: string }[]> = {
  SISWA: [
    { href: "/dashboard/siswa", label: "Ringkasan", icon: "dashboard" },
    { href: "/dashboard/siswa/kegiatan", label: "Kegiatan", icon: "event_available" },
    { href: "/dashboard/siswa/riwayat", label: "Riwayat", icon: "history" },
    { href: "/dashboard/siswa/jadwal", label: "Jadwal", icon: "calendar_month" },
    { href: "/dashboard/siswa/materi", label: "Materi", icon: "menu_book" },
    { href: "/dashboard/siswa/profil", label: "Profil", icon: "person" },
  ],
  GURU: [
    { href: "/dashboard/guru", label: "Ringkasan", icon: "dashboard" },
    { href: "/dashboard/guru/kegiatan", label: "Kegiatan Saya", icon: "event_available" },
    { href: "/dashboard/guru/kegiatan/baru", label: "Buat Kegiatan", icon: "add_circle" },
  ],
  ADMIN: [
    { href: "/dashboard/admin", label: "Ringkasan", icon: "dashboard" },
    { href: "/dashboard/admin/kegiatan", label: "Kegiatan", icon: "event_available" },
    { href: "/dashboard/admin/mapel", label: "Mapel", icon: "menu_book" },
    { href: "/dashboard/admin/jurusan", label: "Jurusan", icon: "account_tree" },
    { href: "/dashboard/admin/kelas", label: "Kelas", icon: "groups" },
    { href: "/dashboard/admin/guru", label: "Akun Guru", icon: "manage_accounts" },
    { href: "/dashboard/admin/siswa", label: "Akun Siswa", icon: "person" },
  ],
};

const ROOTS = ["/dashboard/siswa", "/dashboard/guru", "/dashboard/admin"];

// Warna kartu ID tiap peran, mengikuti palet pastel beranda
const ROLE_TONE: Record<Role, { bg: string; fg: string }> = {
  SISWA: { bg: "#CFE7FF", fg: "#1E5FD8" },
  GURU: { bg: "#CDF3DD", fg: "#12823F" },
  ADMIN: { bg: "#E6DCFF", fg: "#6D35D6" },
};

// Lebar garis barcode pada kartu ID (px), sama seperti kartu guru di beranda
const BARCODE = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1] as const;

const CSS = `
.shell-dots {
  background-image: radial-gradient(#0F1B3D 1.2px, transparent 1.2px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 55%);
  mask-image: linear-gradient(to bottom, black 0%, transparent 55%);
}
.side-dots {
  background-image: radial-gradient(#fff 1.2px, transparent 1.2px);
  background-size: 20px 20px;
  -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 60%);
  mask-image: linear-gradient(to bottom, black 0%, transparent 60%);
}
.vinyl-spin { animation: vinyl-spin 9s linear infinite; }
.eq { transform-origin: bottom; animation: eq 1s ease-in-out infinite; }
.shell-main { animation: shell-in .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes vinyl-spin { to { transform: rotate(360deg); } }
@keyframes eq { 0%,100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
@keyframes shell-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  .vinyl-spin, .eq, .shell-main { animation: none !important; }
  .shell-drawer, .shell-backdrop { transition: none !important; }
}
`;

function inisial(nama: string) {
  return nama
    .replace(/,.*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
// Di latar navy, cincin fokus dibuat kuning agar tetap terlihat
const FOCUS_DARK =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC83D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1B3D]";

// Piringan hitam kuning yang berputar pelan, logo sekolah menjadi labelnya
function VinylLogo() {
  return (
    <span aria-hidden className="relative grid h-14 w-14 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="vinyl-spin absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="49" fill="#FFC83D" />
        {[44, 39, 34, 29].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#B87A00" strokeOpacity="0.45" strokeWidth="1" />
        ))}
        <path d="M50 8 A42 42 0 0 1 92 50" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 92 A42 42 0 0 1 8 50" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-kosgoro.jpeg"
        alt=""
        className="relative h-8 w-8 rounded-full border-2 border-[#0F1B3D] bg-white object-cover"
      />
    </span>
  );
}

function SidebarDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="side-dots absolute inset-0 opacity-[0.09]" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(30,120,230,0.55),transparent)]" />
    </div>
  );
}

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = LINKS[user.role];
  const tone = ROLE_TONE[user.role];

  // Menu aktif = kecocokan terpanjang, jadi "Buat Kegiatan" tidak ikut menyalakan "Kegiatan Saya"
  const activeHref = links.reduce<string | null>((best, link) => {
    const isRoot = ROOTS.includes(link.href);
    const match = isRoot
      ? pathname === link.href
      : pathname === link.href || pathname.startsWith(link.href + "/");
    if (!match) return best;
    return best === null || link.href.length > best.length ? link.href : best;
  }, null);
  const current = links.find((l) => l.href === activeHref);
  const currentLabel = current?.label ?? "Dashboard";
  const currentIcon = current?.icon ?? "dashboard";

  // Tutup menu saat pindah halaman
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Tombol Esc menutup menu, dan halaman di belakang tidak ikut bergulir
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const sidebar = (
    <div className="relative z-10 flex h-full flex-col">
      <Link
        href="/"
        className={cn("mb-7 flex items-center gap-3 rounded-2xl pr-10", FOCUS_DARK)}
        aria-label="Ke beranda SMK Kosgoro"
      >
        <VinylLogo />
        <div className="leading-tight">
          <span className="block font-display text-lg font-extrabold text-white">SMK Kosgoro</span>
          <span className="block text-xs font-semibold text-[#8CCBFF]">Pembelajaran Digital</span>
        </div>
      </Link>

      <nav aria-label="Menu dashboard" className="-mx-2 flex-1 space-y-2 overflow-y-auto px-2 pb-2 pt-1">
        {links.map((link) => {
          const active = link.href === activeHref;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border-2 p-1.5 pr-3 text-sm font-bold transition-all duration-150",
                FOCUS_DARK,
                active
                  ? "border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#8CCBFF]"
                  : "border-transparent text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 transition-colors",
                  active
                    ? "border-[#0F1B3D] bg-white text-[#0F1B3D]"
                    : "border-white/15 bg-white/5 text-white/85 group-hover:border-white/30"
                )}
              >
                <Icon name={link.icon} className="text-xl" filled={active} />
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 space-y-3 pt-2">
        {/* Kartu ID: peran menentukan warna, barcode hanya hiasan */}
        <div
          className="overflow-hidden rounded-2xl border-2 border-[#0F1B3D] text-[#0F1B3D] shadow-[4px_4px_0_0_#FFC83D]"
          style={{ backgroundColor: tone.bg }}
        >
          <div className="flex items-center gap-3 p-3">
            <span
              aria-hidden
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] bg-white font-display text-sm font-extrabold"
            >
              {inisial(user.nama)}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-extrabold">{user.nama}</span>
              <span className="mt-1 inline-flex rounded-full border-2 border-[#0F1B3D] bg-white px-2 py-px text-[11px] font-bold">
                {roleLabel[user.role]}
              </span>
            </span>
          </div>
          <div
            aria-hidden
            className="flex items-end justify-between gap-[2px] border-t-2 border-dashed border-[#0F1B3D]/40 bg-white/60 px-3 py-2"
          >
            {BARCODE.map((w, i) => (
              <span key={i} className="block h-5 bg-[#0F1B3D]" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/30 px-3.5 py-2.5 text-sm font-bold text-white transition-colors duration-150",
              "hover:border-white hover:bg-[#E5372E] active:scale-[0.98]",
              FOCUS_DARK
            )}
          >
            <Icon name="logout" className="text-xl" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DCF0FF] via-[#EAF6FF] to-[#F5FAFF]">
      <style>{CSS}</style>

      <a
        href="#konten-utama"
        className="sr-only z-[60] rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-2 text-sm font-bold text-[#0F1B3D] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lompat ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 overflow-hidden border-r-2 border-[#0F1B3D] bg-[#0F1B3D] p-4 lg:block">
        <SidebarDecor />
        {sidebar}
      </aside>

      {/* Menu geser untuk mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-[visibility] duration-300 lg:hidden",
          menuOpen ? "visible" : "invisible"
        )}
      >
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden
          className={cn(
            "shell-backdrop absolute inset-0 bg-[#0F1B3D]/60 backdrop-blur-[2px] transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu dashboard"
          className={cn(
            "shell-drawer absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-hidden border-r-2 border-white/20 bg-[#0F1B3D] p-4 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarDecor />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu"
            className={cn(
              "absolute right-3 top-4 z-20 grid h-9 w-9 place-items-center rounded-lg border-2 border-white/30 text-white transition-colors hover:bg-white/10",
              FOCUS_DARK
            )}
          >
            <Icon name="close" className="text-xl" />
          </button>
          {sidebar}
        </aside>
      </div>

      <div className="relative lg:pl-64">
        {/* kisi titik tipis di latar, sama seperti hero beranda */}
        <div
          aria-hidden
          className="shell-dots pointer-events-none absolute inset-x-0 top-0 h-80 opacity-[0.1]"
        />

        {/* Header melayang: kapsul dengan ubin halaman aktif */}
        <div className="sticky top-0 z-20 px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4">
          <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border-2 border-[#0F1B3D] bg-white/95 p-2 pr-3 shadow-[4px_4px_0_0_#0F1B3D] backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Buka menu"
                aria-expanded={menuOpen}
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] text-white transition-all duration-150 lg:hidden",
                  "hover:bg-[#17408F] active:scale-95",
                  FOCUS
                )}
              >
                <Icon name="menu" className="text-2xl" />
              </button>

              <span
                aria-hidden
                className="hidden h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] sm:grid"
              >
                <Icon name={currentIcon} className="text-2xl" filled />
              </span>

              <div className="min-w-0 leading-tight">
                <p className="hidden items-center gap-1 text-xs font-semibold text-[#0F1B3D]/55 sm:flex">
                  Dashboard
                  <Icon name="chevron_right" className="text-sm" />
                  {roleLabel[user.role]}
                </p>
                <p className="flex items-center gap-2.5">
                  <span className="truncate font-display text-lg font-extrabold text-[#0F1B3D] sm:text-xl">
                    {currentLabel}
                  </span>
                  {/* penanda "sedang dibuka", senada tema piringan hitam */}
                  <span aria-hidden className="flex h-4 shrink-0 items-end gap-[2px]">
                    {[0, 0.3, 0.6].map((delay) => (
                      <span
                        key={delay}
                        className="eq block h-4 w-[3px] rounded-full bg-[#1E78E6]"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/"
                className={cn(
                  "hidden items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-3.5 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 sm:inline-flex",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#CFE7FF]/60 hover:shadow-[1px_1px_0_0_#0F1B3D]",
                  "active:translate-x-[3px] active:translate-y-[3px] active:shadow-none",
                  FOCUS
                )}
              >
                <Icon name="home" className="text-lg" />
                Beranda
              </Link>
              <span
                aria-label={user.nama}
                title={user.nama}
                className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#0F1B3D] font-display text-sm font-extrabold text-[#0F1B3D]"
                style={{ backgroundColor: tone.bg }}
              >
                {inisial(user.nama)}
              </span>
            </div>
          </header>
        </div>

        <main
          id="konten-utama"
          key={pathname}
          className="shell-main relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}