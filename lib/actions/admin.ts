"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { guruSchema, guruUpdateSchema, jurusanSchema, kelasSchema, mapelSchema } from "@/lib/validators";

export type MasterState = { error?: string; success?: string };

async function hapusFotoLama(current: string | null | undefined, next: string) {
  if (current?.startsWith("/uploads/") && current !== next) {
    try {
      await unlink(path.join(process.cwd(), "public", current));
    } catch {
      // file tidak ditemukan, abaikan
    }
  }
}

async function simpanFotoGuru(
  file: File | null,
  urlFoto: string,
  current?: string | null
): Promise<string | null> {
  if (file && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Format file foto harus berupa gambar.");
    }
    const ext = path.extname(file.name).toLowerCase() || ".jpg";
    const safeName = `${randomUUID()}${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await writeFile(path.join(dir, safeName), Buffer.from(await file.arrayBuffer()));
    const fotoBaru = `/uploads/${safeName}`;
    await hapusFotoLama(current, fotoBaru);
    return fotoBaru;
  }
  if (urlFoto) {
    await hapusFotoLama(current, urlFoto);
    return urlFoto;
  }
  return current ?? null;
}

export async function addJurusan(_p: MasterState, formData: FormData): Promise<MasterState> {
  await requireRole("ADMIN");
  const parsed = jurusanSchema.safeParse({ namaJurusan: formData.get("namaJurusan") });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await db.jurusan.create({
      data: { namaJurusan: parsed.data.namaJurusan.trim().toUpperCase() },
    });
  } catch {
    return { error: "Nama jurusan sudah ada." };
  }
  revalidatePath("/dashboard/admin");
  return { success: "Jurusan ditambahkan." };
}

export async function deleteJurusan(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.jurusan.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
}

export async function addKelas(_p: MasterState, formData: FormData): Promise<MasterState> {
  await requireRole("ADMIN");
  const parsed = kelasSchema.safeParse({
    namaKelas: formData.get("namaKelas"),
    jurusanId: formData.get("jurusanId"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await db.kelas.create({
      data: { namaKelas: parsed.data.namaKelas.trim().toUpperCase(), jurusanId: parsed.data.jurusanId },
    });
  } catch {
    return { error: "Kelas duplikat untuk jurusan tersebut." };
  }
  revalidatePath("/dashboard/admin");
  return { success: "Kelas ditambahkan." };
}

export async function deleteKelas(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.kelas.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
}

export async function addMapel(_p: MasterState, formData: FormData): Promise<MasterState> {
  await requireRole("ADMIN");
  const parsed = mapelSchema.safeParse({ namaMapel: formData.get("namaMapel") });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };
  try {
    await db.mapel.create({ data: { namaMapel: parsed.data.namaMapel.trim() } });
  } catch {
    return { error: "Nama mapel sudah ada." };
  }
  revalidatePath("/dashboard/admin");
  return { success: "Mapel ditambahkan." };
}

export async function deleteMapel(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.mapel.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
}

export async function createGuruByAdmin(_p: MasterState, formData: FormData): Promise<MasterState> {
  await requireRole("ADMIN");
  const mapelIdsRaw = formData.getAll("mapelId").map((m) => Number(m));
  const parsed = guruSchema.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    nip: formData.get("nip"),
    mapelIds: mapelIdsRaw,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email sudah terdaftar." };

  const nipExists = await db.guru.findUnique({ where: { nip: parsed.data.nip.trim() } });
  if (nipExists) return { error: "NIP sudah digunakan." };

  let foto: string | null;
  try {
    foto = await simpanFotoGuru(
      formData.get("fotoFile") as File | null,
      String(formData.get("foto") ?? "").trim()
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengunggah foto." };
  }

  await db.user.create({
    data: {
      nama: parsed.data.nama.trim(),
      email,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: "GURU",
      guru: {
        create: {
          nip: parsed.data.nip.trim(),
          jabatan: parsed.data.jabatan?.trim() || null,
          foto,
          mapelGuru: { create: parsed.data.mapelIds.map((mapelId) => ({ mapelId })) },
        },
      },
    },
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/");
  return { success: "Akun guru berhasil dibuat." };
}

export async function updateGuruByAdmin(
  guruId: number,
  _p: MasterState,
  formData: FormData
): Promise<MasterState> {
  await requireRole("ADMIN");
  const guru = await db.guru.findUnique({ where: { id: guruId } });
  if (!guru) return { error: "Data guru tidak ditemukan." };

  const mapelIdsRaw = formData.getAll("mapelId").map((m) => Number(m));
  const parsed = guruUpdateSchema.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    nip: formData.get("nip"),
    jabatan: formData.get("jabatan"),
    foto: formData.get("foto"),
    mapelIds: mapelIdsRaw,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message };

  const email = parsed.data.email.trim().toLowerCase();
  const existingEmail = await db.user.findFirst({
    where: { email, NOT: { id: guru.userId } },
  });
  if (existingEmail) return { error: "Email sudah terdaftar." };

  const nip = parsed.data.nip.trim();
  const existingNip = await db.guru.findFirst({ where: { nip, NOT: { id: guruId } } });
  if (existingNip) return { error: "NIP sudah digunakan." };

  let foto: string | null;
  try {
    foto = await simpanFotoGuru(
      formData.get("fotoFile") as File | null,
      String(formData.get("foto") ?? "").trim(),
      guru.foto
    );
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Gagal mengunggah foto." };
  }

  const passwordHash = parsed.data.password
    ? await bcrypt.hash(parsed.data.password, 10)
    : undefined;

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: guru.userId },
      data: {
        nama: parsed.data.nama.trim(),
        email,
        ...(passwordHash ? { password: passwordHash } : {}),
      },
    });
    await tx.guru.update({
      where: { id: guruId },
      data: { nip, jabatan: parsed.data.jabatan?.trim() || null, foto },
    });
    await tx.mapelGuru.deleteMany({ where: { guruId } });
    await tx.mapelGuru.createMany({
      data: parsed.data.mapelIds.map((mapelId) => ({ guruId, mapelId })),
    });
  });

  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/guru");
  revalidatePath("/");
  return { success: "Data guru berhasil diperbarui." };
}

export async function toggleUserStatus(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !["AKTIF", "NONAKTIF"].includes(status)) return;
  await db.user.update({ where: { id }, data: { status: status as "AKTIF" | "NONAKTIF" } });
  revalidatePath("/dashboard/admin");
}

export async function deleteSiswa(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  const user = await db.user.findFirst({ where: { id, role: "SISWA" } });
  if (!user) return;
  await db.user.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
}

export async function deleteGuru(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  const user = await db.user.findFirst({ where: { id, role: "GURU" } });
  if (!user) return;
  await db.user.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
}

export async function resetUserPassword(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  if (!id) return;
  await db.user.update({
    where: { id },
    data: { password: await bcrypt.hash("kosgoro123", 10) },
  });
  revalidatePath("/dashboard/admin");
}