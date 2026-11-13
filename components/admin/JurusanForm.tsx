"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addJurusan, updateJurusan, type MasterState } from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export function JurusanForm({
  jurusanId,
  initial,
  backHref,
}: {
  jurusanId?: number;
  initial?: { namaJurusan?: string };
  backHref: string;
}) {
  const action = jurusanId ? updateJurusan.bind(null, jurusanId) : addJurusan;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      <h2 className="font-display text-base font-bold text-slate-900">
        {jurusanId ? "Edit Data Jurusan" : "Formulir Jurusan Baru"}
      </h2>

      <div>
        <label htmlFor="jNamaJurusan" className="label">Nama Jurusan</label>
        <input
          id="jNamaJurusan"
          name="namaJurusan"
          type="text"
          required
          minLength={2}
          defaultValue={initial?.namaJurusan}
          className="input"
          placeholder="Contoh: RPL"
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
          <Icon name={jurusanId ? "save" : "add"} className="text-xl" />
          {pending ? "Menyimpan..." : jurusanId ? "Simpan Perubahan" : "Tambah Jurusan"}
        </button>
      </div>
    </form>
  );
}
