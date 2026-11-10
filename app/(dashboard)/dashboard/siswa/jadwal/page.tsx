import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Jadwal Pembelajaran" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;
const BTN_OUTLINE = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-3 text-sm font-bold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[2px_2px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

const CSS = `
.rec-dot { animation: rec 1.4s ease-in-out infinite; }
@keyframes rec { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .rec-dot { animation: none !important; } }
`;

// Selisih hari kalender antara hari ini dan tanggal kegiatan
function selisihHari(tanggal: Date) {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(tanggal);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function labelHari(tanggal: Date) {
  const n = selisihHari(tanggal);
  if (n < 0) return null;
  if (n === 0) return "Hari ini";
  if (n === 1) return "Besok";
  return `${n} hari lagi`;
}

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

  const stats = [
    { label: "Sesi terdaftar", value: pendaftaran.length, icon: "event_upcoming", bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Sedang berlangsung", value: sesiBerlangsung.length, icon: "play_circle", bg: "#CDF3DD", fg: "#12823F" },
    { label: "Sesi mendatang", value: sesiMendatang.length, icon: "schedule", bg: "#FFE08A", fg: "#8A5A00" },
  ];

  return (
    <div className="space-y-10">
      <style>{CSS}</style>

      <header>
        <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
          Jadwal Pembelajaran
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#0F1B3D]/65 sm:text-base">
          Pantau waktu webinar dan kelas online yang Anda ikuti agar tidak terlewat.
        </p>
      </header>

      {/* Ringkasan */}
      <section aria-label="Ringkasan jadwal">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className={`${CARD} flex items-center gap-4 p-4`}>
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                style={{ backgroundColor: s.bg, color: s.fg }}
              >
                <Icon name={s.icon} className="text-2xl" filled />
              </span>
              <div>
                <dd className="font-display text-3xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                  {s.value}
                </dd>
                <dt className="mt-1 text-xs font-semibold text-[#0F1B3D]/65">{s.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Jadwal terdaftar */}
      <section aria-labelledby="jadwal-anda" className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="jadwal-anda" className="font-display text-xl font-extrabold text-[#0F1B3D]">
            Jadwal sesi Anda
          </h2>
          <Link
            href="/dashboard/siswa/kegiatan"
            className={`rounded-lg text-sm font-bold text-[#1E5FD8] underline-offset-4 hover:underline ${FOCUS}`}
          >
            Lihat semua kegiatan
          </Link>
        </div>

        {pendaftaran.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
              <Icon name="calendar_today" className="text-3xl" filled />
            </span>
            <p className="mt-5 text-base font-bold text-[#0F1B3D]">
              Belum ada jadwal kegiatan terdaftar
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#0F1B3D]/65">
              Daftar kegiatan pembelajaran yang tersedia untuk mengisi jadwal belajar Anda.
            </p>
            <Link href="/dashboard/siswa/kegiatan" className={`${BTN_PRIMARY} mt-6`}>
              <Icon name="event_available" className="text-lg" />
              Jelajahi katalog kegiatan
            </Link>
          </div>
        ) : (
          <ul className="space-y-5">
            {pendaftaran.map((p) => {
              const k = p.kegiatan;
              const isBerlangsung = k.status === "BERLANGSUNG";
              const hari = labelHari(k.tanggal);
              return (
                <li
                  key={p.id}
                  className={`flex flex-col overflow-hidden rounded-2xl border-2 border-[#0F1B3D] bg-white sm:flex-row ${
                    isBerlangsung
                      ? "shadow-[5px_5px_0_0_#16A34A]"
                      : "shadow-[4px_4px_0_0_#0F1B3D]"
                  }`}
                >
                  {/* Sobekan tiket: tanggal */}
                  <div
                    aria-hidden="true"
                    className={`flex shrink-0 items-center justify-center gap-4 border-b-2 border-dashed border-[#0F1B3D]/40 px-5 py-4 sm:w-32 sm:flex-col sm:gap-0 sm:border-b-0 sm:border-r-2 sm:py-5 ${
                      isBerlangsung ? "bg-[#CDF3DD]" : "bg-[#FFC83D]"
                    }`}
                  >
                    <span className="text-sm font-bold text-[#0F1B3D]">
                      {k.tanggal.toLocaleDateString("id-ID", { weekday: "short" })}
                    </span>
                    <span className="font-display text-4xl font-extrabold leading-none text-[#0F1B3D] sm:my-1 sm:text-5xl">
                      {k.tanggal.getDate()}
                    </span>
                    <span className="text-sm font-bold text-[#0F1B3D]">
                      {k.tanggal.toLocaleDateString("id-ID", { month: "short" })}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                          {k.mapel.namaMapel}
                        </span>
                        <StatusBadge status={k.status} />
                        {isBerlangsung ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E5372E] px-2.5 py-1 text-[11px] font-bold text-white">
                            <span className="rec-dot h-1.5 w-1.5 rounded-full bg-white" />
                            LIVE
                          </span>
                        ) : (
                          hari && (
                            <span className="inline-flex rounded-full bg-[#0F1B3D] px-2.5 py-1 text-[11px] font-bold text-white">
                              {hari}
                            </span>
                          )
                        )}
                      </div>

                      <h3 className="mt-2 line-clamp-2 font-display text-lg font-extrabold leading-snug text-[#0F1B3D]">
                        {k.judulPembelajaran}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0F1B3D]/65">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="schedule" className="text-base text-[#1E78E6]" filled />
                          <span className="tabular-nums">
                            {k.waktuMulai} - {k.waktuSelesai} WIB
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="person" className="text-base text-[#1E78E6]" filled />
                          {k.guru.user.nama}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/siswa/kegiatan/${k.id}`}
                      className={`shrink-0 ${isBerlangsung ? BTN_PRIMARY : BTN_OUTLINE}`}
                    >
                      <Icon name={isBerlangsung ? "play_arrow" : "visibility"} className="text-lg" />
                      {isBerlangsung ? "Masuk sesi" : "Lihat detail"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Sesi lain yang akan datang di sekolah */}
      {semuaMendatang.length > 0 && (
        <section aria-labelledby="jadwal-lain" className="space-y-4">
          <h2 id="jadwal-lain" className="font-display text-xl font-extrabold text-[#0F1B3D]">
            Jadwal pembelajaran lainnya di SMK Kosgoro
          </h2>
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {semuaMendatang.slice(0, 4).map((k) => {
              const sudahDaftar = registeredKegiatanIds.has(k.id);
              return (
                <li key={k.id} className={`${CARD} flex flex-col justify-between p-5`}>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#E6DCFF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                        {k.mapel.namaMapel}
                      </span>
                      <StatusBadge status={k.status} />
                    </div>
                    <h3 className="mt-3 line-clamp-2 font-display text-lg font-extrabold leading-snug text-[#0F1B3D]">
                      {k.judulPembelajaran}
                    </h3>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#0F1B3D]/65">
                      <Icon name="event_available" className="text-base text-[#1E78E6]" filled />
                      <span className="tabular-nums">
                        {formatTanggal(k.tanggal)}, {k.waktuMulai} WIB
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-dashed border-[#0F1B3D]/25 pt-4">
                    <span className="min-w-0 truncate text-sm text-[#0F1B3D]/65">{k.guru.user.nama}</span>
                    {sudahDaftar && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#CDF3DD] px-2.5 py-1 text-xs font-bold text-[#12823F]">
                        <Icon name="check_circle" className="text-sm" filled />
                        Terdaftar
                      </span>
                    )}
                    <Link
                      href={`/dashboard/siswa/kegiatan/${k.id}`}
                      className={`shrink-0 rounded-lg text-sm font-bold text-[#1E5FD8] underline-offset-4 hover:underline ${FOCUS}`}
                    >
                      {sudahDaftar ? "Buka kegiatan" : "Detail & daftar"}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}