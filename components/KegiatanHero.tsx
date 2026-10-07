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
      aria-hidden
      className={cn("relative isolate overflow-hidden bg-brand-600", className)}
      style={
        hasCover
          ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              backgroundImage: "linear-gradient(135deg, #0f7bff 0%, #0b5ed7 100%)",
            }
      }
    >
      {hasCover && (
        <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[0.5px]" />
      )}

      {!hasCover && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.55) 1px, transparent 0)",
            backgroundSize: "14px 14px",
          }}
        />
      )}

      <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

      <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
        <span className="inline-flex rounded-full bg-white/95 p-1 shadow-sm backdrop-blur-sm">
          <StatusBadge status={status} />
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
          <Icon name="group" className="text-sm text-brand-600" />
          {jumlahDaftar} daftar
        </span>
      </div>
    </div>
  );
}
