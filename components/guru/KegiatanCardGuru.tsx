import Link from "next/link";
import { deleteKegiatan } from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";
import { ConfirmForm } from "@/components/ConfirmForm";
import { StatusToggle } from "@/components/guru/StatusToggle";
import { KegiatanHero } from "@/components/KegiatanHero";
import { formatTanggalShort } from "@/lib/utils";

type KegiatanCardGuruProps = {
  id: number;
  judulPembelajaran: string;
  mapel: string;
  tanggal: Date | string;
  waktuMulai: string;
  waktuSelesai: string;
  status: "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI";
  jumlahPeserta: number;
  jumlahMateri: number;
  coverUrl?: string | null;
  showStatusToggle?: boolean;
};

export function KegiatanCardGuru({
  id,
  judulPembelajaran,
  mapel,
  tanggal,
  waktuMulai,
  waktuSelesai,
  status,
  jumlahPeserta,
  jumlahMateri,
  coverUrl,
  showStatusToggle = true,
}: KegiatanCardGuruProps) {
  return (
    <div className="card overflow-hidden transition-shadow hover:shadow-sm">
      <KegiatanHero
        status={status}
        jumlahDaftar={jumlahPeserta}
        coverUrl={coverUrl}
        className="h-28 sm:h-36"
      />
      <div className="p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge border-brand-200 bg-brand-50 text-brand-700">
                {mapel}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {formatTanggalShort(tanggal)}
              </span>
            </div>
            <Link href={`/dashboard/guru/kegiatan/${id}`}>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-900 transition-colors hover:text-brand-700">
                {judulPembelajaran}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-slate-500">
              {waktuMulai} - {waktuSelesai} WIB
            </p>
            <p className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Icon name="folder_open" className="text-sm" /> {jumlahMateri} materi
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="group" className="text-sm" /> {jumlahPeserta} peserta
              </span>
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/dashboard/guru/kegiatan/${id}`} className="btn-outline">
              <Icon name="edit" className="text-lg" />
              Kelola
            </Link>
            <ConfirmForm
              action={deleteKegiatan}
              message={`Hapus kegiatan "${judulPembelajaran}"? Semua materinya ikut terhapus.`}
            >
              <input type="hidden" name="kegiatanId" value={id} />
              <button type="submit" className="btn-danger" aria-label="Hapus kegiatan">
                <Icon name="delete" className="text-lg" />
              </button>
            </ConfirmForm>
          </div>
        </div>

        {showStatusToggle && (
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">Ubah status kegiatan:</p>
            <StatusToggle kegiatanId={id} current={status} />
          </div>
        )}
      </div>
    </div>
  );
}
