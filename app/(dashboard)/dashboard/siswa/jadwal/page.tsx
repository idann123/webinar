import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Jadwal Pembelajaran" };

export default async function SiswaJadwalPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  await syncKegiatanStatuses();

  const [pendaftaran, semuaMendatang] = await Promise.all([
    db.pendaftaran.findMany({
      where: { siswaId: siswa.id },
      include: {
        kegiatan: {
          include: {
            mapel: true,
            guru: { include: { user: true } },
          },
        },
      },
      orderBy: { kegiatan: { tanggal: "asc" } },
    }),
    db.kegiatan.findMany({
      where: { status: { in: ["BELUM_MULAI", "BERLANGSUNG"] } },
      include: {
        mapel: true,
        guru: { include: { user: true } },
      },
      orderBy: { tanggal: "asc" },
    }),
  ]);

  const registeredKegiatanIds = new Set(pendaftaran.map((p) => p.kegiatanId));
  const sesiBerlangsung = pendaftaran.filter((p) => p.kegiatan.status === "BERLANGSUNG");
  const sesiMendatang = pendaftaran.filter((p) => p.kegiatan.status === "BELUM_MULAI");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Jadwal Pembelajaran
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau waktu webinar dan kelas online yang Anda ikuti agar tidak terlewat.
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Icon name="event_upcoming" className="text-2xl" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-slate-900">
              {pendaftaran.length}
            </p>
            <p className="text-xs font-medium text-slate-500">Sesi Terdaftar</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Icon name="play_circle" className="text-2xl" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-slate-900">
              {sesiBerlangsung.length}
            </p>
            <p className="text-xs font-medium text-slate-500">Sedang Berlangsung</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <Icon name="schedule" className="text-2xl" />
          </span>
          <div>
            <p className="font-display text-2xl font-extrabold text-slate-900">
              {sesiMendatang.length}
            </p>
            <p className="text-xs font-medium text-slate-500">Sesi Mendatang</p>
          </div>
        </div>
      </div>

      {/* Jadwal Terdaftar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Jadwal Sesi Anda
          </h2>
          <Link
            href="/dashboard/siswa/kegiatan"
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            Lihat Semua Kegiatan →
          </Link>
        </div>

        {pendaftaran.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <Icon name="calendar_today" className="text-4xl text-slate-300" />
            <p className="font-medium text-slate-600">Belum ada jadwal kegiatan terdaftar.</p>
            <p className="max-w-sm text-xs text-slate-400">
              Daftar kegiatan pembelajaran yang tersedia untuk mengisi jadwal belajar Anda.
            </p>
            <Link href="/dashboard/siswa/kegiatan" className="btn-primary mt-2">
              Jelajahi Katalog Kegiatan
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {pendaftaran.map((p) => {
              const k = p.kegiatan;
              const isBerlangsung = k.status === "BERLANGSUNG";
              return (
                <div
                  key={p.id}
                  className={`card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                    isBerlangsung ? "border-emerald-300 ring-2 ring-emerald-500/20" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    {/* Kotak Tanggal */}
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {k.tanggal.toLocaleDateString("id-ID", { month: "short" })}
                      </span>
                      <span className="font-display text-xl font-extrabold leading-none">
                        {k.tanggal.getDate()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                          {k.mapel.namaMapel}
                        </span>
                        <StatusBadge status={k.status} />
                      </div>
                      <h3 className="mt-1 line-clamp-1 font-display text-base font-bold text-slate-900">
                        {k.judulPembelajaran}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="schedule" className="text-sm text-slate-400" />
                          {k.waktuMulai} - {k.waktuSelesai} WIB
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Icon name="person" className="text-sm text-slate-400" />
                          {k.guru.user.nama}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/siswa/kegiatan/${k.id}`}
                    className={`shrink-0 ${isBerlangsung ? "btn-primary" : "btn-outline"}`}
                  >
                    <Icon name={isBerlangsung ? "play_arrow" : "visibility"} className="text-lg" />
                    {isBerlangsung ? "Masuk Sesi" : "Lihat Detail"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sesi Lain yang Akan Datang di Sekolah */}
      {semuaMendatang.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Jadwal Pembelajaran Lainnya di SMK Kosgoro
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {semuaMendatang.slice(0, 4).map((k) => {
              const sudahDaftar = registeredKegiatanIds.has(k.id);
              return (
                <div key={k.id} className="card flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                        {k.mapel.namaMapel}
                      </span>
                      <StatusBadge status={k.status} />
                    </div>
                    <h4 className="mt-2 line-clamp-2 font-display text-base font-bold text-slate-900">
                      {k.judulPembelajaran}
                    </h4>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatTanggal(k.tanggal)} • {k.waktuMulai} WIB
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">{k.guru.user.nama}</span>
                    <Link
                      href={`/dashboard/siswa/kegiatan/${k.id}`}
                      className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      {sudahDaftar ? "Buka Kegiatan →" : "Detail & Daftar →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
