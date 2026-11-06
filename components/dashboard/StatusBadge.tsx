import { cn, statusLabel, statusStyles } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statusStyles[status as keyof typeof statusStyles] ?? statusStyles.BELUM_MULAI;
  return (
    <span className={cn("badge", s.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {statusLabel[status as keyof typeof statusLabel] ?? status}
    </span>
  );
}