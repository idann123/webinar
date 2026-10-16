import Link from "next/link";
import type { CSSProperties } from "react";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Ringkasan Admin" };

// Semua animasi ada di file ini (CSS murni, tanpa file tambahan)
const css = `
@property --adm-n { syntax: "<integer>"; inherits: false; initial-value: 0; }

@keyframes adm-rise  { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; } }
@keyframes adm-count { from { --adm-n: 0; } to { --adm-n: var(--to); } }
@keyframes adm-sheen { from { transform: translateX(-120%) skewX(-20deg); } to { transform: translateX(260%) skewX(-20deg); } }

.adm-reveal { animation: adm-rise 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }

/* Angka naik dari 0 (angka asli tetap ada di dalam span untuk screen reader) */
.adm-count { counter-reset: adm-n var(--adm-n); animation: adm-count 1s cubic-bezier(0.22, 1, 0.36, 1) both; font-variant-numeric: tabular-nums; }
.adm-count::before { content: counter(adm-n); }

/* Kartu interaktif */
.adm-card {
  position: relative; overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease, border-color 0.2s ease, background-color 0.2s ease;
}
.adm-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px -12px rgb(15 23 42 / 0.22); }
.adm-card:active { transform: translateY(-1px) scale(0.98); }
.adm-card::after {
  content: ""; position: absolute; inset: 0 auto 0 0; width: 35%; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.55), transparent);
  transform: translateX(-120%) skewX(-20deg);
}
.adm-card:hover::after { animation: adm-sheen 0.8s ease; }

@media (prefers-reduced-motion: reduce) {
  .adm-reveal, .adm-count, .adm-card, .adm-card::after { animation: none !important; transition: none !important; }
  .adm-card:hover { transform: none; }
}
`;

const STAGGER = 60;
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

  await syncKegiatanStatuses();

  const [
    totalGuru,
    totalSiswa,
    totalKegiatan,
    totalPendaftar,
    totalJurusan,
    totalKelas,
    totalMapel,
    kegiatanAktif,
  ] = await Promise.all([
    db.guru.count(),
    db.siswa.count(),
    db.kegiatan.count(),
    db.pendaftaran.count(),
    db.jurusan.count(),
    db.kelas.count(),
    db.mapel.count(),
    db.kegiatan.count({ where: { status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } } }),
  ]);

  const stats = [
    { label: "Guru", value: totalGuru, icon: "school", color: "bg-brand-100 text-brand-700", href: "/dashboard/admin/guru" },
    { label: "Siswa", value: totalSiswa, icon: "group", color: "bg-sky-100 text-sky-700", href: "/dashboard/admin/siswa" },
    { label: "Kegiatan", value: totalKegiatan, icon: "event_available", color: "bg-emerald-100 text-emerald-700", href: "/dashboard/admin/kegiatan" },
    { label: "Kegiatan Aktif", value: kegiatanAktif, icon: "play_circle", color: "bg-amber-100 text-amber-700", href: "/dashboard/admin/kegiatan" },
    { label: "Total Pendaftar", value: totalPendaftar, icon: "how_to_reg", color: "bg-violet-100 text-violet-700", href: "/dashboard/admin/kegiatan" },
    { label: "Jurusan", value: totalJurusan, icon: "account_balance", color: "bg-rose-100 text-rose-700", href: "/dashboard/admin/jurusan" },
    { label: "Kelas", value: totalKelas, icon: "meeting_room", color: "bg-teal-100 text-teal-700", href: "/dashboard/admin/kelas" },
    { label: "Mapel", value: totalMapel, icon: "menu_book", color: "bg-slate-100 text-slate-600", href: "/dashboard/admin/mapel" },
  ];

  const menu = [
    { href: "/dashboard/admin/jurusan", icon: "account_balance", title: "Data Jurusan", desc: "Kelola jurusan kejuruan" },
    { href: "/dashboard/admin/kelas", icon: "meeting_room", title: "Data Kelas", desc: "Susun kelas tiap jurusan" },
    { href: "/dashboard/admin/mapel", icon: "menu_book", title: "Data Mapel", desc: "Daftar mata pelajaran" },
    { href: "/dashboard/admin/kegiatan", icon: "event_available", title: "Pantau Kegiatan", desc: "Rekap semua kegiatan" },
  ];

  return (
    <div className="space-y-8">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="adm-reveal">
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Panel Admin SMK Kosgoro
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selamat datang, {session.nama}. Kelola master data, akun, dan pantau seluruh kegiatan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Link
            key={s.label}
            href={s.href}
            style={delay(100 + i * STAGGER)}
            className="adm-reveal adm-card card group p-4 hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${s.color}`}>
              <Icon name={s.icon} className="text-xl" filled />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">
              <span
                className="adm-count"
                style={{ "--to": s.value, animationDelay: `${150 + i * STAGGER}ms` } as CSSProperties}
              >
                <span className="sr-only">{s.value}</span>
              </span>
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
              {s.label}
              <Icon name="chevron_right" className="text-sm transition-transform duration-200 group-hover:translate-x-1" />
            </p>
          </Link>
        ))}
      </div>

      <div className="adm-reveal card p-6" style={delay(100 + stats.length * STAGGER)}>
        <h2 className="font-display text-base font-bold text-slate-900">Menu Kelola</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menu.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="adm-card group rounded-xl border border-slate-200 p-4 hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <Icon name={m.icon} className="text-2xl text-brand-600 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110" />
              <p className="mt-2 font-display font-bold text-slate-900">{m.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}