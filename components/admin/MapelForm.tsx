"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addMapel, updateMapel, type MasterState } from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export function MapelForm({
  mapelId,
  initial,
  backHref,
}: {
  mapelId?: number;
  initial?: { namaMapel?: string };
  backHref: string;
}) {
  const action = mapelId ? updateMapel.bind(null, mapelId) : addMapel;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      <h2 className="font-display text-base font-bold text-slate-900">
        {mapelId ? "Edit Data Mapel" : "Formulir Mapel Baru"}
      </h2>

      <div>
        <label htmlFor="mNamaMapel" className="label">Nama Mapel</label>
        <input
          id="mNamaMapel"
          name="namaMapel"
          type="text"
          required
          minLength={2}
          defaultValue={initial?.namaMapel}
          className="input"
          placeholder="Contoh: Pemrograman Web"
        />
      </div>

      {state.error && (
        <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-700">
          <Icon name="error" className="text-lg" /> {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700">
          <Icon name="check_circle" className="text-lg" filled /> {state.success}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link href={backHref} className="btn-outline">Batal</Link>
        <button type="submit" disabled={pending} className="btn-primary">
          <Icon name={mapelId ? "save" : "add"} className="text-xl" />
          {pending ? "Menyimpan..." : mapelId ? "Simpan Perubahan" : "Tambah Mapel"}
        </button>
      </div>
    </form>
  );
}
