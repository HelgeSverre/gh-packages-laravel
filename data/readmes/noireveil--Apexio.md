<div align="center">

# Apexio - Sistem Manajemen Proyek

![Status](https://img.shields.io/badge/Status-Selesai-success?style=for-the-badge)
![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Livewire](https://img.shields.io/badge/Livewire-3-4E56A6?style=for-the-badge&logo=livewire&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)

**Apexio** adalah aplikasi manajemen proyek berbasis web yang dirancang untuk memfasilitasi kolaborasi tim yang efisien. Aplikasi ini dibangun menggunakan **Laravel 11** dan **Livewire 3**, mengadopsi pendekatan *Modern Monolith* untuk memberikan pengalaman pengguna yang reaktif dan mulus tanpa kompleksitas SPA terpisah.

[📘 **Baca Dokumentasi Teknis**](./DOCUMENTATION.md)

</div>

---

## 📸 Tampilan Aplikasi

Berikut adalah tampilan utama Apexio, menampilkan Sidebar dan Kanban Board:

![Dashboard & Kanban](./screenshots/kanban_and_sidebar.jpeg)

---

## ✨ Fitur Utama

### 1. Manajemen Tugas Lanjutan (Kanban)
* **Drag & Drop Kanban:** Papan interaktif yang memungkinkan pengguna memindahkan tugas antar status (To-Do, In-Progress, Done) dengan mulus menggunakan SortableJS.
* **Tenggat Waktu Real-time:** Sistem deadline pintar dengan badge yang diperbarui otomatis ("Segera" atau "Terlambat") berdasarkan waktu lokal pengguna.
* **Detail Tugas:** Tampilan kartu komprehensif dengan tingkat prioritas, assignee, dan diskusi berulir (komentar).

### 2. Ruang Kerja Personal
* **Halaman "Tugas Saya":** Tampilan agregasi khusus yang menampilkan semua tugas yang diberikan kepada pengguna saat ini di berbagai proyek, diurutkan berdasarkan urgensi.
* **Sidebar Navigasi:** Sidebar tetap dan responsif dengan indikator status aktif dan akses cepat ke proyek terbaru.

### 3. Administrasi & Keamanan
* **Dashboard Super Admin:** Panel eksklusif untuk pengawasan sistem, menampilkan statistik real-time (Total Pengguna, Proyek, Tugas Aktif).
* **Manajemen Pengguna:** Alat admin untuk memantau daftar pengguna, melihat **Status Online Real-time**, mereset password, dan mengelola peran akses.
* **Kontrol Akses Berbasis Peran (RBAC):** Logika otorisasi ketat yang memastikan pengguna hanya dapat memodifikasi tugas mereka sendiri, sementara Admin memiliki pengawasan penuh.

### 4. Profil & Pengaturan Pengguna
* **Manajemen Profil:** Pengguna dapat memperbarui detail mereka dan mengunggah foto profil dengan preview instan.
* **Avatar Pintar:** Sistem secara otomatis menghasilkan avatar berbasis inisial untuk pengguna tanpa foto profil.
* **Keamanan Akun:** Pengaturan terpusat untuk pembaruan password dan penghapusan akun yang aman.

### 5. UI/UX Modern
* **Layout Responsif:** Dibangun dengan Flexbox dan Bootstrap 5 + SCSS untuk pengalaman pixel-perfect di berbagai ukuran layar.
* **Umpan Balik Interaktif:** Notifikasi toast dan isyarat visual (perubahan kursor, status loading) untuk pengalaman pengguna yang mulus.

---

## 🛠️ Stack Teknologi

* **Backend:** Laravel 11 Framework
* **Logika Frontend:** Livewire 3 (Reaktivitas full-stack)
* **Styling:** Bootstrap 5 + SCSS Custom (Arsitektur berbasis komponen)
* **Database:** MySQL / MariaDB
* **Scripting:** Alpine.js (Mikro-interaksi) + SortableJS (Drag & Drop)

---

## 💻 Panduan Instalasi

Pastikan Anda telah menginstal **PHP 8.2+**, **Composer**, dan **Node.js** sebelum memulai.

### 1. Pengaturan Awal
Jalankan perintah berikut di terminal Anda:

```bash
# Clone repository
git clone https://github.com/noireveil/Apexio.git
cd Apexio

# Install dependensi Backend & Frontend
composer install
npm install

# Duplikat konfigurasi environment
cp .env.example .env

# Generate Application Key
php artisan key:generate
```

### 2. Konfigurasi Database

Buka file `.env` dan sesuaikan konfigurasi database (`DB_DATABASE=apexio`). Kemudian ikuti langkah-langkah sesuai sistem operasi Anda:

#### A. Pengguna Windows (Laragon/XAMPP)
1. Pastikan Laragon/XAMPP berjalan (Start All).
2. Buka HeidiSQL (Laragon) atau phpMyAdmin.
3. Buat database baru dengan nama: `apexio`.
4. Pastikan file `.env` sesuai dengan kredensial Anda (default Laragon biasanya user: `root`, password: kosong).

#### B. Pengguna Linux (Terminal)
1. Pastikan layanan database berjalan:
   ```bash
   sudo systemctl start mariadb  # atau mysql
   ```

2. Login ke MySQL dan buat database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE apexio;"
   ```

3. Sesuaikan username dan password database di file `.env` jika Anda menggunakan kredensial custom.

### 3. Migrasi & Storage

Setelah database siap, jalankan perintah berikut di terminal proyek untuk membuat tabel dan seed data demo masif:

```bash
# Buat tabel dan seed data demo masif (50 Proyek, ~600 Tugas)
php artisan migrate:fresh --seed

# Buat symbolic link agar foto profil dapat diakses secara publik (WAJIB)
php artisan storage:link
```

### 📧 Pengaturan Email (Fitur Lupa Password)

Untuk menguji fungsionalitas "Lupa Password" (mengirim link reset via email), Anda harus mengkonfigurasi server SMTP. Cara termudah adalah menggunakan Gmail App Password:

1. Buka Google Account Anda > Security.
2. Aktifkan 2-Step Verification (jika belum aktif).
3. Cari "App Passwords".
4. Buat app password baru (misalnya, beri nama "Apexio Local").
5. Salin password 16 karakter yang dihasilkan.
6. Buka file `.env` Anda dan perbarui bagian MAIL:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=email_anda@gmail.com  # Alamat Gmail asli Anda
MAIL_PASSWORD=xxxx xxxx xxxx xxxx   # App Password yang baru saja dibuat
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@apexio.com"
MAIL_FROM_NAME="${APP_NAME}"
```

**Catatan:** Tanpa langkah ini, mencoba mereset password akan menghasilkan error koneksi.

---

## 🚀 Menjalankan Aplikasi

Aplikasi ini memerlukan dua proses terminal yang berjalan secara bersamaan.

**Terminal 1** (Jalankan Laravel Server):
```bash
php artisan serve
```

**Terminal 2** (Jalankan Kompilasi Asset / Vite):
```bash
npm run dev
```

Akses aplikasi melalui browser di: **http://localhost:8000**

---

## 🔐 Akses Demo & Skenario Pengujian

Database seeder menghasilkan dataset masif (50 Proyek, ~600 Tugas, ~8.000 Komentar) untuk mensimulasikan lingkungan yang sibuk dan aktif.

### 1. Akses Admin (Untuk melihat data terisi)

Gunakan akun ini untuk menjelajahi dashboard, mengelola pengguna, dan melihat aplikasi dengan data lengkap.

| Peran | Email | Password | Deskripsi |
|-------|-------|----------|-----------|
| Super Admin | admin@apexio.com | password | Akses Sistem Penuh & Tampilan Data Lengkap |

### 2. Pengujian Pengguna Reguler (Direkomendasikan)

Seeder membuat 50 "pengguna dummy" acak untuk mengisi proyek, tetapi tidak membuat akun demo pengguna khusus untuk Anda.

* **Untuk Menguji Registrasi:** Silakan gunakan fitur Register dengan alamat email pribadi Anda sendiri.
* **Untuk Menguji Lupa Password:** Setelah mendaftar, logout dan gunakan link "Lupa password?". Pastikan Anda telah mengkonfigurasi file `.env` seperti yang dijelaskan di bagian "Pengaturan Email" di atas.

**Mengapa?** Ini memungkinkan Anda mengalami alur onboarding lengkap dan memverifikasi bahwa pengiriman email berfungsi dengan konfigurasi SMTP spesifik Anda.

---

## 📚 Dokumentasi API (PHPDoc)

Source code proyek ini telah dilengkapi dengan komentar dokumentasi standar (DocBlocks). Dokumentasi API lengkap telah di-generate menggunakan PHPDocumentor dan tersedia dalam format HTML yang dapat diakses langsung melalui browser.

### 🌐 Cara Mengakses Dokumentasi

#### Metode 1: Buka Langsung di Browser (Paling Mudah)
1. Navigasi ke folder `docs/api` di dalam direktori proyek Apexio
2. Cari file `index.html`
3. **Klik kanan** pada file `index.html` > **Open With** > Pilih browser favorit Anda (Chrome, Firefox, Edge, dll)
4. Dokumentasi akan terbuka langsung di browser

**Path lengkap:** `Apexio/docs/api/index.html`

#### Metode 2: Menggunakan Live Server (VS Code)
Jika Anda menggunakan Visual Studio Code, Anda dapat menggunakan ekstensi Live Server untuk pengalaman yang lebih baik:

1. Install ekstensi **Live Server** dari Extensions Marketplace (jika belum terinstall)
2. Buka folder `docs/api` di VS Code
3. Klik kanan pada file `index.html`
4. Pilih **"Open with Live Server"**
5. Dokumentasi akan terbuka di browser dengan fitur auto-refresh

**Keuntungan Live Server:**
- Auto-reload saat ada perubahan
- Local server dengan HTTP protocol proper
- Lebih cepat untuk navigasi antar halaman

#### Metode 3: HTTP Server Sederhana (Terminal)
Anda juga bisa menggunakan built-in HTTP server dari PHP atau Python:

**Menggunakan PHP:**
```bash
cd docs/api
php -S localhost:8080
```
Kemudian buka browser dan akses: `http://localhost:8080`

**Menggunakan Python:**
```bash
cd docs/api
# Python 3
python -m http.server 8080
# atau Python 2
python -m SimpleHTTPServer 8080
```
Kemudian buka browser dan akses: `http://localhost:8080`

### 📖 Isi Dokumentasi

Dokumentasi API mencakup:
- **Struktur Kelas Lengkap:** Semua Model, Controller, Livewire Component, Middleware, dan Service Class
- **Detail Method:** Parameter, return type, dan deskripsi fungsi untuk setiap method
- **Relasi Database:** Dokumentasi relasi Eloquent (hasMany, belongsTo, dll)
- **Namespace & Dependencies:** Struktur organisasi kode dan dependensinya
- **Property & Attributes:** Dokumentasi lengkap untuk setiap property class

### 🔍 Navigasi Dokumentasi

Setelah membuka dokumentasi, Anda akan menemukan:
- **Sidebar Kiri:** Daftar namespace dan class yang terorganisir
- **Panel Utama:** Detail dokumentasi untuk class/method yang dipilih
- **Search Box:** Fitur pencarian cepat untuk menemukan class atau method tertentu
- **Index:** Daftar alfabetis dari semua elemen yang terdokumentasi

**Catatan:** Dokumentasi ini bersifat **statis** (HTML/CSS/JS), sehingga dapat dibuka dan digunakan tanpa memerlukan server web aktif. Semua file berada di folder `docs/api` dan siap digunakan kapan saja.

---

## 📝 Catatan Penting

* Pastikan kedua terminal (Laravel server dan Vite) tetap berjalan selama development
* Jangan lupa menjalankan `php artisan storage:link` untuk akses foto profil
* Untuk production, compile assets dengan `npm run build`
* Database seeder akan mereset semua data yang ada, gunakan dengan hati-hati
