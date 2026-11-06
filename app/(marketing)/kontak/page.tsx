import type { Metadata } from "next";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = { title: "Kontak" };

const CONTACTS = [
  {
    icon: "location_on",
    title: "Alamat Sekolah",
    lines: ["Jl. Pendidikan Raya No. 45", "Kel. Sukamaju, Kec. Cimanggis", "Kota Depok, Jawa Barat 16452"],
  },
  {
    icon: "schedule",
    title: "Jam Layanan",
    lines: ["Senin – Sabtu, 08.00 – 15.00 WIB"],
  },
  {
    icon: "call",
    title: "Telepon / WhatsApp",
    lines: ["(0251) 831-2345", "0812-3456-7890"],
  },
  {
    icon: "alternate_email",
    title: "Email Resmi",
    lines: ["info@smakosgoro.sch.id"],
  },
] as const;

export default function KontakPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          <Icon name="support_agent" className="text-sm" filled />
          Hubungi Kami
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Kontak SMK Kosgoro
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-slate-600">
          Ada kendala saat mendaftar, login, atau mengakses materi? Hubungi
          panitia atau admin sekolah melalui kontak di bawah ini.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {CONTACTS.map((c) => (
          <div key={c.title} className="card p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <Icon name={c.icon} className="text-2xl" filled />
            </div>
            <h2 className="mt-4 font-display text-base font-bold text-slate-900">{c.title}</h2>
            <div className="mt-2 space-y-0.5 text-sm text-slate-600">
              {c.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
        <h2 className="flex items-center justify-center gap-2 font-display text-lg font-bold text-brand-800">
          <Icon name="groups" className="text-2xl" filled />
          Grup Informasi Peserta
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-900">
          Bergabunglah untuk mendapatkan info jadwal terbaru, tautan materi, dan
          bantuan teknis selama proses pembelajaran.
        </p>
      </div>
    </div>
  );
}