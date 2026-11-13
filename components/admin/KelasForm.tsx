"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addKelas, updateKelas, type MasterState } from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export type KelasFormValues = {
  namaKelas: string;
  jurusanId: number;
};

export function KelasForm({
  jurusan,
  kelasId,
  initial,
  backHref,
}: {
  jurusan: { id: number; namaJurusan: string }[];
  kelasId?: number;
  initial?: Partial<KelasFormValues>;
  backHref: string;
}) {
  const action = kelasId ? updateKelas.bind(null, kelasId) : addKelas;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      <h2 className="font-display text-base font-bold text-slate-900">
        {kelasId ? "Edit Data Kelas" : "Formulir Kelas Baru"}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="kNamaKelas" className="label">Nama Kelas</label>
          <input
            id="kNamaKelas"
            name="namaKelas"
            type="text"
            required
            defaultValue={initial?.namaKelas}
            className="input"
            placeholder="Contoh: XI RPL 1"
          />
        </div>
        <div>
          <label htmlFor="kJurusan" className="label">Jurusan</label>
          <select
            id="kJurusan"
            name="jurusanId"
            required
            defaultValue={initial?.jurusanId ? String(initial.jurusanId) : ""}
            className="input"
            disabled={jurusan.length === 0}
          >
            <option value="" disabled>Pilih jurusan...</option>
            {jurusan.map((j) => (
              <option key={j.id} value={j.id}>
                {j.namaJurusan}
              </option>
            ))}
          </select>
          {jurusan.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              Belum ada jurusan. Tambahkan dulu di menu Data Master → Jurusan.
            </p>
          )}
        </div>
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
        <button type="submit" disabled={pending || jurusan.length === 0} className="btn-primary">
          <Icon name={kelasId ? "save" : "add"} className="text-xl" />
          {pending ? "Menyimpan..." : kelasId ? "Simpan Perubahan" : "Tambah Kelas"}
        </button>
      </div>
    </form>
  );
}
