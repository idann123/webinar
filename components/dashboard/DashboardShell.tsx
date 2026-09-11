"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn, roleLabel } from "@/lib/utils";
import { Icon } from "@/components/Icon";
import { logoutAction } from "@/lib/actions/auth";

type User = { nama: string; role: "SISWA" | "GURU" | "ADMIN" };

const LINKS: Record<User["role"], { href: string; label: string; icon: string }[]> = {
  SISWA: [
    { href: "/dashboard/siswa", label: "Ringkasan", icon: "dashboard" },
    { href: "/dashboard/siswa/kegiatan", label: "Kegiatan", icon: "event_available" },
    { href: "/dashboard/siswa/riwayat", label: "Riwayat", icon: "history" },
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

export function DashboardShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = LINKS[user.role];

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-kosgoro.jpeg"
          alt="Logo SMK Kosgoro"
          className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
        />
        <span className="font-display text-base font-extrabold text-slate-900">
          SMK Kosgoro
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon name={link.icon} className="text-xl" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4">
        <p className="px-1 text-sm font-semibold text-slate-800">{user.nama}</p>
        <p className="px-1 pb-3 text-xs text-slate-500">{roleLabel[user.role]}</p>
        <form action={logoutAction}>
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">
            <Icon name="logout" className="text-xl" />
            Keluar
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-4 lg:block">
        {sidebar}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white p-4 shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Icon name="menu" className="text-2xl" />
          </button>
          <p className="hidden text-sm text-slate-500 sm:block">
            Dashboard <span className="text-slate-300">/</span> {roleLabel[user.role]}
          </p>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {user.nama.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}