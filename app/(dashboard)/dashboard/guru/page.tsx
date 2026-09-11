import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggalShort } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export const metadata = { title: "Ringkasan Guru" };

export default async function GuruDashboardPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirst({
    where: { userId: session.userId },
    include: { mapelGuru: { include: { mapel: true } } },
  });
  if (!guru) throw new Error("Data guru tidak ditemukan");

  const [totalKegiatan, belumMulai, berlangsung, selesai, jumlahPendaftar] = await Promise.all([
    db.kegiatan.count({ where: { guruId: guru.id } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "BELUM_MULAI" } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "BERLANGSUNG" } }),
    db.kegiatan.count({ where: { guruId: guru.id, status: "SELESAI" } }),
    db.pendaftaran.count({ where: { kegiatan: { guruId: guru.id } } }),
  ]);

  const terdekat = await db.kegiatan.findFirst({
    where: { guruId: guru.id, status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } },
    orderBy: { tanggal: "asc" },
    include: { mapel: true },
  });

  const cards = [
    { label: "Total Kegiatan", value: totalKegiatan, icon: "event_available", color: "bg-brand-100 text-brand-700" },
    { label: "Belum Mulai", value: belumMulai, icon: "schedule", color: "bg-sky-100 text-sky-700" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", color: "bg-emerald-100 text-emerald-700" },
    { label: "Selesai", value: selesai, icon: "check_circle", color: "bg-slate-100 text-slate-600" },
    { label: "Total Peserta", value: jumlahPendaftar, icon: "group", color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Halo, {session.nama.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {guru.mapelGuru.map((m) => m.mapel.namaMapel).join(", ")}
          </p>
        </div>
        <Link href="/dashboard/guru/kegiatan/baru" className="btn-primary">
          <Icon name="add_circle" className="text-xl" />
          Buat Kegiatan Baru
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-4 text-center">
            <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${c.color}`}>
              <Icon name={c.icon} className="text-xl" filled />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {terdekat ? (
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-slate-900">Kegiatan Terdekat</h2>
            <div className="mt-3">
              <StatusBadge status={terdekat.status} />
            </div>
            <p className="mt-2 font-display text-lg font-bold text-slate-800">
              {terdekat.judulPembelajaran}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {terdekat.mapel.namaMapel} • {formatTanggalShort(terdekat.tanggal)}, {terdekat.waktuMulai} WIB
            </p>
            <Link href={`/dashboard/guru/kegiatan/${terdekat.id}`} className="btn-primary mt-4 w-full">
              Kelola Kegiatan Ini
            </Link>
          </div>
        ) : (
          <div className="card flex flex-col items-center justify-center gap-2 p-8 text-center">
            <Icon name="event_busy" className="text-4xl text-slate-300" />
            <p className="text-sm text-slate-500">Belum ada kegiatan aktif.</p>
          </div>
        )}

        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-slate-900">Aksi Cepat</h2>
          <div className="mt-4 space-y-2.5">
            <Link href="/dashboard/guru/kegiatan" className="btn-outline w-full">
              <Icon name="event_available" className="text-lg" />
              Kelola Semua Kegiatan
            </Link>
            <Link href="/dashboard/guru/kegiatan/baru" className="btn-primary w-full">
              <Icon name="post_add" className="text-lg" />
              Buat Kegiatan Baru
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}