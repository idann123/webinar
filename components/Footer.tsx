import Link from "next/link";
import { Icon } from "@/components/Icon";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-kosgoro.jpeg"
              alt="Logo SMK Kosgoro"
              className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="leading-tight">
              <p className="font-display text-base font-extrabold text-slate-900">
                SMK Kosgoro
              </p>
              <p className="text-[11px] font-medium uppercase tracking-wider text-brand-700">
                Pembelajaran Digital
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600">
            Platform pembelajaran digital yang menghubungkan siswa, guru, dan
            sekolah dalam satu wadah. Lihat kegiatan pembelajaran, daftar,
            dan akses materi kapan saja, di mana saja.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">Navigasi</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li><Link href="/" className="hover:text-brand-700">Beranda</Link></li>
            <li><Link href="/kegiatan" className="hover:text-brand-700">Kegiatan</Link></li>
            <li><Link href="/panduan" className="hover:text-brand-700">Panduan</Link></li>
            <li><Link href="/faq" className="hover:text-brand-700">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">Akun</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
            <li><Link href="/login" className="hover:text-brand-700">Masuk</Link></li>
            <li><Link href="/register" className="hover:text-brand-700">Daftar Siswa</Link></li>
            <li><Link href="/kontak" className="hover:text-brand-700">Hubungi Kami</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100 py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} SMK Kosgoro. Hak cipta dilindungi.</p>
          <p className="flex items-center gap-1">
            <Icon name="school" className="text-sm text-brand-600" />
            Website Pembelajaran Digital
          </p>
        </div>
      </div>
    </footer>
  );
}