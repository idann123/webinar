import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { KegiatanForm } from "@/components/guru/KegiatanForm";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Buat Kegiatan" };

// Gaya bersama: border navy, bayangan keras, dan efek "ditekan" pada tombol
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2";
const PRESS =
  "transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-1 active:translate-y-1 active:shadow-none";
const BTN_BACK = `inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-white px-3.5 py-2 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] hover:bg-[#CFE7FF]/50 hover:shadow-[1px_1px_0_0_#0F1B3D] ${PRESS} ${FOCUS}`;

// Warna chip mapel bergantian, sama seperti kartu kegiatan di beranda
const MAPEL_TONE = ["#FFC83D", "#9BE3BB", "#C6B0FF", "#CFE7FF"] as const;

export default async function GuruKegiatanBaruPage() {
  const session = await requireRole("GURU");
  const guru = await db.guru.findFirstOrThrow({
    where: { userId: session.userId },
    include: { mapelGuru: true },
  });

  const mapel = await db.mapel.findMany({
    where: { id: { in: guru.mapelGuru.map((m) => m.mapelId) } },
    orderBy: { namaMapel: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <Link href="/dashboard/guru/kegiatan" className={BTN_BACK}>
          <Icon name="arrow_back" className="text-lg" />
          Kembali
        </Link>

        <div className="mt-5 flex items-start gap-4">
          <span
            aria-hidden
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D] shadow-[4px_4px_0_0_#0F1B3D]"
          >
            <Icon name="add_circle" className="text-3xl" filled />
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold text-[#0F1B3D] sm:text-4xl">
              Buat kegiatan baru
            </h1>
            <p className="mt-2 text-sm text-[#0F1B3D]/65 sm:text-base">
              Isi judul, pilih mapel yang Anda ampu, lalu tentukan jadwal pelaksanaannya.
            </p>
          </div>
        </div>

        {mapel.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-[#0F1B3D]/65">Mapel Anda:</span>
            {mapel.map((m, i) => (
              <span
                key={m.id}
                className="inline-flex rounded-full border-2 border-[#0F1B3D] px-2.5 py-0.5 text-xs font-bold text-[#0F1B3D]"
                style={{ backgroundColor: MAPEL_TONE[i % MAPEL_TONE.length] }}
              >
                {m.namaMapel}
              </span>
            ))}
          </div>
        )}
      </header>

      {mapel.length === 0 ? (
        // Tanpa mapel, kegiatan tidak bisa dibuat
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-[#0F1B3D]/30 bg-white/70 px-6 py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#C0264A] shadow-[3px_3px_0_0_#0F1B3D]">
            <Icon name="menu_book" className="text-3xl" filled />
          </span>
          <p className="mt-5 text-base font-bold text-[#0F1B3D]">Anda belum memiliki mapel</p>
          <p className="mt-1 max-w-sm text-sm text-[#0F1B3D]/65">
            Kegiatan dibuat berdasarkan mapel yang Anda ampu. Hubungi admin untuk menambahkan mapel
            ke akun Anda.
          </p>
        </div>
      ) : (
        <KegiatanForm
          mapel={mapel.map((m) => ({ id: m.id, namaMapel: m.namaMapel }))}
          backHref="/dashboard/guru/kegiatan"
        />
      )}
    </div>
  );
}