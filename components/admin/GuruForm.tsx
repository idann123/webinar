"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createGuruByAdmin,
  updateGuruByAdmin,
  type MasterState,
} from "@/lib/actions/admin";
import { Icon } from "@/components/Icon";

const initialState: MasterState = {};

export type GuruFormValues = {
  nama: string;
  nip: string;
  email: string;
  jabatan: string;
  foto: string;
  mapelIds: number[];
};

export function GuruForm({
  mapel,
  guruId,
  initial,
  backHref,
}: {
  mapel: { id: number; namaMapel: string }[];
  guruId?: number;
  initial?: Partial<GuruFormValues>;
  backHref: string;
}) {
  const action = guruId
    ? updateGuruByAdmin.bind(null, guruId)
    : createGuruByAdmin;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const el = e.currentTarget as HTMLFormElement;
        if (!guruId && el.querySelector(".mf-success")) el.reset();
      }}
      className="card space-y-5 p-6 sm:p-8"
    >
      <h2 className="font-display text-base font-bold text-slate-900">
        {guruId ? "Edit Data Guru" : "Formulir Guru Baru"}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="gNama" className="label">Nama Lengkap</label>
          <input
            id="gNama"
            name="nama"
            type="text"
            required
            minLength={3}
            defaultValue={initial?.nama}
            className="input"
            placeholder="Nama guru"
          />
        </div>
        <div>
          <label htmlFor="gNip" className="label">NIP</label>
          <input
            id="gNip"
            name="nip"
            type="text"
            required
            defaultValue={initial?.nip}
            className="input"
            placeholder="Contoh: 198706152010121002"
          />
        </div>
        <div>
          <label htmlFor="gEmail" className="label">Email</label>
          <input
            id="gEmail"
            name="email"
            type="email"
            required
            defaultValue={initial?.email}
            className="input"
            placeholder="nama@kosgoro.sch.id"
          />
        </div>
        <div>
          <label htmlFor="gPassword" className="label">
            Password{" "}
            {guruId && <span className="text-xs font-normal text-slate-400">(Kosongkan bila tidak diubah)</span>}
          </label>
          <input
            id="gPassword"
            name="password"
            type="text"
            required={!guruId}
            minLength={6}
            className="input"
            placeholder={guruId ? "••••••" : "Minimal 6 karakter"}
          />
        </div>
      </div>

      <div>
        <label htmlFor="gJabatan" className="label">
          Jabatan <span className="text-xs font-normal text-slate-400">(Opsional)</span>
        </label>
        <input
          id="gJabatan"
          name="jabatan"
          type="text"
          defaultValue={initial?.jabatan}
          className="input"
          placeholder="Contoh: Waka. Bid. Kurikulum / Guru Mapel"
        />
      </div>

      <div>
        <p className="label">Foto</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {initial?.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={initial.foto}
              alt="Foto guru"
              className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 object-cover"
            />
          ) : null}
          <div className="flex-1 space-y-3">
            <div>
              <label htmlFor="gFoto" className="mb-1.5 block text-xs font-medium text-slate-500">
                URL Foto
              </label>
              <input
                id="gFoto"
                name="foto"
                type="text"
                defaultValue={initial?.foto}
                className="input"
                placeholder="https://... atau /uploads/..."
              />
            </div>
            <div>
              <label htmlFor="gFotoFile" className="mb-1.5 block text-xs font-medium text-slate-500">
                Atau Upload File
              </label>
              <input
                id="gFotoFile"
                name="fotoFile"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <p className="text-xs text-slate-500">
              Isi salah satu: tempel URL foto atau unggah file gambar. Upload file akan menggantikan URL.
            </p>
          </div>
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
                  defaultChecked={initial?.mapelIds?.includes(m.id)}
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

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link href={backHref} className="btn-outline">Batal</Link>
        <button type="submit" disabled={pending} className="btn-primary">
          <Icon name={guruId ? "save" : "person_add"} className="text-xl" />
          {pending ? "Menyimpan..." : guruId ? "Simpan Perubahan" : "Buat Akun Guru"}
        </button>
      </div>
    </form>
  );
}
