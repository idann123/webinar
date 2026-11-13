"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createSiswaByAdmin,
  updateSiswaByAdmin,
  type MasterState,
} from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export type SiswaFormValues = {
  nama: string;
  email: string;
  kelasId: number;
};

export function SiswaForm({
  kelas,
  siswaId,
  initial,
  backHref,
}: {
  kelas: { id: number; namaKelas: string; namaJurusan: string }[];
  siswaId?: number;
  initial?: Partial<SiswaFormValues>;
  backHref: string;
}) {
  const action = siswaId
    ? updateSiswaByAdmin.bind(null, siswaId)
    : createSiswaByAdmin;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      <h2 className="font-display text-base font-bold text-slate-900">
        {siswaId ? "Edit Data Siswa" : "Formulir Siswa Baru"}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="sNama" className="label">Nama Lengkap</label>
          <input
            id="sNama"
            name="nama"
            type="text"
            required
            minLength={3}
            defaultValue={initial?.nama}
            className="input"
            placeholder="Nama siswa"
          />
        </div>
        <div>
          <label htmlFor="sEmail" className="label">Email</label>
          <input
            id="sEmail"
            name="email"
            type="email"
            required
            defaultValue={initial?.email}
            className="input"
            placeholder="nama@siswa.smkosgoro.sch.id"
          />
        </div>
        <div>
          <label htmlFor="sPassword" className="label">
            Password{" "}
            {siswaId && <span className="text-xs font-normal text-slate-400">(Kosongkan bila tidak diubah)</span>}
          </label>
          <input
            id="sPassword"
            name="password"
            type="text"
            required={!siswaId}
            minLength={6}
            className="input"
            placeholder={siswaId ? "••••••" : "Minimal 6 karakter"}
          />
        </div>
        <div>
          <label htmlFor="sKelas" className="label">Kelas</label>
          <select
            id="sKelas"
            name="kelasId"
            required
            defaultValue={initial?.kelasId ? String(initial.kelasId) : ""}
            className="input"
            disabled={kelas.length === 0}
          >
            <option value="" disabled>Pilih kelas...</option>
            {kelas.map((k) => (
              <option key={k.id} value={k.id}>
                {k.namaKelas} - {k.namaJurusan}
              </option>
            ))}
          </select>
          {kelas.length === 0 && (
            <p className="mt-1.5 text-xs text-amber-600">
              Belum ada kelas. Tambahkan dulu di menu Data Master → Kelas.
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
        <button type="submit" disabled={pending || kelas.length === 0} className="btn-primary">
          <Icon name={siswaId ? "save" : "person_add"} className="text-xl" />
          {pending ? "Menyimpan..." : siswaId ? "Simpan Perubahan" : "Buat Akun Siswa"}
        </button>
      </div>
    </form>
  );
}
