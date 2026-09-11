import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { daftarKegiatan } from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal, tipeMateriLabel } from "@/lib/utils";

export const metadata = { title: "Detail Kegiatan" };

export default async function SiswaKegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatanId = Number(id);
  if (!kegiatanId) notFound();

  const session = await requireRole("SISWA");
  const siswa = await db.siswa.findFirstOrThrow({ where: { userId: session.userId } });

  const kegiatan = await db.kegiatan.findUnique({
    where: { id: kegiatanId },
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: true,
      pendaftaran: { where: { siswaId: siswa.id } },
    },
  });
  if (!kegiatan) notFound();

  const sudahTerdaftar = kegiatan.pendaftaran.length > 0;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/siswa/kegiatan"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
      >
        <Icon name="arrow_back" className="text-base" />
        Kembali ke Daftar Kegiatan
      </Link>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={kegiatan.status} />
            <span className="badge border-brand-200 bg-brand-50 text-brand-700">
              {kegiatan.mapel.namaMapel}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-slate-900">
            {kegiatan.judulPembelajaran}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Guru: {kegiatan.guru.user.nama}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-slate-900">Deskripsi</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600">
              {kegiatan.deskripsi || "Belum ada deskripsi untuk kegiatan ini."}
            </p>

            {sudahTerdaftar && (
              <>
                <h2 className="mt-8 font-display text-lg font-bold text-slate-900">Materi Pembelajaran</h2>
                {kegiatan.materi.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                    Materi belum diunggah oleh guru.
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {kegiatan.materi.map((m) => (
                      <li key={m.id}>
                        <a
                          href={m.filePath}
                          target={m.tipe === "LINK" ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-colors hover:border-brand-300 hover:bg-brand-50/50"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                            <Icon
                              name={m.tipe === "PDF" ? "picture_as_pdf" : m.tipe === "VIDEO" ? "play_circle" : "link"}
                              className="text-xl"
                            />
                          </span>
                          <span className="flex-1 font-medium text-slate-800">{m.judulMateri}</span>
                          <span className="badge border-slate-200 bg-slate-50 text-slate-600">
                            {tipeMateriLabel[m.tipe]}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card p-5 text-sm">
              <h3 className="font-display text-base font-bold text-slate-900">Info Kegiatan</h3>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-slate-500">Hari & Tanggal</dt>
                  <dd className="font-semibold text-slate-800">{formatTanggal(kegiatan.tanggal)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Waktu</dt>
                  <dd className="font-semibold text-slate-800">
                    {kegiatan.waktuMulai} - {kegiatan.waktuSelesai} WIB
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Peserta Terdaftar</dt>
                  <dd className="font-semibold text-slate-800">{kegiatan.jumlahSiswaDaftar} siswa</dd>
                </div>
              </dl>
            </div>

            {sudahTerdaftar ? (
              <div className="card p-5">
                <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  <Icon name="check_circle" className="text-lg" filled />
                  Anda terdaftar di kegiatan ini.
                </p>
              </div>
            ) : kegiatan.status === "SELESAI" ? (
              <div className="card p-5">
                <p className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-600">
                  Pendaftaran ditutup, kegiatan telah selesai.
                </p>
              </div>
            ) : (
              <form action={daftarKegiatan} className="card p-5">
                <input type="hidden" name="kegiatanId" value={kegiatanId} />
                <button type="submit" className="btn-primary w-full py-3">
                  <Icon name="how_to_reg" className="text-xl" />
                  Daftar Kegiatan Ini
                </button>
                <p className="mt-3 text-xs text-slate-500">
                  Setelah mendaftar, materi pembelajaran akan otomatis dapat diakses.
                </p>
              </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}