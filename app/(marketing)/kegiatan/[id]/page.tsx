import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { daftarKegiatan } from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatTanggal, tipeMateriLabel } from "@/lib/utils";

export default async function KegiatanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kegiatanId = Number(id);
  if (!kegiatanId) notFound();

  const kegiatan = await db.kegiatan.findUnique({
    where: { id: kegiatanId },
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: true,
    },
  });
  if (!kegiatan) notFound();

  const session = await getSession();
  let sudahTerdaftar = false;
  if (session?.role === "SISWA") {
    const siswa = await db.siswa.findFirst({ where: { userId: session.userId } });
    if (siswa) {
      const p = await db.pendaftaran.findUnique({
        where: { siswaId_kegiatanId: { siswaId: siswa.id, kegiatanId } },
      });
      sudahTerdaftar = Boolean(p);
    }
  }

  const canAccessMateri = session?.role === "SISWA";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/kegiatan" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <Icon name="arrow_back" className="text-base" />
        Kembali ke Daftar Kegiatan
      </Link>

      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={kegiatan.status} />
            <span className="badge border-brand-200 bg-brand-50 text-brand-700">
              {kegiatan.mapel.namaMapel}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {kegiatan.judulPembelajaran}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-lg font-bold text-slate-900">Deskripsi Kegiatan</h2>
            <p className="mt-3 whitespace-pre-line text-slate-600">
              {kegiatan.deskripsi || "Belum ada deskripsi untuk kegiatan ini."}
            </p>

            <h2 className="mt-8 font-display text-lg font-bold text-slate-900">Daftar Peserta</h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
              <Icon name="group" className="text-xl text-brand-600" />
              {kegiatan.jumlahSiswaDaftar} siswa telah mendaftar pada kegiatan ini.
            </p>

            {canAccessMateri && session && kegiatan.materi.length > 0 && (
              <>
                <h2 className="mt-8 font-display text-lg font-bold text-slate-900">Materi Pembelajaran</h2>
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
                          <Icon name={m.tipe === "PDF" ? "picture_as_pdf" : m.tipe === "VIDEO" ? "play_circle" : "link"} className="text-xl" />
                        </span>
                        <span className="flex-1 font-medium text-slate-800">{m.judulMateri}</span>
                        <span className="badge border-slate-200 bg-slate-50 text-slate-600">
                          {tipeMateriLabel[m.tipe]}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="space-y-6">
            <div className="card p-5">
              <h3 className="font-display text-base font-bold text-slate-900">Info Kegiatan</h3>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Icon name="calendar_today" className="mt-0.5 text-xl text-brand-600" />
                  <div>
                    <dt className="font-medium text-slate-500">Hari & Tanggal</dt>
                    <dd className="font-semibold text-slate-800">{formatTanggal(kegiatan.tanggal)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="schedule" className="mt-0.5 text-xl text-brand-600" />
                  <div>
                    <dt className="font-medium text-slate-500">Waktu</dt>
                    <dd className="font-semibold text-slate-800">
                      {kegiatan.waktuMulai} - {kegiatan.waktuSelesai} WIB
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="school" className="mt-0.5 text-xl text-brand-600" />
                  <div>
                    <dt className="font-medium text-slate-500">Guru Pengajar</dt>
                    <dd className="font-semibold text-slate-800">{kegiatan.guru.user.nama}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="category" className="mt-0.5 text-xl text-brand-600" />
                  <div>
                    <dt className="font-medium text-slate-500">Mata Pelajaran</dt>
                    <dd className="font-semibold text-slate-800">{kegiatan.mapel.namaMapel}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="card p-5">
              {session ? (
                session.role === "SISWA" ? (
                  sudahTerdaftar ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                      <Icon name="check_circle" className="text-lg" filled />
                      Anda sudah terdaftar di kegiatan ini.
                    </div>
                  ) : kegiatan.status === "SELESAI" ? (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Kegiatan sudah selesai, pendaftaran ditutup.
                    </p>
                  ) : (
                    <form action={daftarKegiatan}>
                      <input type="hidden" name="kegiatanId" value={kegiatanId} />
                      <button type="submit" className="btn-primary w-full py-3">
                        <Icon name="how_to_reg" className="text-xl" />
                        Daftar Kegiatan Ini
                      </button>
                    </form>
                  )
                ) : (
                  <Link href={`/dashboard/${session.role.toLowerCase()}`} className="btn-outline w-full">
                    <Icon name="dashboard" className="text-lg" />
                    Buka Dashboard
                  </Link>
                )
              ) : (
                <div className="space-y-2.5 text-center">
                  <p className="text-sm text-slate-600">
                    Login sebagai siswa untuk mendaftar dan mengakses materi.
                  </p>
                  <Link href="/login" className="btn-primary w-full">
                    Masuk
                  </Link>
                  <Link href="/register" className="btn-outline w-full">
                    Daftar Akun Siswa
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}