import { Icon } from "@/components/Icon";

export const metadata = { title: "Panduan Penggunaan" };

const STEPS = [
  {
    icon: "person_add",
    title: "1. Daftar Akun",
    desc: "Masuk ke halaman Daftar, isi nama, email, password, dan pilih kelas Anda. Role otomatis menjadi Siswa.",
  },
  {
    icon: "login",
    title: "2. Masuk ke Dashboard",
    desc: "Setelah mendaftar Anda diarahkan langsung ke dashboard siswa. Guru & admin masuk melalui akun dari sekolah.",
  },
  {
    icon: "event_available",
    title: "3. Pilih Kegiatan",
    desc: "Buka menu Kegiatan, gunakan filter status atau pencarian untuk menemukan pembelajaran yang sesuai.",
  },
  {
    icon: "how_to_reg",
    title: "4. Daftar Kegiatan",
    desc: "Klik tombol Daftar pada kegiatan yang diminati. Anda tidak bisa mendaftar dua kali pada kegiatan yang sama.",
  },
  {
    icon: "folder_open",
    title: "5. Akses Materi",
    desc: "Setelah terdaftar, buka materi pembelajaran: unduh PDF, tonton video, atau ikuti tautan yang disediakan guru.",
  },
  {
    icon: "history",
    title: "6. Pantau Riwayat",
    desc: "Menu Riwayat menampilkan seluruh kegiatan yang pernah Anda ikuti untuk memudahkan belajar ulang.",
  },
] as const;

export default function PanduanPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Icon name="menu_book" className="text-sm" filled />
          Panduan
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Cara Menggunakan Website
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          Ikuti langkah-langkah berikut untuk mulai belajar di platform
          pembelajaran digital SMK Kosgoro.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.title} className="card p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon name={s.icon} className="text-2xl" filled />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-slate-900">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50 p-6">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-brand-800">
          <Icon name="support_agent" className="text-xl" />
          Butuh Bantuan?
        </h2>
        <p className="mt-2 text-sm text-brand-900">
          Hubungi panitia atau admin sekolah melalui halaman Kontak jika mengalami
          kendala saat mendaftar, login, atau mengakses materi.
        </p>
      </div>
    </div>
  );
}