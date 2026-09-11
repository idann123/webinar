import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Ringkasan Siswa" };

export default async function SiswaDashboardPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({
    where: { userId: session.userId },
    include: { kelas: { include: { jurusan: true } } },
  });

  const [totalKegiatan, belumMulai, berlangsung, selesai, diikuti] = await Promise.all([
    db.kegiatan.count(),
    db.kegiatan.count({ where: { status: "BELUM_MULAI" } }),
    db.kegiatan.count({ where: { status: "BERLANGSUNG" } }),
    db.kegiatan.count({ where: { status: "SELESAI" } }),
    db.pendaftaran.count({ where: { siswaId: siswa.id } }),
  ]);

  const terdekat = await db.kegiatan.findFirst({
    where: { status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } },
    orderBy: { tanggal: "asc" },
    include: { mapel: true, guru: { include: { user: true } } },
  });

  const cards = [
    { label: "Total Kegiatan", value: totalKegiatan, icon: "event_available", color: "bg-brand-100 text-brand-700" },
    { label: "Belum Mulai", value: belumMulai, icon: "schedule", color: "bg-sky-100 text-sky-700" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", color: "bg-emerald-100 text-emerald-700" },
    { label: "Selesai", value: selesai, icon: "check_circle", color: "bg-slate-100 text-slate-600" },
    { label: "Yang Saya Ikuti", value: diikuti, icon: "how_to_reg", color: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Halo, {session.nama.split(" ")[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {siswa.kelas.namaKelas} • {siswa.kelas.jurusan.namaJurusan}
        </p>
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
        {terdekat && (
          <div className="card p-6">
            <h2 className="font-display text-base font-bold text-slate-900">Kegiatan Terdekat</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-brand-700">
              {terdekat.mapel.namaMapel}
            </p>
            <p className="mt-2 font-display text-lg font-bold text-slate-800">
              {terdekat.judulPembelajaran}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {terdekat.guru.user.nama} • {terdekat.tanggal.toISOString().slice(0, 10)}
            </p>
            <Link href={`/dashboard/siswa/kegiatan/${terdekat.id}`} className="btn-primary mt-4 w-full">
              Lihat Detail
            </Link>
          </div>
        )}

        <div className="card p-6">
          <h2 className="font-display text-base font-bold text-slate-900">Aksi Cepat</h2>
          <div className="mt-4 space-y-2.5">
            <Link href="/dashboard/siswa/kegiatan" className="btn-primary w-full">
              <Icon name="event_available" className="text-lg" />
              Jelajahi Kegiatan
            </Link>
            <Link href="/dashboard/siswa/riwayat" className="btn-outline w-full">
              <Icon name="history" className="text-lg" />
              Lihat Riwayat Belajar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}