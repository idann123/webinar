import { Icon } from "@/components/Icon";

export const metadata = { title: "FAQ" };

const FAQS = [
  {
    q: "Bagaimana cara mendaftar sebagai siswa?",
    a: "Buka menu Daftar di bagian atas, isi nama lengkap, email aktif, password minimal 6 karakter, dan pilih kelas. Setelah berhasil, Anda langsung masuk ke dashboard siswa.",
  },
  {
    q: "Apakah saya bisa mendaftar ke kegiatan yang sama dua kali?",
    a: "Tidak. Sistem otomatis mencegah pendaftaran ganda pada kegiatan yang sama. Anda tetap bisa mengikuti banyak kegiatan berbeda.",
  },
  {
    q: "Bagaimana cara mengakses materi pembelajaran?",
    a: "Pastikan Anda sudah terdaftar pada kegiatan tersebut melalui dashboard siswa. Materi dapat berupa file PDF untuk diunduh, video untuk ditonton, atau tautan eksternal.",
  },
  {
    q: "Lupa password, bagaimana?",
    a: "Hubungi admin sekolah melalui halaman Kontak. Admin dapat mereset password akun Anda menjadi password sementara.",
  },
  {
    q: "Apakah guru bisa membuat kegiatan sendiri?",
    a: "Ya. Guru login dengan akun dari admin, lalu pada menu Kegiatan Saya dapat membuat kegiatan baru, mengisi jadwal, mengunggah materi, dan melihat daftar siswa yang mendaftar.",
  },
  {
    q: "Apa fungsi status pada kegiatan?",
    a: "Status menunjukkan kondisi kegiatan: Belum Mulai, Berlangsung, atau Selesai. Guru dapat memperbarui status secara manual, dan kegiatan yang jadwalnya sudah lewat otomatis dianggap Berlangsung.",
  },
] as const;

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Icon name="help" className="text-sm" filled />
          FAQ
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Pertanyaan yang Sering Diajukan
        </h1>
      </div>

      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => (
          <details key={i} className="card group overflow-hidden open:ring-1 open:ring-brand-200">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold text-slate-800">
              {f.q}
              <span className="shrink-0 text-brand-600 transition-transform group-open:rotate-45">
                <Icon name="add" className="text-2xl" />
              </span>
            </summary>
            <div className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
              {f.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}