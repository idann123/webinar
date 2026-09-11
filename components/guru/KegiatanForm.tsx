"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  createKegiatan,
  updateKegiatan,
  type KegiatanState,
} from "@/lib/actions/kegiatan";
import { Icon } from "@/components/Icon";

const initialState: KegiatanState = {};

type MapelOption = { id: number; namaMapel: string };

export type KegiatanFormValues = {
  judulPembelajaran: string;
  mapelId: number;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  deskripsi: string;
};

export function KegiatanForm({
  mapel,
  kegiatanId,
  initial,
  backHref,
}: {
  mapel: MapelOption[];
  kegiatanId?: number;
  initial?: Partial<KegiatanFormValues>;
  backHref: string;
}) {
  const action = kegiatanId ? updateKegiatan.bind(null, kegiatanId) : createKegiatan;
  const [state, formAction, pending] = useActionState(action, initialState);

  function toYyyyMmDd(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8">
      {state.error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <Icon name="error" className="mt-0.5 text-lg" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label htmlFor="judulPembelajaran" className="label">Judul Pembelajaran</label>
        <input
          id="judulPembelajaran"
          name="judulPembelajaran"
          type="text"
          required
          minLength={3}
          defaultValue={initial?.judulPembelajaran}
          placeholder="Contoh: Dasar Pemrograman Web"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="mapelId" className="label">Mata Pelajaran</label>
        <select
          id="mapelId"
          name="mapelId"
          required
          defaultValue={initial?.mapelId ?? ""}
          className="input"
        >
          <option value="" disabled>Pilih mapel yang Anda ampu...</option>
          {mapel.map((m) => (
            <option key={m.id} value={m.id}>
              {m.namaMapel}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="tanggal" className="label">Tanggal</label>
          <input
            id="tanggal"
            name="tanggal"
            type="date"
            required
            defaultValue={initial?.tanggal ?? toYyyyMmDd(new Date())}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="waktuMulai" className="label">Jam Mulai</label>
          <input
            id="waktuMulai"
            name="waktuMulai"
            type="time"
            required
            defaultValue={initial?.waktuMulai ?? "09:00"}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="waktuSelesai" className="label">Jam Selesai</label>
          <input
            id="waktuSelesai"
            name="waktuSelesai"
            type="time"
            required
            defaultValue={initial?.waktuSelesai ?? "11:00"}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="deskripsi" className="label">Deskripsi</label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          defaultValue={initial?.deskripsi}
          placeholder="Jelaskan ringkasan materi yang akan dibahas..."
          className="input resize-none"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link href={backHref} className="btn-outline">Batal</Link>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? (
            <>
              <Icon name="progress_activity" className="text-lg animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Icon name="save" className="text-lg" />
              {kegiatanId ? "Simpan Perubahan" : "Buat Kegiatan"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}