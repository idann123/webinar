import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Ringkasan Admin" };

export default async function AdminDashboardPage() {
  const session = await requireRole("ADMIN");

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Panel Admin SMK Kosgoro
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selamat datang, {session.nama}. Kelola master data, akun, dan pantau seluruh kegiatan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>
              <Icon name={s.icon} className="text-xl" filled />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">{s.value}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-500">
              {s.label}
              <Icon name="chevron_right" className="text-sm" />
            </p>
          </Link>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-base font-bold text-slate-900">Menu Kelola</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/dashboard/admin/jurusan", icon: "account_balance", title: "Data Jurusan", desc: "Kelola jurusan kejuruan" },
            { href: "/dashboard/admin/kelas", icon: "meeting_room", title: "Data Kelas", desc: "Susun kelas tiap jurusan" },
            { href: "/dashboard/admin/mapel", icon: "menu_book", title: "Data Mapel", desc: "Daftar mata pelajaran" },
            { href: "/dashboard/admin/kegiatan", icon: "event_available", title: "Pantau Kegiatan", desc: "Rekap semua kegiatan" },
          ].map((m) => (
            <Link key={m.href} href={m.href} className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-brand-300 hover:bg-brand-50/40">
              <Icon name={m.icon} className="text-2xl text-brand-600" />
              <p className="mt-2 font-display font-bold text-slate-900">{m.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{m.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}