import Link from "next/link";
import { KegiatanHero } from "@/components/KegiatanHero";
import { Icon } from "@/components/Icon";
import { formatTanggalShort } from "@/lib/utils";

export type KegiatanCardData = {
  coverUrl?: string | null;
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
    <div className="card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <KegiatanHero
        coverUrl={kegiatan.coverUrl}
        status={kegiatan.status}
        jumlahDaftar={kegiatan.jumlahSiswaDaftar}
        className="aspect-video"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge border-brand-200 bg-brand-50 text-brand-700">
            {kegiatan.mapel}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {formatTanggalShort(kegiatan.tanggal)}
          </span>
        </div>

        <Link href={href}>
          <h3 className="mt-2 line-clamp-2 font-display text-lg font-bold text-slate-900 transition-colors hover:text-brand-700">
            {kegiatan.judulPembelajaran}
          </h3>
        </Link>

        {kegiatan.deskripsi && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{kegiatan.deskripsi}</p>
        )}

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p className="flex items-center gap-2">
            <Icon name="schedule" className="text-lg text-slate-400" />
            {kegiatan.waktuMulai} - {kegiatan.waktuSelesai} WIB
          </p>
          <p className="flex items-center gap-2">
            <Icon name="school" className="text-lg text-slate-400" />
            {kegiatan.guru}
          </p>
        </div>

        {children && (
          <div className="mt-auto border-t border-slate-100 pt-4 [&>*]:w-full">{children}</div>
        )}
      </div>
    </div>
  );
}
