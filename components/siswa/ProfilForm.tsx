"use client";

import { useActionState, useState } from "react";
import { updatePasswordAction, type AuthState } from "@/lib/actions/auth";
import { Icon } from "@/components/Icon";

const initialState: AuthState = {};

export function ProfilForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <Icon name="error" className="shrink-0 text-lg" />
          <span>{state.error}</span>
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          <Icon name="check_circle" className="shrink-0 text-lg" />
          <span>{state.success}</span>
        </div>
      )}

      <div>
        <label className="label" htmlFor="currentPassword">
          Password Saat Ini
        </label>
        <div className="relative">
          <input
            id="currentPassword"
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            required
            placeholder="••••••••"
            className="input pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            tabIndex={-1}
          >
            <Icon name={showCurrent ? "visibility_off" : "visibility"} className="text-lg" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="newPassword">
            Password Baru
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? "text" : "password"}
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              <Icon name={showNew ? "visibility_off" : "visibility"} className="text-lg" />
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="confirmPassword">
            Konfirmasi Password Baru
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="Ketik ulang password"
            className="input"
          />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          <Icon name="lock_reset" className="text-lg" />
          {pending ? "Menyimpan..." : "Perbarui Password"}
        </button>
      </div>
    </form>
  );
}
