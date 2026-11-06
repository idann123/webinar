"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function tandaiNotifikasiDibaca(notifikasiId: number) {
  const session = await requireSession();
  if (session.role !== "SISWA") return;

  await db.notifikasi.updateMany({
    where: { id: notifikasiId, userId: session.userId },
    data: { dibaca: true },
  });
  revalidatePath("/dashboard", "layout");
}

export async function tandaiSemuaNotifikasiDibaca() {
  const session = await requireSession();
  if (session.role !== "SISWA") return;

  await db.notifikasi.updateMany({
    where: { userId: session.userId, dibaca: false },
    data: { dibaca: true },
  });
  revalidatePath("/dashboard", "layout");
}
