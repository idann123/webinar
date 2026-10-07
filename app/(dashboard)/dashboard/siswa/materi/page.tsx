import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { Icon } from "@/components/Icon";
import { formatTanggal } from "@/lib/utils";

export const metadata = { title: "Materi Pembelajaran" };

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

  const getTipeBadge = (tipe: string) => {
    switch (tipe) {
      case "PDF":
        return {
          label: "Dokumen PDF",
          icon: "picture_as_pdf",
          color: "bg-rose-50 text-rose-700 border-rose-200",
          iconBg: "bg-rose-100 text-rose-700",
        };
      case "VIDEO":
        return {
          label: "Video Rekaman",
          icon: "play_circle",
          color: "bg-violet-50 text-violet-700 border-violet-200",
          iconBg: "bg-violet-100 text-violet-700",
        };
      case "LINK":
        return {
          label: "Tautan Web",
          icon: "link",
          color: "bg-brand-50 text-brand-700 border-brand-200",
          iconBg: "bg-brand-100 text-brand-700",
        };
      default:
        return {
          label: tipe,
          icon: "description",
          color: "bg-slate-50 text-slate-700 border-slate-200",
          iconBg: "bg-slate-100 text-slate-700",
        };
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">
          Materi Pembelajaran
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Akses modul, bahan presentasi, file PDF, dan tautan referensi dari kegiatan belajar.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card p-4 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Icon name="folder" className="text-xl" />
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            {materials.length}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Total Materi</p>
        </div>

        <div className="card p-4 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <Icon name="picture_as_pdf" className="text-xl" />
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">{totalPdf}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Dokumen PDF</p>
        </div>

        <div className="card p-4 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
            <Icon name="play_circle" className="text-xl" />
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">{totalVideo}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Video Rekaman</p>
        </div>

        <div className="card p-4 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <Icon name="link" className="text-xl" />
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold text-slate-900">{totalLink}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Tautan Tambahan</p>
        </div>
      </div>

      {/* Daftar Materi */}
      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Semua Materi Tersedia
        </h2>

        {materials.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <Icon name="folder_off" className="text-4xl text-slate-300" />
            <p className="font-medium text-slate-600">Belum ada materi pembelajaran yang diunggah.</p>
            <p className="max-w-md text-xs text-slate-400">
              Bapak/Ibu guru akan menambahkan materi sebelum atau setelah sesi webinar berlangsung.
            </p>
            <Link href="/dashboard/siswa/kegiatan" className="btn-primary mt-2">
              Jelajahi Kegiatan
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {materials.map((m) => {
              const info = getTipeBadge(m.tipe);
              const isEnrolled = enrolledSet.has(m.kegiatanId);

              return (
                <div key={m.id} className="card flex flex-col justify-between p-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`badge border ${info.color}`}>
                        <Icon name={info.icon} className="text-xs" />
                        {info.label}
                      </span>
                      {isEnrolled && (
                        <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700">
                          <Icon name="check" className="text-xs" />
                          Terdaftar
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-start gap-3.5">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${info.iconBg}`}>
                        <Icon name={info.icon} className="text-2xl" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="line-clamp-1 font-display text-base font-bold text-slate-900">
                          {m.judulMateri}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {m.kegiatan.mapel.namaMapel} • {m.kegiatan.judulPembelajaran}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                      <Icon name="school" className="text-sm" />
                      <span>{m.kegiatan.guru.user.nama}</span>
                      <span>•</span>
                      <span>{formatTanggal(m.kegiatan.tanggal)}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
                    <Link
                      href={`/dashboard/siswa/kegiatan/${m.kegiatanId}`}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                    >
                      Buka Kegiatan
                    </Link>

                    <a
                      href={m.filePath}
                      target={m.tipe === "LINK" ? "_blank" : "_blank"}
                      rel="noopener noreferrer"
                      className="btn-primary py-1.5 text-xs"
                    >
                      <Icon name={m.tipe === "LINK" ? "open_in_new" : "download"} className="text-sm" />
                      {m.tipe === "LINK" ? "Buka Link" : "Akses / Unduh"}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
