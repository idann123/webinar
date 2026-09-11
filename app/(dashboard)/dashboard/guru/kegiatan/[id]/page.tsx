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

export const metadata = { title: "Kelola Kegiatan" };

function toYyyyMmDd(d: Date): string {
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${m}-${day}`;
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

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/guru/kegiatan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <Icon name="arrow_back" className="text-base" />
          Kembali ke Daftar
        </Link>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-slate-900">Kelola Kegiatan</h1>
      </div>

      {/* Edit form */}
      <section>
        <h2 className="font-display text-lg font-bold text-slate-900">Informasi Kegiatan</h2>
        <div className="mt-3">
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
            }}
          />
        </div>
      </section>

      {/* Status */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">Status Kegiatan</h2>
        <p className="mt-1 text-sm text-slate-500">
          Status saat ini: <StatusBadge status={kegiatan.status} className="ml-1" /> — perbarui sesuai kondisi pelaksanaan.
        </p>
        <div className="mt-4">
          <StatusToggle kegiatanId={kegiatanId} current={kegiatan.status} />
        </div>
      </section>

      {/* Daftar siswa */}
      <section className="card p-6">
        <h2 className="font-display text-lg font-bold text-slate-900">
          Siswa Terdaftar{" "}
          <span className="ml-1 text-sm font-medium text-slate-400">
            ({kegiatan.pendaftaran.length})
          </span>
        </h2>

        {kegiatan.pendaftaran.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
            Belum ada siswa yang mendaftar.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-2.5">No</th>
                  <th className="px-3 py-2.5">Nama Siswa</th>
                  <th className="px-3 py-2.5">Kelas</th>
                  <th className="px-3 py-2.5">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kegiatan.pendaftaran.map((p, i) => (
                  <tr key={p.id}>
                    <td className="px-3 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-3 py-3 font-medium text-slate-800">{p.siswa.user.nama}</td>
                    <td className="px-3 py-3 text-slate-600">
                      {p.siswa.kelas.namaKelas} - {p.siswa.kelas.jurusan.namaJurusan}
                    </td>
                    <td className="px-3 py-3 text-slate-600">{formatTanggal(p.tanggalDaftar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Materi */}
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Materi Pembelajaran</h2>
        <MateriForms kegiatanId={kegiatanId} />

        {kegiatan.materi.length > 0 && (
          <div className="card divide-y divide-slate-100">
            {kegiatan.materi.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <Icon
                    name={m.tipe === "PDF" ? "picture_as_pdf" : m.tipe === "VIDEO" ? "play_circle" : "link"}
                    className="text-xl"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{m.judulMateri}</p>
                  <a href={m.filePath} target={m.tipe === "LINK" ? "_blank" : "_self"} rel="noopener noreferrer" className="truncate text-xs text-brand-700 hover:underline">
                    {m.filePath}
                  </a>
                </div>
                <span className="badge shrink-0 border-slate-200 bg-slate-50 text-slate-600">
                  {tipeMateriLabel[m.tipe]}
                </span>
                <ConfirmForm action={deleteMateri} message={`Hapus materi "${m.judulMateri}"?`}>
                  <input type="hidden" name="materiId" value={m.id} />
                  <button type="submit" aria-label="Hapus materi" className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                    <Icon name="delete" className="text-xl" />
                  </button>
                </ConfirmForm>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}