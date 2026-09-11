import Link from "next/link";
import { db } from "@/lib/db";
import { Icon } from "@/components/Icon";
import { KegiatanCard, type KegiatanCardData } from "@/components/KegiatanCard";

export const metadata = { title: "Beranda" };

const FEATURES = [
  {
    icon: "event_available",
    title: "Katalog Kegiatan",
    desc: "Lihat seluruh kegiatan pembelajaran berikut jadwal, mapel, dan guru pengajarnya.",
  },
  {
    icon: "how_to_reg",
    title: "Daftar Sekali Klik",
    desc: "Bergabung ke kegiatan cukup satu klik, tanpa antre dan langsung tercatat otomatis.",
  },
  {
    icon: "folder_open",
    title: "Materi Lengkap",
    desc: "Unduh PDF, tonton video, atau buka tautan materi pendukung tiap pembelajaran.",
  },
  {
    icon: "devices",
    title: "Akses dari HP",
    desc: "Belajar kapan saja dan di mana saja, tampilan responsif untuk semua perangkat.",
  },
] as const;

export default async function HomePage() {
  const [kegiatanCount, siswaCount, mapelCount, recent] = await Promise.all([
    db.kegiatan.count(),
    db.user.count({ where: { role: "SISWA" } }),
    db.mapel.count(),
    db.kegiatan.findMany({
      orderBy: [{ status: "asc" }, { tanggal: "desc" }],
      take: 3,
      include: { mapel: true, guru: { include: { user: true } } },
    }),
  ]);

  const recentCards: KegiatanCardData[] = recent.map((k) => ({
    id: k.id,
    judulPembelajaran: k.judulPembelajaran,
    mapel: k.mapel.namaMapel,
    guru: k.guru.user.nama,
    tanggal: k.tanggal,
    waktuMulai: k.waktuMulai,
    waktuSelesai: k.waktuSelesai,
    status: k.status,
    jumlahSiswaDaftar: k.jumlahSiswaDaftar,
    deskripsi: k.deskripsi,
  }));

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-1/4 h-80 w-80 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute right-0 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 md:pb-24 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              <Icon name="school" className="text-base" filled />
              Platform Pembelajaran Digital SMK Kosgoro
            </span>

            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Belajar Bersama Guru,{" "}
              <span className="text-brand-600">Langsung dari Sekolah</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 sm:text-lg">
              Temukan kegiatan pembelajaran sesuai minatmu, daftar dengan satu
              klik, dan akses semua materi — semuanya dalam satu platform digital
              untuk siswa dan guru SMK Kosgoro.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/kegiatan" className="btn-primary w-full px-7 py-3 text-base sm:w-auto">
                <Icon name="explore" className="text-xl" />
                Lihat Kegiatan
              </Link>
              <Link href="/register" className="btn-outline w-full px-7 py-3 text-base sm:w-auto">
                <Icon name="person_add" className="text-xl" />
                Daftar sebagai Siswa
              </Link>
            </div>

            <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { value: kegiatanCount, label: "Kegiatan" },
                { value: siswaCount, label: "Siswa Terdaftar" },
                { value: mapelCount, label: "Mata Pelajaran" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                  <dt className="order-2 mt-1 text-xs font-medium text-slate-500">{s.label}</dt>
                  <dd className="font-display text-2xl font-extrabold text-brand-700 sm:text-3xl">
                    {s.value}+
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900">
              Kenapa Belajar di Platform Ini?
            </h2>
            <p className="mt-2 text-slate-600">
              Dibangun khusus untuk kebutuhan siswa dan guru SMK Kosgoro.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon name={f.icon} className="text-2xl" filled />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-extrabold text-slate-900">
              Kegiatan Pembelajaran
            </h2>
            <p className="mt-1 text-slate-600">Tiga kegiatan terbaru yang tersedia.</p>
          </div>
          <Link href="/kegiatan" className="btn-outline">
            Semua Kegiatan
            <Icon name="arrow_forward" className="text-lg" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {recentCards.map((k) => (
            <KegiatanCard key={k.id} kegiatan={k} href={`/kegiatan/${k.id}`}>
              <Link href={`/kegiatan/${k.id}`} className="btn-outline w-full">
                Lihat Detail
              </Link>
            </KegiatanCard>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-6 py-12 text-center text-white shadow-lg sm:px-12">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
            Siap untuk Mulai Belajar?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Daftarkan akun siswa-mu sekarang dan bergabunglah dengan kegiatan
            pembelajaran minggu ini.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow hover:bg-brand-50"
            >
              <Icon name="person_add" className="text-lg" />
              Daftar Sekarang
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-brand-300/60 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600/60"
            >
              Sudah Punya Akun?
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}