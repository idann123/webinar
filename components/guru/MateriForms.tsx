"use client";

import { useActionState } from "react";
import {
  addMateriLink,
  uploadMateri,
  type KegiatanState,
} from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";

const initialState: KegiatanState = {};

function StatusLine({ state }: { state: KegiatanState }) {
  if (state.success) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm text-emerald-700">
        <Icon name="check_circle" className="text-lg" filled />
        {state.success}
      </p>
    );
  }
  if (state.error) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2 text-sm text-red-700">
        <Icon name="error" className="text-lg" />
        {state.error}
      </p>
    );
  }
  return null;
}

export function MateriForms({ kegiatanId }: { kegiatanId: number }) {
  const [fileState, fileAction, filePending] = useActionState(uploadMateri, initialState);
  const [linkState, linkAction, linkPending] = useActionState(addMateriLink, initialState);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form action={fileAction} className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
          <Icon name="upload_file" className="text-xl text-brand-600" />
          Unggah File (PDF / Video)
        </h3>
        <input type="hidden" name="kegiatanId" value={kegiatanId} />
        <div>
          <label htmlFor="fJudul" className="label">Judul Materi</label>
          <input id="fJudul" name="judulMateri" type="text" required minLength={3} className="input" />
        </div>
        <div>
          <label className="label">File Materi</label>
          <input
            name="file"
            type="file"
            required
            accept="application/pdf,video/*"
            className="input cursor-pointer file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-brand-700"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Format PDF atau video (pewarnaan otomatis). Maksimal ±20MB.
          </p>
        </div>
        <StatusLine state={fileState} />
        <button type="submit" disabled={filePending} className="btn-primary w-full">
          {filePending ? (
            <>Unggah...
            </>
          ) : (
            <>
              <Icon name="cloud_upload" className="text-lg" /> Unggah Materi
            </>
          )}
        </button>
      </form>

      <form action={linkAction} className="card space-y-4 p-6">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
          <Icon name="link" className="text-xl text-brand-600" />
          Tambah Link / Tautan Materi
        </h3>
        <input type="hidden" name="kegiatanId" value={kegiatanId} />
        <div>
          <label htmlFor="lJudul" className="label">Judul Materi</label>
          <input id="lJudul" name="judulMateri" type="text" required minLength={3} className="input" />
        </div>
        <div>
          <label htmlFor="lUrl" className="label">URL Tautan</label>
          <input
            id="lUrl"
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="input"
          />
        </div>
        <StatusLine state={linkState} />
        <button type="submit" disabled={linkPending} className="btn-outline w-full">
          <Icon name="add_link" className="text-lg" />
          Simpan Link
        </button>
      </form>
    </div>
  );
}