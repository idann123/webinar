import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { ProfilForm } from "@/components/siswa/ProfilForm";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Profil Siswa" };

// Gaya bersama: border navy dan bayangan keras
const CARD = "rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]";

// Lebar garis hiasan barcode pada kartu ID (px), sama seperti kartu guru di beranda
const BARCODE = [2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1] as const;

function inisial(nama: string) {
  return nama
    .replace(/,.*$/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function SiswaProfilPage() {
  const session = await requireRole("SISWA");

  const siswa = await db.siswa.findFirstOrThrow({
    where: { userId: session.userId },
    include: {
      user: true,
      kelas: { include: { jurusan: true } },
      pendaftaran: {
        include: {
          kegiatan: { include: { mapel: true } },
        },
      },
    },
  });

  const totalDiikuti = siswa.pendaftaran.length;
  const totalHadir = siswa.pendaftaran.filter((p) => p.statusKehadiran === "HADIR").length;
  const totalTidakHadir = totalDiikuti - totalHadir;
  const persentaseHadir = totalDiikuti > 0 ? Math.round((totalHadir / totalDiikuti) * 100) : 0;

  const idSiswa = `SISWA-${siswa.id.toString().padStart(4, "0")}`;

  // ID Siswa tampil di kartu identitas, jadi tidak diulang di daftar ini
  const infoRows: { label: string; value: string; icon: string }[] = [
    { label: "Email", value: siswa.user.email, icon: "mail" },
    { label: "Kelas", value: siswa.kelas.namaKelas, icon: "groups" },
    { label: "Jurusan", value: siswa.kelas.jurusan.namaJurusan, icon: "account_tree" },
    { label: "Terdaftar sejak", value: formatTanggal(siswa.user.createdAt), icon: "calendar_month" },
  ];

  const kehadiranTiles = [
    { label: "Diikuti", value: totalDiikuti, bg: "#CFE7FF", fg: "#1E5FD8" },
    { label: "Hadir", value: totalHadir, bg: "#CDF3DD", fg: "#12823F" },
    { label: "Belum / tidak hadir", value: totalTidakHadir, bg: "#FFD6DE", fg: "#C0264A" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Judul halaman */}
      <header>
        <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
          Profil saya
        </h1>
        <p className="mt-2 max-w-prose text-sm text-[#0F1B3D]/65 sm:text-base">
          Lihat data akademik dan ringkasan kehadiran Anda, lalu atur keamanan akun.
        </p>
      </header>

      {/* Kartu identitas: dibuat seperti kartu pelajar */}
      <section aria-labelledby="identitas" className={`${CARD} overflow-hidden`}>
        <div className="relative flex items-center justify-between gap-3 bg-[#0F1B3D] px-5 pb-4 pt-6 sm:px-8">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)",
              backgroundSize: "18px 18px",
            }}
          />
          {/* lubang tali kartu */}
          <span
            aria-hidden
            className="absolute left-1/2 top-2 h-2 w-14 -translate-x-1/2 rounded-full border-2 border-[#0F1B3D] bg-[#EAF6FF]"
          />

          <div className="relative flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-kosgoro.jpeg"
              alt=""
              className="h-10 w-10 rounded-full border-2 border-white bg-white object-cover"
            />
            <div className="leading-tight">
              <p className="font-display text-base font-extrabold text-white">SMK Kosgoro</p>
              <p className="text-xs font-semibold text-[#8CCBFF]">Kartu siswa</p>
            </div>
          </div>

          <span className="relative inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-[#CDF3DD] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
            <span aria-hidden className="h-2 w-2 rounded-full bg-[#16A34A]" />
            Akun aktif
          </span>
        </div>

        <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-8">
          <span
            aria-hidden="true"
            className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] font-display text-4xl font-extrabold text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D] sm:h-28 sm:w-28 sm:text-5xl"
          >
            {inisial(siswa.user.nama)}
          </span>

          <div className="min-w-0">
            <h2
              id="identitas"
              className="break-words font-display text-2xl font-extrabold text-[#0F1B3D] sm:text-3xl"
            >
              {siswa.user.nama}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                <Icon name="school" className="text-sm" filled />
                Siswa
              </span>
              <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-white px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                {siswa.kelas.namaKelas}
              </span>
              <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#FFE08A] px-3 py-1 text-xs font-bold text-[#0F1B3D]">
                {siswa.kelas.jurusan.namaJurusan}
              </span>
            </div>
          </div>
        </div>

        {/* ID siswa + barcode hiasan */}
        <div className="flex flex-col gap-3 border-t-2 border-dashed border-[#0F1B3D]/40 bg-[#F2F9FF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-[#0F1B3D]/65">
            ID siswa{" "}
            <span className="ml-1.5 font-mono text-base font-bold tracking-wide text-[#0F1B3D]">
              {idSiswa}
            </span>
          </p>
          <div aria-hidden className="flex h-8 items-end gap-[2px] overflow-hidden">
            {BARCODE.map((w, i) => (
              <span key={i} className="block h-full bg-[#0F1B3D]" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </section>

      {/* Ringkasan kehadiran */}
      <section aria-labelledby="kehadiran" className={`${CARD} p-5 sm:p-6`}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 id="kehadiran" className="font-display text-xl font-extrabold text-[#0F1B3D]">
            Ringkasan kehadiran
          </h2>
          <p className="text-sm text-[#0F1B3D]/65">
            {totalDiikuti > 0
              ? `Dari ${totalDiikuti} kegiatan yang Anda ikuti`
              : "Belum ada kegiatan yang diikuti"}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <p className="font-display text-5xl font-extrabold tabular-nums text-[#0F1B3D]">
            {persentaseHadir}
            <span className="text-3xl">%</span>
          </p>
          <p className="pb-1.5 text-sm text-[#0F1B3D]/65">tingkat kehadiran</p>
        </div>

        <div
          role="progressbar"
          aria-valuenow={persentaseHadir}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Persentase kehadiran"
          className="mt-3 h-4 overflow-hidden rounded-full border-2 border-[#0F1B3D] bg-[#F2F9FF]"
        >
          <div
            className={`h-full bg-[#FFC83D] ${persentaseHadir > 0 && persentaseHadir < 100 ? "border-r-2 border-[#0F1B3D]" : ""}`}
            style={{ width: `${persentaseHadir}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {kehadiranTiles.map((t) => (
            <div
              key={t.label}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-[#0F1B3D] px-4 py-3"
              style={{ backgroundColor: t.bg }}
            >
              <dt className="text-xs font-bold text-[#0F1B3D]">{t.label}</dt>
              <dd className="font-display text-2xl font-extrabold tabular-nums text-[#0F1B3D]">
                {t.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5">
        {/* Informasi siswa */}
        <section aria-labelledby="info" className={`${CARD} p-5 sm:p-6 lg:col-span-2`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#CFE7FF] text-[#1E5FD8]">
              <Icon name="badge" className="text-xl" filled />
            </span>
            <h2 id="info" className="font-display text-xl font-extrabold text-[#0F1B3D]">
              Data siswa
            </h2>
          </div>

          <dl className="mt-4 text-sm">
            {infoRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex items-start gap-3 py-3 ${i > 0 ? "border-t-2 border-dashed border-[#0F1B3D]/20" : ""}`}
              >
                <Icon name={row.icon} className="mt-0.5 text-lg text-[#1E78E6]" filled />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-[#0F1B3D]/60">{row.label}</dt>
                  <dd className="mt-0.5 break-words font-bold text-[#0F1B3D]">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        {/* Keamanan akun */}
        <section aria-labelledby="keamanan" className={`${CARD} p-5 sm:p-6 lg:col-span-3`}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D]">
              <Icon name="security" className="text-xl" filled />
            </span>
            <div>
              <h2 id="keamanan" className="font-display text-xl font-extrabold text-[#0F1B3D]">
                Ganti kata sandi
              </h2>
              <p className="text-xs text-[#0F1B3D]/65">
                Gunakan kata sandi yang sulit ditebak dan tidak dipakai di akun lain.
              </p>
            </div>
          </div>

          <div className="mt-5 border-t-2 border-dashed border-[#0F1B3D]/25 pt-5">
            <ProfilForm />
          </div>
        </section>
      </div>
    </div>
  );
}