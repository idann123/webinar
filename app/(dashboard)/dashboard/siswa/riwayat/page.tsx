import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Riwayat Belajar" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;
const BTN_OUTLINE = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[1px_1px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

function bulanTahun(tanggal: Date) {
  return tanggal.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export default async function SiswaRiwayatPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  await syncKegiatanStatuses();

  const riwayat = await db.pendaftaran.findMany({
    where: { siswaId: siswa.id },
    orderBy: { tanggalDaftar: "desc" },
    include: {
      kegiatan: {
        include: { mapel: true, guru: { include: { user: true } } },
      },
    },
  });

  const hadir = riwayat.filter((r) => r.statusKehadiran === "HADIR").length;
  const tidakHadir = riwayat.filter((r) => r.statusKehadiran && r.statusKehadiran !== "HADIR").length;

  const stats = [
    { label: "Kegiatan diikuti", value: riwayat.length, icon: "history", bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Hadir", value: hadir, icon: "check_circle", bg: "#CDF3DD", fg: "#12823F" },
    { label: "Tidak hadir", value: tidakHadir, icon: "cancel", bg: "#FFD6DE", fg: "#C0264A" },
  ];

  // Kelompokkan per bulan pendaftaran (urutan terbaru tetap terjaga)
  const grup: { bulan: string; items: typeof riwayat }[] = [];
  for (const r of riwayat) {
    const bulan = bulanTahun(r.tanggalDaftar);
    const terakhir = grup[grup.length - 1];
    if (terakhir && terakhir.bulan === bulan) terakhir.items.push(r);
    else grup.push({ bulan, items: [r] });
  }

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
          Riwayat Belajar
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#0F1B3D]/65 sm:text-base">
          Semua kegiatan yang pernah Anda ikuti beserta status kehadirannya.
        </p>
      </header>

      {riwayat.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
            <Icon name="history_toggle_off" className="text-3xl" filled />
          </span>
          <p className="mt-5 text-base font-bold text-[#0F1B3D]">
            Anda belum mengikuti kegiatan apa pun
          </p>
          <p className="mt-1 max-w-sm text-sm text-[#0F1B3D]/65">
            Kegiatan yang Anda daftar akan tercatat di sini.
          </p>
          <Link href="/dashboard/siswa/kegiatan" className={`${BTN_PRIMARY} mt-6`}>
            <Icon name="event_available" className="text-lg" />
            Jelajahi kegiatan
          </Link>
        </div>
      ) : (
        <>
          {/* Ringkasan */}
          <section aria-label="Ringkasan riwayat">
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

          {/* Daftar riwayat per bulan */}
          {grup.map((g) => (
            <section key={g.bulan} aria-label={`Riwayat ${g.bulan}`} className="space-y-4">
              <h2 className="flex items-center gap-3 font-display text-xl font-extrabold text-[#0F1B3D]">
                <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-[#0F1B3D] bg-[#FFC83D] shadow-[2px_2px_0_0_#0F1B3D]">
                  <Icon name="calendar_month" className="text-xl" filled />
                </span>
                {g.bulan}
                <span className="rounded-full border-2 border-[#0F1B3D] bg-white px-2.5 py-0.5 text-xs font-bold tabular-nums">
                  {g.items.length}
                </span>
              </h2>

              <ul className={`${CARD} overflow-hidden`}>
                {g.items.map((r, i) => {
                  const hadirRow = r.statusKehadiran === "HADIR";
                  const tidakRow = !!r.statusKehadiran && !hadirRow;
                  const tile = hadirRow
                    ? { bg: "#CDF3DD", fg: "#12823F", icon: "check_circle" }
                    : tidakRow
                      ? { bg: "#FFD6DE", fg: "#C0264A", icon: "cancel" }
                      : { bg: "#CFE7FF", fg: "#1E5FD8", icon: "history" };
                  return (
                    <li
                      key={r.id}
                      className={`flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                        i > 0 ? "border-t border-[#0F1B3D]/15" : ""
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span
                          aria-hidden
                          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                          style={{ backgroundColor: tile.bg, color: tile.fg }}
                        >
                          <Icon name={tile.icon} className="text-2xl" filled />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-display text-base font-extrabold text-[#0F1B3D]">
                            {r.kegiatan.judulPembelajaran}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-[#0F1B3D]/65">
                            {r.kegiatan.mapel.namaMapel}, daftar {formatTanggal(r.tanggalDaftar)}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={r.kegiatan.status} />
                            {r.statusKehadiran && (
                              <span
                                className="inline-flex items-center gap-1 rounded-full border-2 border-[#0F1B3D] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]"
                                style={{ backgroundColor: tile.bg }}
                              >
                                <Icon name={tile.icon} className="text-sm" filled />
                                {hadirRow ? "Hadir" : "Tidak hadir"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/siswa/kegiatan/${r.kegiatan.id}`}
                        className={`${BTN_OUTLINE} shrink-0`}
                      >
                        Buka kegiatan
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}