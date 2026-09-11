"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KegiatanCard, type KegiatanCardData } from "@/components/KegiatanCard";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import { daftarKegiatan } from "@/lib/actions/kegiatan";

export type SiswaKegiatanItem = { kegiatan: KegiatanCardData; registered: boolean };

const FILTERS = [
  { key: "ALL", label: "Semua" },
  { key: "BELUM_MULAI", label: "Belum Mulai" },
  { key: "BERLANGSUNG", label: "Berlangsung" },
  { key: "SELESAI", label: "Selesai" },
] as const;

export function SiswaKegiatanList({ items }: { items: SiswaKegiatanItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(({ kegiatan }) => {
      if (filter !== "ALL" && kegiatan.status !== filter) return false;
      if (!q) return true;
      return (
        kegiatan.judulPembelajaran.toLowerCase().includes(q) ||
        kegiatan.mapel.toLowerCase().includes(q) ||
        kegiatan.guru.toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative md:w-72">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, mapel, atau guru..."
            className="input pl-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Icon name="search_off" className="text-4xl text-slate-300" />
          <p className="font-medium text-slate-600">Tidak ada kegiatan yang cocok.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ kegiatan, registered }) => (
            <KegiatanCard key={kegiatan.id} kegiatan={kegiatan} href={`/dashboard/siswa/kegiatan/${kegiatan.id}`}>
              {registered ? (
                <span className="flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
                  <Icon name="check_circle" className="text-lg" filled />
                  Sudah Terdaftar
                </span>
              ) : kegiatan.status === "SELESAI" ? (
                <span className="block rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-medium text-slate-500">
                  Kegiatan selesai
                </span>
              ) : (
                <div className="flex gap-2">
                  <form action={daftarKegiatan} className="flex-1">
                    <input type="hidden" name="kegiatanId" value={kegiatan.id} />
                    <button type="submit" className="btn-primary w-full">
                      <Icon name="how_to_reg" className="text-lg" />
                      Daftar
                    </button>
                  </form>
                  <Link
                    href={`/dashboard/siswa/kegiatan/${kegiatan.id}`}
                    className="btn-outline"
                    aria-label="Lihat detail"
                  >
                    <Icon name="info" className="text-lg" />
                  </Link>
                </div>
              )}
            </KegiatanCard>
          ))}
        </div>
      )}
    </>
  );
}