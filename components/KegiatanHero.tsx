import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";

export function KegiatanHero({
  status,
  jumlahDaftar,
  coverUrl,
  className,
}: {
  status: string;
  jumlahDaftar: number;
  coverUrl?: string | null;
  className?: string;
}) {
  const hasCover = !!coverUrl;

  return (
    <div
      className={cn(
        "relative isolate min-h-[8rem] overflow-hidden border-b-2 border-[#0F1B3D] bg-[#17408F]",
        className
      )}
      style={
        hasCover
          ? {
              backgroundImage: `url("${coverUrl}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Lapisan dekoratif disembunyikan dari pembaca layar */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {hasCover ? (
          // Gelap di bawah agar foto tetap terbaca dan chip menonjol
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1B3D]/75 via-[#17408F]/25 to-[#0F1B3D]/10" />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#1E78E6] via-[#17408F] to-[#0F1B3D]" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)",
                backgroundSize: "18px 18px",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
                maskImage: "linear-gradient(to bottom, black 0%, transparent 85%)",
              }}
            />
            <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-[#FFC83D]" />
            <div className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-[#8CCBFF]/70" />

            {/* ikon tengah menggantikan foto yang belum ada */}
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]">
                <Icon name="play_circle" className="text-3xl" filled />
              </span>
            </div>
          </>
        )}
      </div>

      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <span className="inline-flex rounded-full border-2 border-[#0F1B3D] bg-white p-0.5 shadow-[2px_2px_0_0_#0F1B3D]">
          <StatusBadge status={status} />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] bg-white px-2.5 py-1 text-xs font-bold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
          <Icon name="group" className="text-sm text-[#1E78E6]" filled />
          <span className="tabular-nums">{jumlahDaftar}</span> daftar
        </span>
      </div>
    </div>
  );
}