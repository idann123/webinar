export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatTanggal(value: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatTanggalShort(value: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function formatTanggalLengkap(value: Date | string): string {
  const d = new Date(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export type StatusKegiatan = "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI";

export const statusLabel: Record<StatusKegiatan, string> = {
  BELUM_MULAI: "Belum Mulai",
  BERLANGSUNG: "Berlangsung",
  SELESAI: "Selesai",
};

export const statusStyles: Record<
  StatusKegiatan,
  { badge: string; dot: string }
> = {
  BELUM_MULAI: {
    badge: "bg-sky-100 text-sky-800 border-sky-300",
    dot: "bg-sky-500",
  },
  BERLANGSUNG: {
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
    dot: "bg-emerald-500",
  },
  SELESAI: {
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
  },
};

export const roleLabel: Record<string, string> = {
  SISWA: "Siswa",
  GURU: "Guru",
  ADMIN: "Admin",
};

export const tipeMateriLabel: Record<string, string> = {
  PDF: "PDF",
  VIDEO: "Video",
  LINK: "Link",
};