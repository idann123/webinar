flowchart TD
A[Mulai - Buka Website Webinar Sekolah] --> B{Sudah Punya Akun?}
B -- Belum --> C["Daftar Akun: Nama, Email, Password, Kelas, Jurusan"]
C --> D[(Simpan ke Database)]
D --> E[Login]
B -- Sudah --> E[Login]
E --> F{Cek Role User}

F -- Siswa --> G[Dashboard Siswa]
F -- Guru --> H[Dashboard Guru]
F -- Admin --> I[Dashboard Admin]

%% Alur Siswa
G --> G1[Lihat Daftar Kegiatan Pembelajaran]
G1 --> G2{Filter Status: Belum Mulai / Berlangsung / Selesai}
G2 --> G3[Pilih Kegiatan]
G3 --> G4["Lihat Detail: Mapel, Judul, Guru, Tanggal, Jumlah Siswa Daftar"]
G4 --> G5{Sudah Terdaftar?}
G5 -- Belum --> G6[Klik Daftar Kegiatan]
G6 --> G7[(Sistem Simpan Pendaftaran & Update Jumlah Siswa)]
G5 -- Sudah --> G8[Buka Materi Pembelajaran]
G7 --> G8
G8 --> G9[Belajar via HP: Baca/Tonton Materi]
G9 --> Z1([Selesai])

%% Alur Guru
H --> H1["Buat Kegiatan Baru: Pilih Mapel, Isi Judul Pembelajaran, Tanggal & Waktu"]
H1 --> H2[Upload Materi Pembelajaran]
H2 --> H3{Update Status Kegiatan}
H3 -- Waktunya Mulai --> H3a[Status: Berlangsung]
H3 -- Sudah Selesai --> H3b[Status: Selesai]
H3a --> H4[Lihat Daftar Siswa yang Sudah Mendaftar]
H3b --> H4
H4 --> Z2([Selesai])

%% Alur Admin
I --> I1["Kelola Data Master: Mapel, Kelas, Jurusan"]
I1 --> I2[Kelola Akun Guru & Siswa]
I2 --> I3[Pantau Semua Kegiatan Pembelajaran]
I3 --> Z3([Selesai])
erDiagram
JURUSAN ||--o{ KELAS : memiliki
KELAS ||--o{ SISWA : "diisi oleh"
USERS ||--|| SISWA : "berperan sebagai"
USERS ||--|| GURU : "berperan sebagai"
MAPEL ||--o{ KEGIATAN : "menjadi topik"
GURU ||--o{ KEGIATAN : mengajar
KEGIATAN ||--o{ MATERI : memiliki
KEGIATAN ||--o{ PENDAFTARAN : "didaftari pada"
SISWA ||--o{ PENDAFTARAN : mendaftar

USERS {
    int id PK
    string nama
    string emaila
    string password
    string role "siswa / guru / admin"
    datetime created_at
}

SISWA {
    int id PK
    int user_id FK
    int kelas_id FK
}

GURU {
    int id PK
    int user_id FK
    string nip
}

JURUSAN {
    int id PK
    string nama_jurusan "misal: TKJ, RPL, Akuntansi"
}

KELAS {
    int id PK
    string nama_kelas "misal: XI RPL 1"
    int jurusan_id FK
}

MAPEL {
    int id PK
    string nama_mapel "misal: Basis Data"
}

KEGIATAN {
    int id PK
    string judul_pembelajaran
    int mapel_id FK
    int guru_id FK
    date tanggal
    time waktu_mulai
    time waktu_selesai
    string status "belum_mulai / berlangsung / selesai"
    text deskripsi
    int jumlah_siswa_daftar "otomatis dihitung dari PENDAFTARAN"
}

MATERI {
    int id PK
    int kegiatan_id FK
    string judul_materi
    string file_path
    string tipe "pdf / video / link"
}

PENDAFTARAN {
    int id PK
    int siswa_id FK
    int kegiatan_id FK
    datetime tanggal_daftar
    string status_kehadiran "hadir / tidak_hadir"
}
Plan Fitur — Website Pembelajaran Digital SMK Kosgoro
Berdasarkan ERD dan flowchart yang sudah dibuat. Dibagi per modul/role supaya jelas siapa pakai fitur apa.

1. Modul Autentikasi (Users)

Daftar akun (nama, email, password, kelas, jurusan) — khusus siswa

Login (email + password)

Logout

Lupa password / reset password via email

Edit profil (nama, foto, kelas/jurusan)

Role otomatis: Siswa, Guru, Admin (tampilan dashboard beda-beda)
2. Modul Siswa
Melihat Kegiatan


Halaman "Daftar Kegiatan Pembelajaran" (list semua kegiatan)

Filter berdasarkan status: Belum Mulai / Berlangsung / Selesai

Filter berdasarkan mapel atau tanggal

Search kegiatan (cari judul pembelajaran)

Halaman detail kegiatan: mapel, judul, guru pengajar, tanggal, jam, jumlah siswa yang sudah daftar
Daftar & Belajar


Tombol "Daftar Kegiatan" (sekali klik, langsung tercatat di tabel Pendaftaran)

Status "Sudah Terdaftar" biar gak bisa daftar dobel

Akses materi pembelajaran (baca PDF / tonton video / buka link) — bisa dari HP

Riwayat kegiatan yang pernah diikuti (history belajar)

Notifikasi kalau ada kegiatan baru sesuai kelas/jurusannya
3. Modul Guru
Kelola Kegiatan


Buat kegiatan baru (pilih mapel, isi judul pembelajaran, tanggal, jam mulai-selesai, deskripsi)

Edit / hapus kegiatan yang sudah dibuat

Ubah status kegiatan (Belum Mulai → Berlangsung → Selesai), manual atau otomatis sesuai tanggal/jam

Upload materi pembelajaran (PDF, video, atau link) ke tiap kegiatan

Lihat daftar siswa yang sudah mendaftar per kegiatan

Rekap jumlah siswa daftar per kegiatan (buat laporan sederhana)
Opsional (biar makin lengkap)


Tandai kehadiran siswa (hadir/tidak hadir) — pakai kolom status_kehadiran di tabel Pendaftaran

Beri pengumuman/catatan tambahan di halaman kegiatan
4. Modul Admin
Data Master


Kelola data Jurusan (tambah/edit/hapus)

Kelola data Kelas (tambah/edit/hapus, terhubung ke jurusan)

Kelola data Mapel (tambah/edit/hapus)

Kelola akun Guru (tambah guru baru, assign ke mapel)

Kelola akun Siswa (approve/reject, edit, non-aktifkan akun)
Monitoring


Dashboard ringkasan: total kegiatan, total siswa terdaftar, kegiatan berlangsung hari ini

Lihat semua kegiatan dari semua guru (bisa filter per mapel/guru/kelas)

Statistik keaktifan siswa (siapa paling sering ikut kegiatan)
5. Fitur Umum / Tampilan Depan (tanpa login)

Halaman Home (perkenalan sekolah + ajakan daftar/login)

Halaman "Kegiatan" publik (list kegiatan, tapi harus login untuk daftar/akses materi)

Halaman Panduan cara pakai website

Halaman FAQ

Halaman Kontak (info sekolah)
6. Fitur Tambahan (Nice to Have, bisa nyusul)

Kalender kegiatan (tampilan bulanan biar siswa gampang lihat jadwal)

Notifikasi via email/WA saat kegiatan mau mulai

Mode offline sederhana (materi bisa didownload untuk dibaca tanpa internet)

Live chat / kolom komentar di tiap kegiatan buat tanya jawab

Statistik nilai/tugas kalau nanti mau dikembangkan jadi e-learning penuh
Prioritas Pengerjaan (Saran Urutan Build)
Tahap 1 (Wajib jalan dulu): Auth (daftar/login), CRUD Kegiatan oleh Guru, List & Detail Kegiatan untuk Siswa, Daftar Kegiatan
Tahap 2: Upload & akses Materi, Update status kegiatan, Dashboard Admin (data master)
Tahap 3: Absensi/kehadiran, Statistik, Notifikasi
Tahap 4 (Opsional): Kalender, chat, mode offline