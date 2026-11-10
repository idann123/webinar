import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { deleteMateri } from "@/lib/actions/kegiatan";
import { KegiatanForm } from "@/components/guru/KegiatanForm";
import { MateriForms } from "@/components/guru/MateriForms";
import { StatusToggle } from "@/components/guru/StatusToggle";
import { ConfirmForm } from "@/components/ConfirmForm";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal, tipeMateriLabel } from "@/lib/utils";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Kelola Kegiatan" };

// Gaya bersama: border navy dan bayangan keras
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_BACK = `inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-3.5 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[1px_1px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

// Warna pastel untuk avatar siswa, bergantian
const AVATAR_TONE = ["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"] as const;

// Warna dan ikon tiap tipe materi, sama seperti halaman materi siswa
function getTipeInfo(tipe: string) {
  switch (tipe) {
    case "PDF":
      return { icon: "picture_as_pdf", bg: "#FFD6DE", fg: "#C0264A" };
    case "VIDEO":
      return { icon: "play_circle", bg: "#E6DCFF", fg: "#6D35D6" };
    case "LINK":
      return { icon: "link", bg: "#CFE7FF", fg: "#1E5FD8" };
    default:
      return { icon: "description", bg: "#FFE08A", fg: "#8A5A00" };
  }
}

function inisial(nama: string) {
  return nama
    .replace(/,.*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function toYyyyMmDd(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${m}-${day}`;
}

// Judul bagian dengan ikon di kotak berwarna
function SectionTitle({
  id,
  icon,
  bg,
  children,
  aside,
}: {
  id: string;
  icon: string;
  bg: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={id} className="flex items-center gap-3 font-display text-xl font-extrabold text-[#0F1B3D]">
        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] text-[#0F1B3D]"
          style={{ backgroundColor: bg }}
        >
          <Icon name={icon} className="text-xl" filled />
        </span>
        {children}
      </h2>
      {aside}
    </div>
  );
}

export default async function GuruKegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatanId = Number(id);
  if (!kegiatanId) notFound();

  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({
    where: { userId: session.userId },
    include: { mapelGuru: true },
  });

  await syncKegiatanStatuses();

  const mapel = await db.mapel.findMany({
    where: { id: { in: guru.mapelGuru.map((m) => m.mapelId) } },
    orderBy: { namaMapel: "asc" },
  });

  const kegiatan = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
    include: {
      mapel: true,
      materi: true,
      pendaftaran: {
        orderBy: { tanggalDaftar: "desc" },
        include: { siswa: { include: { user: true, kelas: { include: { jurusan: true } } } } },
      },
    },
  });
  if (!kegiatan) notFound();

  const isBerlangsung = kegiatan.status === "BERLANGSUNG";

  return (
    <div className="space-y-10">
      {/* Judul + ringkasan kegiatan */}
      <header className="space-y-5">
        <div>
          <Link href="/dashboard/guru/kegiatan" className={BTN_BACK}>
            <Icon name="arrow_back" className="text-lg" />
            Kembali ke daftar
          </Link>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
            Kelola Kegiatan
          </h1>
        </div>

        <div className={`${CARD} flex flex-col overflow-hidden sm:flex-row`}>
          {/* Sobekan tiket: tanggal */}
          <div
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center gap-4 border-b-2 border-dashed border-[#0F1B3D]/40 px-5 py-4 sm:w-32 sm:flex-col sm:gap-0 sm:border-b-0 sm:border-r-2 sm:py-5 ${
              isBerlangsung ? "bg-[#CDF3DD]" : "bg-[#FFC83D]"
            }`}
          >
            <span className="text-sm font-bold text-[#0F1B3D]">
              {kegiatan.tanggal.toLocaleDateString("id-ID", { weekday: "short" })}
            </span>
            <span className="font-display text-4xl font-extrabold leading-none text-[#0F1B3D] sm:my-1 sm:text-5xl">
              {kegiatan.tanggal.getDate()}
            </span>
            <span className="text-sm font-bold text-[#0F1B3D]">
              {kegiatan.tanggal.toLocaleDateString("id-ID", { month: "short" })}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                  {kegiatan.mapel.namaMapel}
                </span>
                <StatusBadge status={kegiatan.status} />
              </div>
              <p className="mt-2 line-clamp-2 font-display text-xl font-extrabold leading-snug text-[#0F1B3D]">
                {kegiatan.judulPembelajaran}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#0F1B3D]/65">
                <Icon name="schedule" className="text-base text-[#1E78E6]" filled />
                <span className="tabular-nums">
                  {kegiatan.waktuMulai} - {kegiatan.waktuSelesai} WIB
                </span>
              </p>
            </div>

            <dl className="flex shrink-0 gap-3">
              <div className="rounded-xl border-2 border-[#0F1B3D] bg-[#E6DCFF] px-4 py-2 text-center">
                <dd className="font-display text-2xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                  {kegiatan.pendaftaran.length}
                </dd>
                <dt className="mt-1 text-xs font-bold text-[#0F1B3D]">Siswa</dt>
              </div>
              <div className="rounded-xl border-2 border-[#0F1B3D] bg-[#FFE08A] px-4 py-2 text-center">
                <dd className="font-display text-2xl font-extrabold leading-none tabular-nums text-[#0F1B3D]">
                  {kegiatan.materi.length}
                </dd>
                <dt className="mt-1 text-xs font-bold text-[#0F1B3D]">Materi</dt>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* Edit form */}
      <section aria-labelledby="info-kegiatan" className="space-y-4">
        <SectionTitle id="info-kegiatan" icon="edit_note" bg="#CFE7FF">
          Informasi kegiatan
        </SectionTitle>
        <KegiatanForm
          kegiatanId={kegiatanId}
          mapel={mapel.map((m) => ({ id: m.id, namaMapel: m.namaMapel }))}
          backHref="/dashboard/guru/kegiatan"
          initial={{
            judulPembelajaran: kegiatan.judulPembelajaran,
            mapelId: kegiatan.mapelId,
            tanggal: toYyyyMmDd(kegiatan.tanggal),
            waktuMulai: kegiatan.waktuMulai,
            waktuSelesai: kegiatan.waktuSelesai,
            deskripsi: kegiatan.deskripsi ?? "",
            coverUrl: kegiatan.coverUrl ?? "",
          }}
        />
      </section>

      {/* Status */}
      <section aria-labelledby="status-kegiatan" className={`${CARD} space-y-4 p-5 sm:p-6`}>
        <SectionTitle id="status-kegiatan" icon="toggle_on" bg="#CDF3DD">
          Status kegiatan
        </SectionTitle>
        <p className="flex flex-wrap items-center gap-2 text-sm text-[#0F1B3D]/65">
          Status saat ini: <StatusBadge status={kegiatan.status} /> Perbarui sesuai kondisi pelaksanaan.
        </p>
        <StatusToggle kegiatanId={kegiatanId} current={kegiatan.status} />
      </section>

      {/* Daftar siswa */}
      <section aria-labelledby="siswa-terdaftar" className="space-y-4">
        <SectionTitle
          id="siswa-terdaftar"
          icon="groups"
          bg="#E6DCFF"
          aside={
            <span className="rounded-full border-2 border-[#0F1B3D] bg-white px-3 py-1 text-sm font-bold tabular-nums text-[#0F1B3D]">
              {kegiatan.pendaftaran.length}
            </span>
          }
        >
          Siswa terdaftar
        </SectionTitle>

        {kegiatan.pendaftaran.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#1E78E6] shadow-[3px_3px_0_0_#0F1B3D]">
              <Icon name="person_add" className="text-2xl" filled />
            </span>
            <p className="mt-4 text-sm font-bold text-[#0F1B3D]">Belum ada siswa yang mendaftar</p>
            <p className="mt-1 text-sm text-[#0F1B3D]/65">
              Siswa yang mendaftar akan muncul di daftar ini.
            </p>
          </div>
        ) : (
          <div className={`${CARD} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-[#0F1B3D] bg-[#CFE7FF] text-xs font-extrabold text-[#0F1B3D]">
                    <th scope="col" className="w-14 px-4 py-3">No</th>
                    <th scope="col" className="px-4 py-3">Nama siswa</th>
                    <th scope="col" className="px-4 py-3">Kelas</th>
                    <th scope="col" className="px-4 py-3">Tanggal daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {kegiatan.pendaftaran.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`transition-colors hover:bg-[#CFE7FF]/30 ${i > 0 ? "border-t border-[#0F1B3D]/15" : ""}`}
                    >
                      <td className="px-4 py-3 font-bold tabular-nums text-[#0F1B3D]/50">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-[#0F1B3D] text-xs font-extrabold text-[#0F1B3D]"
                            style={{ backgroundColor: AVATAR_TONE[i % AVATAR_TONE.length] }}
                          >
                            {inisial(p.siswa.user.nama)}
                          </span>
                          <span className="font-bold text-[#0F1B3D]">{p.siswa.user.nama}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#0F1B3D]/75">
                        {p.siswa.kelas.namaKelas} - {p.siswa.kelas.jurusan.namaJurusan}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#0F1B3D]/75">
                        {formatTanggal(p.tanggalDaftar)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Materi */}
      <section aria-labelledby="materi-pembelajaran" className="space-y-4">
        <SectionTitle id="materi-pembelajaran" icon="folder" bg="#FFE08A">
          Materi pembelajaran
        </SectionTitle>
        <MateriForms kegiatanId={kegiatanId} />

        {kegiatan.materi.length > 0 && (
          <ul className={`${CARD} overflow-hidden`}>
            {kegiatan.materi.map((m, i) => {
              const info = getTipeInfo(m.tipe);
              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-[#0F1B3D]/15" : ""}`}
                >
                  <span
                    aria-hidden
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D]"
                    style={{ backgroundColor: info.bg, color: info.fg }}
                  >
                    <Icon name={info.icon} className="text-xl" filled />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#0F1B3D]">{m.judulMateri}</p>
                    <a
                      href={m.filePath}
                      target={m.tipe === "LINK" ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className={`block truncate rounded text-xs font-semibold text-[#1E5FD8] underline-offset-4 hover:underline ${FOCUS}`}
                    >
                      {m.filePath}
                    </a>
                  </div>
                  <span
                    className="hidden shrink-0 rounded-full border-2 border-[#0F1B3D] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D] sm:inline-flex"
                    style={{ backgroundColor: info.bg }}
                  >
                    {tipeMateriLabel[m.tipe]}
                  </span>
                  <ConfirmForm action={deleteMateri} message={`Hapus materi "${m.judulMateri}"?`}>
                    <input type="hidden" name="materiId" value={m.id} />
                    <button
                      type="submit"
                      aria-label={`Hapus materi ${m.judulMateri}`}
                      className={`grid h-10 w-10 place-items-center rounded-xl border-2 border-transparent text-[#0F1B3D]/50 transition-colors hover:border-[#0F1B3D] hover:bg-[#FFE3E0] hover:text-[#C0261D] ${FOCUS}`}
                    >
                      <Icon name="delete" className="text-xl" />
                    </button>
                  </ConfirmForm>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}