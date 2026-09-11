"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { requireRole, requireSession } from "@/lib/session";
import { kegiatanSchema, materiLinkSchema } from "@/lib/validators";

export type KegiatanState = { error?: string; success?: string };

async function getGuru() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirst({ where: { userId: session.userId } });
  if (!guru) throw new Error("Data guru tidak ditemukan");
  return guru;
}

export async function createKegiatan(
  _prev: KegiatanState,
  formData: FormData
): Promise<KegiatanState> {
  const guru = await getGuru();

  const parsed = kegiatanSchema.safeParse({
    judulPembelajaran: formData.get("judulPembelajaran"),
    mapelId: formData.get("mapelId"),
    tanggal: formData.get("tanggal"),
    waktuMulai: formData.get("waktuMulai"),
    waktuSelesai: formData.get("waktuSelesai"),
    deskripsi: formData.get("deskripsi"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Data tidak valid" };
  }

  const ownMapel = await db.mapelGuru.findFirst({
    where: { guruId: guru.id, mapelId: parsed.data.mapelId },
  });
  if (!ownMapel) {
    return { error: "Anda tidak mengajar mata pelajaran tersebut." };
  }

  await db.kegiatan.create({
    data: {
      judulPembelajaran: parsed.data.judulPembelajaran.trim(),
      mapelId: parsed.data.mapelId,
      guruId: guru.id,
      tanggal: new Date(parsed.data.tanggal),
      waktuMulai: parsed.data.waktuMulai,
      waktuSelesai: parsed.data.waktuSelesai,
      status: "BELUM_MULAI",
      deskripsi: parsed.data.deskripsi.trim(),
    },
  });

  revalidatePath("/dashboard/guru");
  redirect("/dashboard/guru/kegiatan");
}

export async function updateKegiatan(
  kegiatanId: number,
  _prev: KegiatanState,
  formData: FormData
): Promise<KegiatanState> {
  const guru = await getGuru();
  const existing = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
  });
  if (!existing) return { error: "Kegiatan tidak ditemukan" };

  const parsed = kegiatanSchema.safeParse({
    judulPembelajaran: formData.get("judulPembelajaran"),
    mapelId: formData.get("mapelId"),
    tanggal: formData.get("tanggal"),
    waktuMulai: formData.get("waktuMulai"),
    waktuSelesai: formData.get("waktuSelesai"),
    deskripsi: formData.get("deskripsi"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Data tidak valid" };
  }

  const ownMapel = await db.mapelGuru.findFirst({
    where: { guruId: guru.id, mapelId: parsed.data.mapelId },
  });
  if (!ownMapel) {
    return { error: "Anda tidak mengajar mata pelajaran tersebut." };
  }

  await db.kegiatan.update({
    where: { id: kegiatanId },
    data: {
      judulPembelajaran: parsed.data.judulPembelajaran.trim(),
      mapelId: parsed.data.mapelId,
      tanggal: new Date(parsed.data.tanggal),
      waktuMulai: parsed.data.waktuMulai,
      waktuSelesai: parsed.data.waktuSelesai,
      deskripsi: parsed.data.deskripsi.trim(),
    },
  });

  revalidatePath("/dashboard/guru");
  redirect("/dashboard/guru/kegiatan");
}

export async function deleteKegiatan(formData: FormData) {
  const guru = await getGuru();
  const kegiatanId = Number(formData.get("kegiatanId"));
  if (!kegiatanId) return;

  const existing = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
  });
  if (!existing) return;

  await db.kegiatan.delete({ where: { id: kegiatanId } });
  revalidatePath("/dashboard/guru");
  revalidatePath("/dashboard/admin");
}

export async function updateStatus(formData: FormData) {
  const guru = await getGuru();
  const kegiatanId = Number(formData.get("kegiatanId"));
  const status = String(formData.get("status"));
  if (!["BELUM_MULAI", "BERLANGSUNG", "SELESAI"].includes(status)) return;

  const existing = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
  });
  if (!existing) return;

  await db.kegiatan.update({
    where: { id: kegiatanId },
    data: { status: status as "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI" },
  });
  revalidatePath("/dashboard/guru");
  revalidatePath("/kegiatan");
}

async function syncKegiatanStatus(kegiatanId: number, tanggal: Date, waktuMulai: string) {
  const [hh, mm] = waktuMulai.split(":").map(Number);
  const mulai = new Date(tanggal);
  mulai.setHours(hh, mm, 0, 0);

  const now = new Date();
  let nextStatus: "BELUM_MULAI" | "BERLANGSUNG" | "SELESAI" | null = null;
  if (now > mulai) nextStatus = "BERLANGSUNG";
  if (nextStatus) {
    await db.kegiatan.updateMany({
      where: { id: kegiatanId, status: { in: ["BELUM_MULAI"] } },
      data: { status: nextStatus },
    });
  }
}

export async function daftarKegiatan(formData: FormData) {
  const session = await requireSession();
  if (session.role !== "SISWA") return;

  const kegiatanId = Number(formData.get("kegiatanId"));
  if (!kegiatanId) return;

  const siswa = await db.siswa.findFirst({ where: { userId: session.userId } });
  if (!siswa) return;

  await db.$transaction(async (tx) => {
    const kegiatan = await tx.kegiatan.findUnique({ where: { id: kegiatanId } });
    if (!kegiatan) return;
    await syncKegiatanStatus(kegiatanId, kegiatan.tanggal, kegiatan.waktuMulai);

    const sudah = await tx.pendaftaran.findUnique({
      where: { siswaId_kegiatanId: { siswaId: siswa.id, kegiatanId } },
    });
    if (sudah || kegiatan.status === "SELESAI") return;

    await tx.pendaftaran.create({
      data: { siswaId: siswa.id, kegiatanId },
    });
    await tx.kegiatan.update({
      where: { id: kegiatanId },
      data: { jumlahSiswaDaftar: { increment: 1 } },
    });
  });

  revalidatePath("/dashboard/siswa");
  revalidatePath("/kegiatan");
}

export async function uploadMateri(
  _prev: KegiatanState,
  formData: FormData
): Promise<KegiatanState> {
  const guru = await getGuru();
  const kegiatanId = Number(formData.get("kegiatanId"));
  const judulMateri = String(formData.get("judulMateri") ?? "");
  const file = formData.get("file") as File | null;

  if (!kegiatanId) return { error: "ID kegiatan tidak valid" };
  if (judulMateri.trim().length < 3) return { error: "Judul materi minimal 3 karakter" };
  if (!file || file.size === 0) return { error: "Pilih file untuk diunggah" };

  const kegiatan = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
  });
  if (!kegiatan) return { error: "Kegiatan tidak ditemukan" };

  const ext = path.extname(file.name).toLowerCase() || ".bin";
  const safeName = `${randomUUID()}${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));

  const tipe = file.type === "application/pdf" ? "PDF" : file.type.startsWith("video") ? "VIDEO" : "LINK";

  await db.materi.create({
    data: {
      kegiatanId,
      judulMateri: judulMateri.trim(),
      filePath: `/uploads/${safeName}`,
      tipe,
    },
  });

  revalidatePath("/dashboard/guru");
  return { success: "Materi berhasil diunggah." };
}

export async function addMateriLink(
  _prev: KegiatanState,
  formData: FormData
): Promise<KegiatanState> {
  const guru = await getGuru();
  const kegiatanId = Number(formData.get("kegiatanId"));

  const parsed = materiLinkSchema.safeParse({
    judulMateri: formData.get("judulMateri"),
    url: formData.get("url"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Data tidak valid" };

  const kegiatan = await db.kegiatan.findFirst({
    where: { id: kegiatanId, guruId: guru.id },
  });
  if (!kegiatan) return { error: "Kegiatan tidak ditemukan" };

  await db.materi.create({
    data: {
      kegiatanId,
      judulMateri: parsed.data.judulMateri.trim(),
      filePath: parsed.data.url,
      tipe: "LINK",
    },
  });

  revalidatePath("/dashboard/guru");
  return { success: "Link materi berhasil ditambahkan." };
}

export async function deleteMateri(formData: FormData) {
  const guru = await getGuru();
  const materiId = Number(formData.get("materiId"));
  if (!materiId) return;

  const materi = await db.materi.findFirst({
    where: { id: materiId, kegiatan: { guruId: guru.id } },
    include: { kegiatan: true },
  });
  if (!materi) return;

  if (materi.filePath.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", materi.filePath));
    } catch {
      // file tidak ditemukan, abaikan
    }
  }

  await db.materi.delete({ where: { id: materiId } });
  revalidatePath("/dashboard/guru");
}