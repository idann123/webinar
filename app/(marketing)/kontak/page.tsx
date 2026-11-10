import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { WowInit } from "@/components/WowInit";

export const metadata: Metadata = { title: "Kontak" };

// Status buka/tutup dihitung saat halaman diminta
export const dynamic = "force-dynamic";

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

// Jam layanan sesuai teks di atas: Senin - Sabtu, 08.00 - 15.00 WIB
const JAM_BUKA = 8;
const JAM_TUTUP = 15;
const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const CSS = `
.hero-in { animation: fade-up .8s cubic-bezier(.16,1,.3,1) both; animation-delay: var(--d, 0ms); }
.live-dot { animation: live 1.8s ease-in-out infinite; }
.pin-bounce { animation: pin-bounce 2s ease-in-out infinite; }

@keyframes fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes live { 0%,100% { box-shadow: 0 0 0 0 rgb(16 185 129 / .6); } 50% { box-shadow: 0 0 0 7px rgb(16 185 129 / 0); } }
@keyframes pin-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }

@media (prefers-reduced-motion: reduce) {
  .hero-in, .live-dot, .pin-bounce, .wow { animation: none !important; }
}
`;

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function statusLayanan() {
  const wib = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const hari = wib.getDay(); // 0 = Minggu
  const menit = wib.getHours() * 60 + wib.getMinutes();
  const buka = hari >= 1 && hari <= 6 && menit >= JAM_BUKA * 60 && menit < JAM_TUTUP * 60;
  return { buka, hariIdx: (hari + 6) % 7 };
}

const digits = (t: string) => t.replace(/\D/g, "");

// Peta ilustrasi dengan pin (dekoratif)
function PetaIlustrasi() {
  return (
    <div aria-hidden className="relative h-48 overflow-hidden border-b-2 border-[#0F1B3D] bg-[#DCEEFF]">
      <svg viewBox="0 0 400 190" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <rect width="400" height="190" fill="#DCEEFF" />
        {/* blok bangunan dan taman */}
        <rect x="14" y="14" width="96" height="58" rx="10" fill="#C5E0FB" />
        <rect x="14" y="108" width="96" height="68" rx="10" fill="#CDF3DD" />
        <rect x="142" y="14" width="86" height="46" rx="10" fill="#C5E0FB" />
        <rect x="262" y="14" width="124" height="72" rx="10" fill="#E6DCFF" />
        <rect x="142" y="130" width="92" height="46" rx="10" fill="#FFE08A" />
        <rect x="262" y="122" width="124" height="54" rx="10" fill="#C5E0FB" />
        {/* jalan */}
        <path d="M0 90 H400" stroke="#fff" strokeWidth="16" />
        <path d="M125 0 V190" stroke="#fff" strokeWidth="14" />
        <path d="M245 0 V190" stroke="#fff" strokeWidth="14" />
        <path d="M0 90 H400" stroke="#0F1B3D" strokeOpacity="0.12" strokeWidth="2" strokeDasharray="10 8" />
        {/* rute */}
        <path d="M30 150 C 90 150, 100 90, 185 90" fill="none" stroke="#1E78E6" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>

      <div className="pin-bounce absolute left-[44%] top-[26%]">
        <svg viewBox="0 0 40 52" className="h-14 w-11 drop-shadow-[0_6px_6px_rgba(15,27,61,0.35)]">
          <path d="M20 2 C9 2 2 10 2 20 C2 33 20 50 20 50 C20 50 38 33 38 20 C38 10 31 2 20 2 Z" fill="#FFC83D" stroke="#0F1B3D" strokeWidth="3" />
          <circle cx="20" cy="20" r="7" fill="#0F1B3D" />
        </svg>
      </div>
      <span className="absolute left-[44%] top-[62%] -translate-x-1/4 rounded-full border-2 border-[#0F1B3D] bg-white px-3 py-1 text-xs font-extrabold text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
        SMK Kosgoro
      </span>
    </div>
  );
}

export default function KontakPage() {
  const alamat = CONTACTS[0];
  const jam = CONTACTS[1];
  const telp = CONTACTS[2];
  const email = CONTACTS[3];

  const { buka, hariIdx } = statusLayanan();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `SMK Kosgoro, ${alamat.lines.join(", ")}`,
  )}`;
  const nomorTelp = digits(telp.lines[0]);
  const nomorWa = digits(telp.lines[1]);
  const telUrl = `tel:+62${nomorTelp.replace(/^0/, "")}`;
  const waUrl = `https://wa.me/62${nomorWa.replace(/^0/, "")}`;

  const aksi =
    "group flex items-center justify-between gap-3 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-3 text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D] transition-all duration-150 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0_0_#0F1B3D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none motion-reduce:transition-none";

  return (
    <>
      <style>{CSS}</style>
      <WowInit />

      {/* HEADER */}
      <section className="relative overflow-hidden border-b-2 border-[#0F1B3D] bg-gradient-to-b from-[#C9E6FF] via-[#DCF0FF] to-[#EAF6FF]">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -bottom-24 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(140,203,255,0.6),transparent)]" />
          <div className="absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-white/60" />
          <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              maskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 80%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-32 text-center sm:px-6 sm:pt-36">
          <span
            style={d(0)}
            className="hero-in inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] px-4 py-1.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <Icon name="support_agent" className="text-lg" filled />
            Hubungi Kami
          </span>

          <h1
            style={d(100)}
            className="hero-in mt-6 text-balance font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-[#0F1B3D] sm:text-6xl"
          >
            Kontak
            <span className="relative mx-auto block w-fit text-[#1E78E6]">
              SMK Kosgoro
              <svg
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden
                className="absolute -bottom-3 left-0 h-3 w-full"
              >
                <path
                  d="M2 9 C 30 1, 55 15, 85 7 S 140 1, 170 8 S 235 14, 298 4"
                  fill="none"
                  stroke="#FFC83D"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p style={d(200)} className="hero-in mx-auto mt-8 max-w-xl text-base leading-relaxed text-[#0F1B3D]/75 sm:text-lg">
            Ada kendala saat mendaftar, login, atau mengakses materi? Hubungi
            panitia atau admin sekolah melalui kontak di bawah ini.
          </p>

          {/* status layanan langsung */}
          <p
            style={d(300)}
            className="hero-in mt-8 inline-flex items-center gap-3 rounded-xl border-2 border-[#0F1B3D] bg-white px-4 py-2.5 text-sm font-bold text-[#0F1B3D] shadow-[3px_3px_0_0_#0F1B3D]"
          >
            <span
              aria-hidden
              className={`h-3 w-3 rounded-full ${buka ? "live-dot bg-emerald-500" : "bg-slate-400"}`}
            />
            {buka ? `Layanan sedang buka, tutup pukul ${JAM_TUTUP}.00 WIB` : "Layanan sedang tutup"}
          </p>
        </div>
      </section>

      {/* ISI */}
      <section className="relative overflow-hidden bg-[#F7FBFF]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#0F1B3D 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            {/* alamat + peta */}
            <div className="wow animate__fadeInLeft overflow-hidden rounded-3xl border-2 border-[#0F1B3D] bg-white shadow-[6px_6px_0_0_#0F1B3D]">
              <PetaIlustrasi />
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-[#CFE7FF] text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                    <Icon name={alamat.icon} className="text-2xl" filled />
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">{alamat.title}</h2>
                </div>
                <address className="mt-5 space-y-1 text-base not-italic leading-relaxed text-[#0F1B3D]/80">
                  {alamat.lines.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </address>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#0F1B3D] bg-[#0F1B3D] px-5 py-3 text-sm font-bold text-white shadow-[4px_4px_0_0_#FFC83D] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#FFC83D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E78E6] focus-visible:ring-offset-2 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  <Icon name="map" className="text-xl text-[#FFC83D]" filled />
                  Buka di Google Maps
                </a>
              </div>
            </div>

            {/* kanal kontak */}
            <div className="space-y-6">
              {/* telepon / whatsapp */}
              <div
                className="wow animate__fadeInRight rounded-3xl border-2 border-[#0F1B3D] bg-[#CDF3DD] p-6 shadow-[6px_6px_0_0_#0F1B3D]"
                data-wow-delay="0.05s"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                    <Icon name={telp.icon} className="text-2xl" filled />
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">{telp.title}</h2>
                </div>
                <div className="mt-5 space-y-3">
                  <a href={telUrl} className={aksi}>
                    <span className="font-display text-lg font-extrabold">{telp.lines[0]}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0F1B3D] px-3 py-1 text-xs font-bold text-white">
                      <Icon name="call" className="text-sm" filled />
                      Telepon
                    </span>
                  </a>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className={aksi}>
                    <span className="font-display text-lg font-extrabold">{telp.lines[1]}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12823F] px-3 py-1 text-xs font-bold text-white">
                      <Icon name="chat" className="text-sm" filled />
                      WhatsApp
                    </span>
                  </a>
                </div>
              </div>

              {/* email */}
              <div
                className="wow animate__fadeInRight rounded-3xl border-2 border-[#0F1B3D] bg-[#E6DCFF] p-6 shadow-[6px_6px_0_0_#0F1B3D]"
                data-wow-delay="0.1s"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                    <Icon name={email.icon} className="text-2xl" filled />
                  </span>
                  <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">{email.title}</h2>
                </div>
                <a href={`mailto:${email.lines[0]}`} className={`${aksi} mt-5`}>
                  <span className="min-w-0 truncate font-display text-base font-extrabold sm:text-lg">
                    {email.lines[0]}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0F1B3D] px-3 py-1 text-xs font-bold text-white">
                    <Icon name="mail" className="text-sm" filled />
                    Kirim email
                  </span>
                </a>
              </div>

              {/* jam layanan */}
              <div
                className="wow animate__fadeInRight rounded-3xl border-2 border-[#0F1B3D] bg-[#FFE08A] p-6 shadow-[6px_6px_0_0_#0F1B3D]"
                data-wow-delay="0.15s"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#0F1B3D] bg-white text-[#0F1B3D] shadow-[2px_2px_0_0_#0F1B3D]">
                    <Icon name={jam.icon} className="text-2xl" filled />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-extrabold text-[#0F1B3D]">{jam.title}</h2>
                    <p className="text-sm font-semibold text-[#0F1B3D]/75">{jam.lines[0]}</p>
                  </div>
                </div>
                <div aria-hidden className="mt-5 grid grid-cols-7 gap-1.5">
                  {HARI.map((h, i) => {
                    const layanan = i <= 5;
                    const hariIni = i === hariIdx;
                    return (
                      <span
                        key={h}
                        className={`relative grid h-14 place-items-center rounded-xl border-2 text-sm font-extrabold ${
                          layanan
                            ? "border-[#0F1B3D] bg-white text-[#0F1B3D]"
                            : "border-dashed border-[#0F1B3D]/40 bg-transparent text-[#0F1B3D]/40"
                        } ${hariIni ? "shadow-[3px_3px_0_0_#0F1B3D] ring-2 ring-[#1E78E6] ring-offset-2 ring-offset-[#FFE08A]" : ""}`}
                      >
                        {h}
                        {hariIni && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#0F1B3D] px-1.5 py-0.5 text-[9px] font-bold text-[#FFC83D]">
                            Hari ini
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* grup informasi peserta */}
          <div className="wow animate__fadeInUp mt-16" data-wow-delay="0.1s">
            <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0F1B3D] bg-[#0F1B3D] px-6 py-10 text-center text-white shadow-[8px_8px_0_0_#FFC83D] sm:px-12 sm:py-12">
              <div
                aria-hidden
                className="absolute -right-28 -top-32 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(30,120,230,0.55),transparent)]"
              />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)",
                  backgroundSize: "22px 22px",
                  maskImage: "linear-gradient(to right, black, transparent 70%)",
                  WebkitMaskImage: "linear-gradient(to right, black, transparent 70%)",
                }}
              />
              <div className="relative">
                <span aria-hidden className="mx-auto flex w-fit -space-x-3">
                  {["#CFE7FF", "#FFE08A", "#CDF3DD", "#E6DCFF"].map((c) => (
                    <span
                      key={c}
                      className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#0F1B3D] text-[#0F1B3D]/70"
                      style={{ backgroundColor: c }}
                    >
                      <Icon name="person" className="text-2xl" filled />
                    </span>
                  ))}
                  <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-[#0F1B3D] bg-[#FFC83D] text-[#0F1B3D]">
                    <Icon name="groups" className="text-2xl" filled />
                  </span>
                </span>
                <h2 className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">Grup Informasi Peserta</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                  Bergabunglah untuk mendapatkan info jadwal terbaru, tautan materi, dan
                  bantuan teknis selama proses pembelajaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}