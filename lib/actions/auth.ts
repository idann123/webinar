"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validators";

export type AuthState = { error?: string; success?: string };

async function parseEmailInput(value: string): Promise<string> {
  return value.trim().toLowerCase();
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Data tidak valid" };
  }

  const email = await parseEmailInput(parsed.data.email);
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Email atau password salah" };
  }

  const match = await bcrypt.compare(parsed.data.password, user.password);
  if (!match) {
    return { error: "Email atau password salah" };
  }

  if (user.status === "NONAKTIF") {
    return { error: "Akun Anda dinonaktifkan. Hubungi admin sekolah." };
  }

  await createSession({
    userId: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  });

  redirect(`/dashboard/${user.role.toLowerCase()}`);
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    kelasId: formData.get("kelasId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Data tidak valid" };
  }

  const email = await parseEmailInput(parsed.data.email);
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar. Silakan login." };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  const user = await db.user.create({
    data: {
      nama: parsed.data.nama.trim(),
      email,
      password: hash,
      role: "SISWA",
      siswa: { create: { kelasId: parsed.data.kelasId } },
    },
  });

  await createSession({
    userId: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  });

  redirect("/dashboard/siswa");
}

export async function logoutAction() {
  await destroySession();
  revalidatePath("/dashboard", "layout");
  redirect("/login");
}