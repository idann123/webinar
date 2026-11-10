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

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";

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
    <div className="overflow-hidden rounded-2xl border-2 border-[#0F1B3D] bg-white shadow-[4px_4px_0_0_#0F1B3D]">
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
              <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-[#CFE7FF] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]">
                {mapel}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F1B3D]/65">
                <Icon name="event_available" className="text-sm text-[#1E78E6]" filled />
                {formatTanggalShort(tanggal)}
              </span>
            </div>

            <Link
              href={`/dashboard/guru/kegiatan/${id}`}
              className={`mt-2 block rounded-lg ${FOCUS}`}
            >
              <h3 className="font-display text-xl font-extrabold leading-snug text-[#0F1B3D] underline-offset-4 hover:underline">
                {judulPembelajaran}
              </h3>
            </Link>

            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-[#0F1B3D]/65">
              <Icon name="schedule" className="text-base text-[#1E78E6]" filled />
              <span className="tabular-nums">
                {waktuMulai} - {waktuSelesai} WIB
              </span>
            </p>

            <p className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#0F1B3D]">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-[#FFE08A] px-2.5 py-0.5">
                <Icon name="folder_open" className="text-sm" filled />
                <span className="tabular-nums">{jumlahMateri}</span> materi
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-[#E6DCFF] px-2.5 py-0.5">
                <Icon name="group" className="text-sm" filled />
                <span className="tabular-nums">{jumlahPeserta}</span> peserta
              </span>
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <Link
              href={`/dashboard/guru/kegiatan/${id}`}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[1px_1px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`}
            >
              <Icon name="edit" className="text-lg" />
              Kelola
            </Link>
            <ConfirmForm
              action={deleteKegiatan}
              message={`Hapus kegiatan "${judulPembelajaran}"? Semua materinya ikut terhapus.`}
            >
              <input type="hidden" name="kegiatanId" value={id} />
              <button
                type="submit"
                aria-label={`Hapus kegiatan ${judulPembelajaran}`}
                className={`grid h-10 w-10 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#C0261D] shadow-[3px_3px_0_0_#0F1B3D] hover:bg-[#FFE3E0] hover:shadow-[1px_1px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`}
              >
                <Icon name="delete" className="text-xl" />
              </button>
            </ConfirmForm>
          </div>
        </div>

        {showStatusToggle && (
          <div className="mt-5 flex flex-col gap-3 border-t-2 border-dashed border-[#0F1B3D]/25 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-2 text-sm font-bold text-[#0F1B3D]">
              <Icon name="toggle_on" className="text-xl text-[#1E78E6]" filled />
              Ubah status kegiatan
            </p>
            <StatusToggle kegiatanId={id} current={status} />
          </div>
        )}
      </div>
    </div>
  );
}