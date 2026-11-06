import type { StatusKegiatan } from "@/lib/utils";
import { db } from "@/lib/db";

const ORDER: Record<StatusKegiatan, number> = {
  BELUM_MULAI: 0,
  BERLANGSUNG: 1,
  SELESAI: 2,
};

function parseWaktu(tanggal: Date, waktu: string): number {
  const [hh, mm] = waktu.split(":").map(Number);
  return Date.UTC(
    tanggal.getUTCFullYear(),
    tanggal.getUTCMonth(),
    tanggal.getUTCDate(),
    hh,
    mm,
    0,
    0
  );
}

export function deriveStatus(
  input: { tanggal: Date; waktuMulai: string; waktuSelesai: string },
  now: Date = new Date()
): StatusKegiatan {
  const mulai = parseWaktu(input.tanggal, input.waktuMulai);
  const selesai = parseWaktu(input.tanggal, input.waktuSelesai);
  const t = now.getTime();
  if (t > selesai) return "SELESAI";
  if (t >= mulai && t <= selesai) return "BERLANGSUNG";
  return "BELUM_MULAI";
}

export function advanceStatus(
  current: StatusKegiatan,
  derived: StatusKegiatan
): StatusKegiatan {
  return ORDER[derived] > ORDER[current] ? derived : current;
}

export async function syncKegiatanStatuses(): Promise<void> {
  const rows = await db.kegiatan.findMany({
    select: {
      id: true,
      tanggal: true,
      waktuMulai: true,
      waktuSelesai: true,
      status: true,
    },
    where: { status: { not: "SELESAI" } },
  });

  const updates: { id: number; status: StatusKegiatan }[] = [];
  for (const r of rows) {
    const next = advanceStatus(r.status, deriveStatus(r));
    if (next !== r.status) updates.push({ id: r.id, status: next });
  }

  await Promise.all(
    updates.map((u) =>
      db.kegiatan.update({ where: { id: u.id }, data: { status: u.status } })
    )
  );
}