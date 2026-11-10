import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { KegiatanCardGuru } from "@/components/guru/KegiatanCardGuru";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Kegiatan Saya" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;

export default async function GuruKegiatanPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({ where: { userId: session.userId } });

  await syncKegiatanStatuses();

  const kegiatan = await db.kegiatan.findMany({
    where: { guruId: guru.id },
    orderBy: { tanggal: "desc" },
    include: {
      mapel: true,
      materi: { select: { tipe: true, filePath: true } },
      _count: { select: { materi: true, pendaftaran: true } },
    },
  });

  const berlangsung = kegiatan.filter((k) => k.status === "BERLANGSUNG").length;
  const belumMulai = kegiatan.filter((k) => k.status === "BELUM_MULAI").length;
  const totalPeserta = kegiatan.reduce((sum, k) => sum + k._count.pendaftaran, 0);

  const stats = [
    { label: "Total kegiatan", value: kegiatan.length, icon: "event_available", bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Berlangsung", value: berlangsung, icon: "play_circle", bg: "#CDF3DD", fg: "#12823F" },
    { label: "Belum mulai", value: belumMulai, icon: "schedule", bg: "#FFE08A", fg: "#8A5A00" },
    { label: "Total peserta", value: totalPeserta, icon: "groups", bg: "#E6DCFF", fg: "#6D35D6" },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
            Kegiatan Saya
          </h1>
          <p className="mt-2 text-sm text-[#0F1B3D]/65 sm:text-base">
            {kegiatan.length} kegiatan pembelajaran yang Anda buat.
          </p>
        </div>
        <Link href="/dashboard/guru/kegiatan/baru" className={`${BTN_PRIMARY} shrink-0`}>
          <Icon name="add_circle" className="text-xl" />
          Buat kegiatan baru
        </Link>
      </header>

      {kegiatan.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
            <Icon name="event_busy" className="text-3xl" filled />
          </span>
          <p className="mt-5 text-base font-bold text-[#0F1B3D]">
            Anda belum membuat kegiatan apa pun
          </p>
          <p className="mt-1 max-w-sm text-sm text-[#0F1B3D]/65">
            Kegiatan yang Anda buat akan tampil di sini, lengkap dengan jumlah peserta dan materi.
          </p>
          <Link href="/dashboard/guru/kegiatan/baru" className={`${BTN_PRIMARY} mt-6`}>
            <Icon name="add_circle" className="text-xl" />
            Buat kegiatan pertama
          </Link>
        </div>
      ) : (
        <>
          {/* Ringkasan */}
          <section aria-label="Ringkasan kegiatan">
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className={`${CARD} flex items-center gap-3 p-3.5`}>
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                    style={{ backgroundColor: s.bg, color: s.fg }}
                  >
                    <Icon name={s.icon} className="text-xl" filled />
                  </span>
                  <div className="min-w-0">
                    <dd className="font-display text-2xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                      {s.value}
                    </dd>
                    <dt className="mt-1 truncate text-xs font-semibold text-[#0F1B3D]/65">{s.label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* Daftar kegiatan */}
          <section aria-label="Daftar kegiatan" className="space-y-5">
            {kegiatan.map((k) => (
              <KegiatanCardGuru
                key={k.id}
                id={k.id}
                judulPembelajaran={k.judulPembelajaran}
                mapel={k.mapel.namaMapel}
                tanggal={k.tanggal}
                waktuMulai={k.waktuMulai}
                waktuSelesai={k.waktuSelesai}
                status={k.status}
                jumlahPeserta={k._count.pendaftaran}
                jumlahMateri={k._count.materi}
                coverUrl={resolveKegiatanCover(k.coverUrl, k.materi)}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}