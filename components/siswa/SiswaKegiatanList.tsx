"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import type { KegiatanCardData } from "@/components/KegiatanCard";
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

// Gaya penanda status di sampul tiket
const STATUS_STYLE: Record<string, { label: string; bg: string }> = {
  BELUM_MULAI: { label: "Belum Mulai", bg: "#CFE7FF" },
  BERLANGSUNG: { label: "Berlangsung", bg: "#CDF3DD" },
  SELESAI: { label: "Selesai", bg: "#E5E9F0" },
};

// Garis tepi + bayangan keras yang mengikuti bentuk tiket berlekuk
const TICKET_FILTER =
  "drop-shadow(2px 0 0 #0F1B3D) drop-shadow(-2px 0 0 #0F1B3D) drop-shadow(0 2px 0 #0F1B3D) drop-shadow(0 -2px 0 #0F1B3D) drop-shadow(5px 5px 0 #0F1B3D)";

const css = `
.sk-tk-top, .sk-tk-bot { --r: 12px; }
.sk-tk-top {
  -webkit-mask-image:
    radial-gradient(circle var(--r) at 0 100%, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 100%, transparent 97%, #000 100%);
  mask-image:
    radial-gradient(circle var(--r) at 0 100%, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 100%, transparent 97%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.sk-tk-bot {
  -webkit-mask-image:
    radial-gradient(circle var(--r) at 0 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 0, transparent 97%, #000 100%);
  mask-image:
    radial-gradient(circle var(--r) at 0 0, transparent 97%, #000 100%),
    radial-gradient(circle var(--r) at 100% 0, transparent 97%, #000 100%);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}

@keyframes sk-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes sk-live { 0%, 100% { box-shadow: 0 0 0 0 rgb(16 185 129 / 0.6); } 50% { box-shadow: 0 0 0 5px rgb(16 185 129 / 0); } }
@keyframes sk-spin { to { transform: rotate(360deg); } }

.sk-in { animation: sk-in 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--d, 0ms); }
.sk-live { animation: sk-live 1.8s ease-in-out infinite; }
.sk-spin { animation: sk-spin 0.7s linear infinite; }

@media (prefers-reduced-motion: reduce) {
  .sk-in, .sk-live, .sk-spin { animation: none !important; }
}
`;

// Tombol daftar dengan keadaan "memproses" saat formulir dikirim
function DaftarButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-4 py-2.5 text-sm font-bold text-white shadow-[3px_3px_0_0_#fff] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#fff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE08A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70 motion-reduce:transition-none"
    >
      {pending ? (
        <>
          <span className="sk-spin h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
          Mendaftar…
        </>
      ) : (
        <>
          <Icon name="how_to_reg" className="text-lg text-[#FFC83D]" />
          Daftar
        </>
      )}
    </button>
  );
}

function inisial(nama: string) {
  return nama
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

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

  // Jumlah kegiatan per status untuk lencana pada filter
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: items.length };
    for (const { kegiatan } of items) c[kegiatan.status] = (c[kegiatan.status] ?? 0) + 1;
    return c;
  }, [items]);

  const adaFilter = filter !== "ALL" || search.trim() !== "";

  return (
    <>
      <style>{css}</style>

      {/* toolbar: filter + pencarian */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter status kegiatan" className="flex flex-wrap gap-2.5">
          {FILTERS.map((f) => {
            const aktif = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={aktif}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] px-4 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 motion-reduce:transition-none",
                  aktif
                    ? "bg-[#0F1B3D] text-white shadow-[3px_3px_0_0_#FFC83D]"
                    : "bg-white text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D]"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-extrabold",
                    aktif ? "bg-[#FFC83D] text-[#0F1B3D]" : "bg-[#DCEBFF] text-[#0F1B3D]"
                  )}
                >
                  {counts[f.key] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative lg:w-80">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xl text-[#0F1B3D]/50"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, mapel, atau guru..."
            aria-label="Cari kegiatan"
            className="w-full rounded-xl border-2 border-[#0F1B3D] bg-white py-2.5 pl-11 pr-10 text-sm font-semibold text-[#0F1B3D] outline-none transition-all duration-150 placeholder:font-medium placeholder:text-slate-400 focus:shadow-[3px_3px_0_0_#FFC83D] focus:ring-2 focus:ring-[#1E78E6] focus:ring-offset-2 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
              className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-[#0F1B3D]/60 transition-colors hover:bg-[#DCEBFF] hover:text-[#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6]"
            >
              <Icon name="close" className="text-lg" />
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="mt-5 text-sm font-semibold text-[#0F1B3D]/65">
        Menampilkan {filtered.length} dari {items.length} kegiatan
      </p>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/70 px-6 py-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]">
            <Icon name="search_off" className="text-3xl" filled />
          </span>
          <p className="mx-auto mt-6 max-w-sm font-display text-lg font-bold text-[#0F1B3D]">
            Tidak ada kegiatan yang cocok.
          </p>
          {adaFilter && (
            <button
              type="button"
              onClick={() => {
                setFilter("ALL");
                setSearch("");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-5 py-2.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2"
            >
              <Icon name="restart_alt" className="text-lg" />
              Atur ulang filter
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-x-7 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(({ kegiatan: k, registered }, i) => {
            const st = STATUS_STYLE[k.status] ?? { label: k.status, bg: "#E5E9F0" };
            const tgl = new Date(k.tanggal);
            const detail = `/dashboard/siswa/kegiatan/${k.id}`;
            const selesai = k.status === "SELESAI";
            const stubBg = registered ? "#CDF3DD" : selesai ? "#E5E9F0" : "#FFE08A";

            return (
              <div
                key={k.id}
                className="sk-in"
                style={{ "--d": `${Math.min(i, 8) * 60}ms` } as CSSProperties}
              >
                <article className="h-full" style={{ filter: TICKET_FILTER }}>
                  <div className="flex h-full flex-col text-[#0F1B3D]">
                    {/* bagian atas tiket: bisa diklik ke detail */}
                    <Link
                      href={detail}
                      className="sk-tk-top group flex flex-1 flex-col rounded-t-3xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6]"
                    >
                      <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl border-b-2 border-[#0F1B3D] bg-sky-100">
                        <div
                          aria-hidden
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                          style={{ backgroundImage: `url("${k.coverUrl || "/gambarsekolah.jpg"}")` }}
                        />
                        <span
                          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F1B3D] px-3 py-1 text-xs font-extrabold"
                          style={{ backgroundColor: st.bg }}
                        >
                          {k.status === "BERLANGSUNG" && (
                            <span className="sk-live h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                          {st.label}
                        </span>
                        <span className="absolute bottom-3 right-3 rotate-3 rounded-xl border-2 border-[#0F1B3D] bg-[#FFC83D] px-3 py-1.5 text-center leading-none shadow-[2px_2px_0_0_#0F1B3D]">
                          <span className="block font-display text-xl font-extrabold">{tgl.getDate()}</span>
                          <span className="mt-0.5 block text-[11px] font-extrabold">
                            {tgl.toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-4 pb-6">
                        <span className="w-fit max-w-full truncate rounded-full border-2 border-[#0F1B3D] bg-[#E6DCFF] px-3 py-1 text-xs font-bold">
                          {k.mapel}
                        </span>
                        <h3 className="line-clamp-2 font-display text-lg font-extrabold leading-snug group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                          {k.judulPembelajaran}
                        </h3>
                        <div className="mt-auto flex items-center gap-2.5 pt-1">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0F1B3D] font-display text-xs font-extrabold text-[#FFC83D]">
                            {inisial(k.guru)}
                          </span>
                          <span className="truncate text-sm font-semibold">{k.guru}</span>
                        </div>
                      </div>
                    </Link>

                    {/* sobekan tiket: aksi pendaftaran */}
                    <div
                      className="sk-tk-bot relative -mt-px rounded-b-3xl px-4 pb-4 pt-6"
                      style={{ backgroundColor: stubBg }}
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-6 top-0 border-t-2 border-dashed border-[#0F1B3D]/40"
                      />
                      <p className="mb-3 text-xs font-bold text-[#0F1B3D]/75">
                        <span className="mr-1 font-display text-base font-extrabold text-[#0F1B3D]">
                          {k.jumlahSiswaDaftar}
                        </span>
                        siswa sudah daftar
                      </p>

                      {registered ? (
                        <span className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2.5 text-sm font-bold text-[#12823F]">
                          <Icon name="check_circle" className="text-xl" filled />
                          Sudah Terdaftar
                        </span>
                      ) : selesai ? (
                        <span className="block rounded-xl border-2 border-dashed border-[#0F1B3D]/40 bg-white/60 px-4 py-2.5 text-center text-sm font-bold text-[#0F1B3D]/60">
                          Kegiatan selesai
                        </span>
                      ) : (
                        <div className="flex gap-2.5">
                          <form action={daftarKegiatan} className="flex-1">
                            <input type="hidden" name="kegiatanId" value={k.id} />
                            <DaftarButton />
                          </form>
                          <Link
                            href={detail}
                            aria-label="Lihat detail"
                            className="grid w-11 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFE08A] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none"
                          >
                            <Icon name="info" className="text-xl" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}