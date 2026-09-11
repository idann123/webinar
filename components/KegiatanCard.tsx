import Link from "next/link";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Icon } from "@/components/Icon";
import { formatTanggalShort } from "@/lib/utils";

export type KegiatanCardData = {
  id: number;
  judulPembelajaran: string;
  mapel: string;
  guru: string;
  tanggal: Date;
  waktuMulai: string;
  waktuSelesai: string;
  status: string;
  jumlahSiswaDaftar: number;
  deskripsi?: string | null;
};

export function KegiatanCard({
  kegiatan,
  href,
  children,
}: {
  kegiatan: KegiatanCardData;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3">
        <StatusBadge status={kegiatan.status} />
        <p className="text-xs font-medium text-slate-500">
          <Icon name="group" className="mr-1 text-base text-brand-600" />
          {kegiatan.jumlahSiswaDaftar} daftar
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
          {kegiatan.mapel}
        </span>
        <Link href={href}>
          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-bold text-slate-900 transition-colors hover:text-brand-700">
            {kegiatan.judulPembelajaran}
          </h3>
        </Link>

        {kegiatan.deskripsi && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{kegiatan.deskripsi}</p>
        )}

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Icon name="calendar_today" className="text-lg text-slate-400" />
            {formatTanggalShort(kegiatan.tanggal)}
          </p>
          <p className="flex items-center gap-2">
            <Icon name="schedule" className="text-lg text-slate-400" />
            {kegiatan.waktuMulai} - {kegiatan.waktuSelesai} WIB
          </p>
          <p className="flex items-center gap-2">
            <Icon name="school" className="text-lg text-slate-400" />
            {kegiatan.guru}
          </p>
        </div>

        {children && <div className="mt-5 pt-4 border-t border-slate-100">{children}</div>}
      </div>
    </div>
  );
}