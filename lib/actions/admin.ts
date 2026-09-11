"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { guruSchema, jurusanSchema, kelasSchema, mapelSchema } from "@/lib/validators";

export type MasterState = { error?: string; success?: string };

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

  await db.user.create({
    data: {
      nama: parsed.data.nama.trim(),
      email,
      password: await bcrypt.hash(parsed.data.password, 10),
      role: "GURU",
      guru: {
        create: {
          nip: parsed.data.nip.trim(),
          mapelGuru: { create: parsed.data.mapelIds.map((mapelId) => ({ mapelId })) },
        },
      },
    },
  });

  revalidatePath("/dashboard/admin");
  return { success: "Akun guru berhasil dibuat." };
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