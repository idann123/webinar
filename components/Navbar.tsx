"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

export function Navbar({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardHref = user ? `/dashboard/${user.role.toLowerCase()}` : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-kosgoro.jpeg"
            alt="Logo SMK Kosgoro"
            className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
          />
          <div className="leading-tight">
            <p className="font-display text-base font-extrabold text-slate-900">
              SMK Kosgoro
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-brand-700">
              Pembelajaran Digital
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={dashboardHref ?? "/login"} className="btn-primary">
              <Icon name="dashboard" className="text-lg" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
              >
                Masuk
              </Link>
              <Link href="/register" className="btn-primary">
                Daftar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="text-2xl" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <Link
                  href={dashboardHref ?? "/login"}
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  <Icon name="dashboard" className="text-lg" /> Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-outline w-full"
                  >
                    Masuk
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                    Daftar Akun
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}