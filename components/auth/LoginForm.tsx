"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/Icon";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
            <Icon name="login" className="text-2xl" filled />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Masuk ke Akun
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Silakan masuk menggunakan email dan password Anda.
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
            <label htmlFor="email" className="label">Email</label>
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
              autoComplete="current-password"
              placeholder="••••••••"
              className="input"
            />
          </div>

          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? (
              <>
                <Icon name="progress_activity" className="text-lg animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Icon name="login" className="text-lg" />
                Masuk
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Daftar sebagai Siswa
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Akun demo tersedia di menu Daftar / via admin sekolah.
      </p>
    </div>
  );
}