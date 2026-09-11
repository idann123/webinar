import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SMK Kosgoro - Platform Pembelajaran Digital",
    template: "%s | SMK Kosgoro",
  },
  description:
    "Platform pembelajaran digital SMK Kosgoro. Lihat kegiatan pembelajaran, daftar, dan akses materi kapan saja.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans">{children}</body>
    </html>
  );
}