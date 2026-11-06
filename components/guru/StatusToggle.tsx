import { updateStatus } from "@/lib/actions/kegiatan";
import { cn, statusLabel } from "@/lib/utils";

const STATUSES = ["BELUM_MULAI", "BERLANGSUNG", "SELESAI"] as const;

export function StatusToggle({
  kegiatanId,
  current,
}: {
  kegiatanId: number;
  current: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUSES.map((s) => (
        <form key={s} action={updateStatus}>
          <input type="hidden" name="kegiatanId" value={kegiatanId} />
          <input type="hidden" name="status" value={s} />
          <button
            type="submit"
            disabled={s === current}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-default",
              s === current
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            )}
          >
            {statusLabel[s]}
          </button>
        </form>
      ))}
    </div>
  );
}