import Link from "next/link";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { KegiatanCard, type KegiatanCardData } from "@/components/KegiatanCard";
import { toKegiatanCardData } from "@/lib/mappers";
import { resolveKegiatanCover } from "@/lib/thumbnail";
import { syncKegiatanStatuses } from "@/lib/kegiatan-status";

export const metadata = { title: "Kegiatan Pembelajaran" };

export const dynamic = "force-dynamic";

export default async function KegiatanPublicPage() {
  await syncKegiatanStatuses();

  const kegiatan = await db.kegiatan.findMany({
    orderBy: [{ status: "asc" }, { tanggal: "desc" }],
    include: {
      mapel: true,
      guru: { include: { user: true } },
      materi: { select: { tipe: true, filePath: true } },
    },
  });

  const cards: KegiatanCardData[] = kegiatan.map((k) => ({
    ...toKegiatanCardData(k),
    coverUrl: resolveKegiatanCover(k.coverUrl, k.materi),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Icon name="event_available" className="text-sm" filled />
          Katalog Pembelajaran
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Kegiatan Pembelajaran
        </h1>
        <p className="mt-2 text-slate-600">
          Semua kegiatan pembelajaran yang tersedia di SMK Kosgoro. Silakan
          <Link href="/login" className="mx-1 font-semibold text-brand-700 hover:underline">
            masuk
          </Link>
          untuk mendaftar dan mengakses materi.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <Icon name="event_busy" className="text-4xl text-slate-300" />
          <p className="font-medium text-slate-600">Belum ada kegiatan pembelajaran.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((k) => (
            <KegiatanCard key={k.id} kegiatan={k} href={`/kegiatan/${k.id}`}>
              <Link href={`/kegiatan/${k.id}`} className="btn-outline w-full">
                Lihat Detail & Daftar
                <Icon name="arrow_forward" className="text-lg" />
              </Link>
            </KegiatanCard>
          ))}
        </div>
      )}
    </div>
  );
}