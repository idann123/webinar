import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const registerSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  kelasId: z.coerce.number().int().positive("Pilih kelas terlebih dahulu"),
});

export const kegiatanSchema = z.object({
  judulPembelajaran: z.string().min(3, "Judul minimal 3 karakter"),
  mapelId: z.coerce.number().int().positive("Pilih mata pelajaran"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  waktuMulai: z.string().min(1, "Jam mulai wajib diisi"),
  waktuSelesai: z.string().min(1, "Jam selesai wajib diisi"),
  deskripsi: z.string().optional().default(""),
});

export const materiLinkSchema = z.object({
  judulMateri: z.string().min(3, "Judul materi minimal 3 karakter"),
  url: z.string().url("Masukkan URL yang valid (https://...)"),
});

export const jurusanSchema = z.object({
  namaJurusan: z.string().min(2, "Nama jurusan minimal 2 karakter"),
});

export const kelasSchema = z.object({
  namaKelas: z.string().min(1, "Nama kelas wajib diisi"),
  jurusanId: z.coerce.number().int().positive("Pilih jurusan"),
});

export const mapelSchema = z.object({
  namaMapel: z.string().min(2, "Nama mapel minimal 2 karakter"),
});

export const guruSchema = z.object({
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  nip: z.string().min(4, "NIP wajib diisi"),
  mapelIds: z.array(z.coerce.number().int().positive()).min(1, "Pilih minimal satu mapel"),
});