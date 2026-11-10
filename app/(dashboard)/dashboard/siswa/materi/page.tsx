import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Materi Pembelajaran" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_PRIMARY = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] hover:shadow-[2px_2px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;
const BTN_PRIMARY_SM = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_0_#FFC83D] hover:shadow-[1px_1px_0_0_#FFC83D] ${PRESS} ${FOCUS}`;

// Warna dan ikon tiap tipe materi
function getTipeInfo(tipe: string) {
  switch (tipe) {
    case "PDF":
      return { label: "Dokumen PDF", icon: "picture_as_pdf", bg: "#FFD6DE", fg: "#C0264A" };
    case "VIDEO":
      return { label: "Video rekaman", icon: "play_circle", bg: "#E6DCFF", fg: "#6D35D6" };
    case "LINK":
      return { label: "Tautan web", icon: "link", bg: "#CFE7FF", fg: "#1E5FD8" };
    default:
      return { label: tipe, icon: "description", bg: "#FFE08A", fg: "#8A5A00" };
  }
}

export default async function SiswaMateriPage() {
  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  const [pendaftaran, materials] = await Promise.all([
    db.pendaftaran.findMany({
      where: { siswaId: siswa.id },
      select: { kegiatanId: true },
    }),
    db.materi.findMany({
      include: {
        kegiatan: {
          include: {
            mapel: true,
            guru: { include: { user: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    }),
  ]);

  const enrolledSet = new Set(pendaftaran.map((p) => p.kegiatanId));

  const totalPdf = materials.filter((m) => m.tipe === "PDF").length;
  const totalVideo = materials.filter((m) => m.tipe === "VIDEO").length;
  const totalLink = materials.filter((m) => m.tipe === "LINK").length;

  const stats = [
    { label: "Total materi", value: materials.length, icon: "folder", bg: "#FFE08A", fg: "#8A5A00" },
    { label: "Dokumen PDF", value: totalPdf, icon: "picture_as_pdf", bg: "#FFD6DE", fg: "#C0264A" },
    { label: "Video rekaman", value: totalVideo, icon: "play_circle", bg: "#E6DCFF", fg: "#6D35D6" },
    { label: "Tautan tambahan", value: totalLink, icon: "link", bg: "#CFE7FF", fg: "#1E5FD8" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
          Materi Pembelajaran
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#0F1B3D]/65 sm:text-base">
          Akses modul, bahan presentasi, file PDF, dan tautan referensi dari kegiatan belajar.
        </p>
      </header>

      {/* Ringkasan */}
      <section aria-label="Ringkasan materi">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className={`${CARD} flex flex-col items-start gap-3 p-4`}>
              <span
                className="grid h-11 w-11 place-items-center rounded-xl border-2 border-[#0F1B3D]"
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

      {/* Daftar materi */}
      <section aria-labelledby="semua-materi" className="space-y-4">
        <h2 id="semua-materi" className="font-display text-xl font-extrabold text-[#0F1B3D]">
          Semua materi tersedia
        </h2>

        {materials.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-14 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
              <Icon name="folder_off" className="text-3xl" filled />
            </span>
            <p className="mt-5 text-base font-bold text-[#0F1B3D]">
              Belum ada materi pembelajaran yang diunggah
            </p>
            <p className="mt-1 max-w-md text-sm text-[#0F1B3D]/65">
              Bapak/Ibu guru akan menambahkan materi sebelum atau setelah sesi webinar berlangsung.
            </p>
            <Link href="/dashboard/siswa/kegiatan" className={`${BTN_PRIMARY} mt-6`}>
              <Icon name="event_available" className="text-lg" />
              Jelajahi kegiatan
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {materials.map((m) => {
              const info = getTipeInfo(m.tipe);
              const isEnrolled = enrolledSet.has(m.kegiatanId);
              const isLink = m.tipe === "LINK";

              return (
                <li key={m.id} className={`${CARD} flex flex-col overflow-hidden`}>
                  {/* Tab warna sesuai tipe, seperti map file */}
                  <div
                    className="flex items-center justify-between gap-3 border-b-2 border-[#0F1B3D] px-4 py-3"
                    style={{ backgroundColor: info.bg }}
                  >
                    <span className="flex items-center gap-2.5 text-sm font-bold text-[#0F1B3D]">
                      <span
                        aria-hidden
                        className="grid h-9 w-9 place-items-center rounded-lg border-2 border-[#0F1B3D] bg-white"
                        style={{ color: info.fg }}
                      >
                        <Icon name={info.icon} className="text-xl" filled />
                      </span>
                      {info.label}
                    </span>
                    {isEnrolled && (
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#0F1B3D] bg-white px-2.5 py-0.5 text-xs font-bold text-[#12823F]">
                        <Icon name="check_circle" className="text-sm" filled />
                        Terdaftar
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-snug text-[#0F1B3D]">
                        {m.judulMateri}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#0F1B3D]/65">
                        {m.kegiatan.mapel.namaMapel}, {m.kegiatan.judulPembelajaran}
                      </p>
                      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#0F1B3D]/60">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="school" className="text-sm text-[#1E78E6]" filled />
                          {m.kegiatan.guru.user.nama}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="event_available" className="text-sm text-[#1E78E6]" filled />
                          {formatTanggal(m.kegiatan.tanggal)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t-2 border-dashed border-[#0F1B3D]/25 pt-4">
                      <Link
                        href={`/dashboard/siswa/kegiatan/${m.kegiatanId}`}
                        className={`rounded-lg text-sm font-bold text-[#1E5FD8] underline-offset-4 hover:underline ${FOCUS}`}
                      >
                        Buka kegiatan
                      </Link>

                      <a
                        href={m.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={BTN_PRIMARY_SM}
                      >
                        <Icon name={isLink ? "open_in_new" : "download"} className="text-lg" />
                        {isLink ? "Buka link" : "Akses / unduh"}
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}