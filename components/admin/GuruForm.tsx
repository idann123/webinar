"use client";

import { useActionState } from "react";
import { createGuruByAdmin, type MasterState } from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export function GuruForm({ mapel }: { mapel: { id: number; namaMapel: string }[] }) {
  const [state, formAction, pending] = useActionState(createGuruByAdmin, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const el = e.currentTarget as HTMLFormElement;
        if ((el.querySelector(".mf-success") as HTMLElement | null)) el.reset();
      }}
      className="card space-y-5 p-6 sm:p-8"
    >
      <h2 className="font-display text-base font-bold text-slate-900">Formulir Guru Baru</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gNama" className="label">Nama Lengkap</label>
          <input id="gNama" name="nama" type="text" required minLength={3} className="input" placeholder="Nama guru" />
        </div>
        <div>
          <label htmlFor="gNip" className="label">NIP</label>
          <input id="gNip" name="nip" type="text" required className="input" placeholder="Contoh: 198706152010121002" />
        </div>
        <div>
          <label htmlFor="gEmail" className="label">Email</label>
          <input id="gEmail" name="email" type="email" required className="input" placeholder="nama@kosgoro.sch.id" />
        </div>
        <div>
          <label htmlFor="gPassword" className="label">Password Awal</label>
          <input id="gPassword" name="password" type="text" required minLength={6} className="input" placeholder="Minimal 6 karakter" />
        </div>
      </div>

      <div>
        <p className="label">Mapel yang Diampu</p>
        {mapel.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada mapel. Tambahkan dulu di menu Data Master → Mapel.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {mapel.map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
              >
                <input
                  type="checkbox"
                  name="mapelId"
                  value={m.id}
                  className="h-4 w-4 accent-brand-600"
                />
                {m.namaMapel}
              </label>
            ))}
          </div>
        )}
      </div>

      {state.error && (
        <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-700">
          <Icon name="error" className="text-lg" /> {state.error}
        </p>
      )}
      {state.success && (
        <p className="mf-success flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700">
          <Icon name="check_circle" className="text-lg" filled /> {state.success}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary">
        <Icon name="person_add" className="text-xl" />
        {pending ? "Menyimpan..." : "Buat Akun Guru"}
      </button>
    </form>
  );
}