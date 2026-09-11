"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/Icon";

const initialState: AuthState = {};

type KelasOption = { id: number; namaKelas: string; namaJurusan: string };

export function RegisterForm({ kelas }: { kelas: KelasOption[] }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Icon name="how_to_reg" className="text-2xl" filled />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Daftar Akun Siswa
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftarkan data diri Anda untuk mulai mengikuti kegiatan pembelajaran.
          </p>
        </div>

        {state.error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <Icon name="error" className="mt-0.5 text-lg" />
            <span>{state.error}</span>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="nama" className="label">Nama Lengkap</label>
            <input
              id="nama"
              name="nama"
              type="text"
              required
              minLength={3}
              placeholder="Contoh: Muhammad Bian"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">Email Aktif</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="nama@email.com"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="kelasId" className="label">Kelas</label>
            <select id="kelasId" name="kelasId" required className="input">
              <option value="">Pilih kelas Anda...</option>
              {kelas.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKelas} - {k.namaJurusan}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? (
              <>
                <Icon name="progress_activity" className="text-lg animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              <>
                <Icon name="person_add" className="text-lg" />
                Buat Akun & Masuk
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}