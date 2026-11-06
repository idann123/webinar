"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/Icon";

export type NavUser = { nama: string; role: "SISWA" | "GURU" | "ADMIN" } | null;

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/kegiatan", label: "Kegiatan" },
  { href: "/panduan", label: "Panduan" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
];

const ROLE_LABEL: Record<NonNullable<NavUser>["role"], string> = {
  SISWA: "Siswa",
  GURU: "Guru",
  ADMIN: "Admin",
};

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

export function Navbar({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Indikator hover yang meluncur antar link (desktop)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  const showPill = (i: number) => {
    const el = itemRefs.current[i];
    if (!el) return;
    setPill({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
  };
  const hidePill = () => setPill((p) => ({ ...p, visible: false }));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Tutup menu saat pindah halaman atau menekan Escape
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const dashboardHref = user ? `/dashboard/${user.role.toLowerCase()}` : "/login";
  const initial = user ? user.nama.trim().charAt(0).toUpperCase() || "?" : "";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="pointer-events-none sticky top-0 z-50 h-0">
      <div className="px-3 pt-3 sm:px-6 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto rounded-2xl ring-1 backdrop-blur-xl",
          "transition-all duration-300 ease-out motion-reduce:transition-none",
          scrolled
            ? "max-w-5xl bg-white/90 ring-slate-200 shadow-[0_12px_32px_-14px_rgba(15,27,61,0.35)]"
            : "max-w-6xl bg-white/95 ring-[#0F1B3D]/10 shadow-[0_12px_32px_-14px_rgba(15,27,61,0.3)]"
        )}
      >
        <div className="flex items-center justify-between gap-4 px-3 py-2 sm:px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Logo SMK Kosgoro"
              className="h-10 w-10 object-contain"
            />
            <div className="leading-tight">
              <p className="font-display text-[15px] font-extrabold text-[#0F1B3D]">
                SMK Kosgoro
              </p>
              <p className="text-xs font-medium text-brand-700">
                Pembelajaran digital
              </p>
            </div>
          </Link>

          {/* Navigasi desktop */}
          <nav
            aria-label="Menu utama"
            className="relative hidden items-center md:flex"
            onMouseLeave={hidePill}
          >
            <span
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-y-0 rounded-xl bg-[#0F1B3D]/[0.06]",
                "transition-[left,width,opacity] duration-300 ease-out motion-reduce:transition-none",
                pill.visible ? "opacity-100" : "opacity-0"
              )}
              style={{ left: pill.left, width: pill.width }}
            />
            {LINKS.map((l, i) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => showPill(i)}
                  onFocus={() => showPill(i)}
                  onBlur={hidePill}
                  className={cn(
                    "relative rounded-xl px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D]",
                    active
                      ? "font-semibold text-[#0F1B3D]"
                      : "font-medium text-slate-600 hover:text-[#0F1B3D]"
                  )}
                >
                  {l.label}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#FFC83D] ring-1 ring-[#0F1B3D]/20"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Aksi desktop */}
          <div className="hidden items-center md:flex">
            {user ? (
              <Link
                href={dashboardHref}
                className="group flex items-center gap-2.5 rounded-xl bg-[#0F1B3D] py-1.5 pl-1.5 pr-4 text-white transition-colors hover:bg-[#182a5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-2"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFC83D] font-display text-sm font-extrabold text-[#0F1B3D]">
                  {initial}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">
                    Dashboard {ROLE_LABEL[user.role].toLowerCase()}
                  </span>
                  <span className="block max-w-[140px] truncate text-xs text-white/70">
                    {user.nama}
                  </span>
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group flex items-center gap-3 rounded-xl bg-[#0F1B3D] py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#182a5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] focus-visible:ring-offset-2"
              >
                Masuk
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#FFC83D] text-[#0F1B3D]">
                  <ArrowIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
              </Link>
            )}
          </div>

          {/* Tombol menu mobile */}
          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 place-items-center rounded-xl bg-[#0F1B3D]/[0.06] text-[#0F1B3D] transition-colors hover:bg-[#0F1B3D]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B3D] md:hidden"
          >
            <Icon name={open ? "close" : "menu"} className="text-2xl" />
          </button>
        </div>

        {/* Menu mobile: terbuka dari dalam bar yang sama */}
        <div
          id="menu-mobile"
          aria-hidden={!open}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none md:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="overflow-hidden">
            <nav aria-label="Menu utama seluler" className="px-3 pb-3 pt-1">
              <div className="flex flex-col gap-0.5 border-t border-slate-200 pt-2">
                {LINKS.map((l, i) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      tabIndex={open ? 0 : -1}
                      aria-current={active ? "page" : undefined}
                      style={{ transitionDelay: open ? `${80 + i * 45}ms` : "0ms" }}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 font-display text-2xl font-bold",
                        "transition-all duration-300 motion-reduce:transition-none",
                        open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                        active
                          ? "bg-[#0F1B3D]/[0.06] text-[#0F1B3D]"
                          : "text-slate-500 hover:bg-[#0F1B3D]/[0.04] hover:text-[#0F1B3D]"
                      )}
                    >
                      {l.label}
                      {active && (
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 rounded-full bg-[#FFC83D] ring-1 ring-[#0F1B3D]/20"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={dashboardHref}
                tabIndex={open ? 0 : -1}
                style={{ transitionDelay: open ? `${80 + LINKS.length * 45}ms` : "0ms" }}
                className={cn(
                  "mt-3 flex items-center justify-between rounded-xl bg-[#0F1B3D] p-1.5 pl-4 text-white",
                  "transition-all duration-300 motion-reduce:transition-none",
                  open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                )}
              >
                {user ? (
                  <>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold">
                        Dashboard {ROLE_LABEL[user.role].toLowerCase()}
                      </span>
                      <span className="block max-w-[200px] truncate text-xs text-white/70">
                        {user.nama}
                      </span>
                    </span>
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#FFC83D] font-display text-base font-extrabold text-[#0F1B3D]">
                      {initial}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold">Masuk ke akun</span>
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#FFC83D] text-[#0F1B3D]">
                      <ArrowIcon className="h-4 w-4" />
                    </span>
                  </>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}