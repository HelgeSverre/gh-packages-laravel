# SAKAM - Sistem Absensi Karyawan Modern

![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel)
![Livewire](https://img.shields.io/badge/Livewire-3.x-4B5563?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)

SAKAM adalah aplikasi web *full-stack* yang dibangun sebagai studi kasus dan portofolio untuk menunjukkan keahlian dalam ekosistem **Laravel** dan **TALL Stack**. Aplikasi ini menyediakan solusi lengkap dan modern untuk manajemen kehadiran karyawan secara digital, mulai dari absensi harian, manajemen cuti, hingga otomatisasi proses HR.

<br>

> *Screenshot Halaman Admin*
![Image](https://github.com/user-attachments/assets/3d259e1a-d150-4a30-9bd8-2965261d4684)

![Image](https://github.com/user-attachments/assets/fd26ddee-c8f7-42eb-b533-8016809248f0)

![Image](https://github.com/user-attachments/assets/bdbeae75-2cc7-48ad-ae62-bca7d11355a6)

![Image](https://github.com/user-attachments/assets/0d4607c9-aab6-46ea-92f2-1afa7158a61c)

![Image](https://github.com/user-attachments/assets/546c93f5-ca0d-4705-82d0-75db5af3142b)
> *Screenshoots Halaman User*
![Image](https://github.com/user-attachments/assets/491aafad-5ac0-4364-b6a5-49229bc1d099)
![Image](https://github.com/user-attachments/assets/9144a63c-7522-482f-a096-99148aba1965)
![Image](https://github.com/user-attachments/assets/51b5c96b-1fac-4e3c-9efa-b28c65c6c9ea)

---

## ✨ Fitur Unggulan

Aplikasi ini dirancang dengan fitur-fitur komprehensif yang mencerminkan kebutuhan bisnis di dunia nyata:

* 🔐 **Autentikasi & Otorisasi Berbasis Peran**
    * Sistem login/register aman menggunakan **Laravel Breeze**.
    * Manajemen peran **Admin** & **Karyawan** dengan hak akses dinamis menggunakan paket **Spatie Laravel Permission**.

* 🕒 **Sistem Absensi Fleksibel**
    * Fitur **Check-in** & **Check-out** harian dengan validasi jam keterlambatan otomatis.
    * Dukungan **Absensi di Luar Kantor (Remote/Dinas)** yang mewajibkan unggah **bukti foto** dan catatan pekerjaan.

* ⚙️ **Administrasi & Otomatisasi Cerdas**
    * **Manajemen Karyawan (CRUD)** penuh oleh Admin.
    * **Sistem Pengajuan Cuti/Izin** dengan alur persetujuan oleh Admin.
    * **Penandaan Absen Otomatis** menggunakan **Scheduled Task (Cron Job)** untuk karyawan yang tidak melakukan check-in.
    * **Halaman Pengaturan Global** agar Admin bisa mengubah aturan bisnis (jam kerja, lokasi kantor) tanpa mengubah kode.

* 📊 **Pelaporan & Analitik**
    * **Dashboard Statistik** dengan kartu rekapitulasi harian dan grafik kehadiran bulanan interaktif.
    * **Riwayat Absensi** lengkap dengan fitur filter berdasarkan rentang tanggal.
    * Fitur **Ekspor Laporan** ke format **PDF** dan **Excel**.

* 🔔 **Pengalaman Pengguna Modern**
    * **Notifikasi Real-time** untuk Admin (via *database polling*) saat ada pengajuan cuti baru.
    * **UI Modern & Responsif** dengan layout sidebar kiri, animasi, dan dukungan penuh untuk perangkat mobile.
    * **Halaman Kustom** untuk Login, Register, Error (404/500), dan Halaman Sambutan.
    * **Peta Interaktif** di halaman pengaturan untuk memilih lokasi kantor dengan mudah.

---

## 🛠️ Teknologi yang Digunakan

| Kategori | Teknologi |
| :--- | :--- |
| **Backend** | Laravel 10, PHP 8.x |
| **Frontend** | Livewire 3, Alpine.js |
| **Styling** | Tailwind CSS 3 |
| **Database** | MySQL / PostgreSQL |
| **Paket Utama**| Spatie Laravel Permission, Maatwebsite/Excel, Barryvdh/laravel-dompdf, Spatie Laravel Settings |
| **Library Frontend** | Chart.js, Leaflet.js, Toastify.js |

---

## 🚀 Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di komputer Anda:

1.  **Clone repositori:**
    ```bash
    git clone [https://github.com/IamImam7/projek-absensi.git](https://github.com/IamImam7/projek-absensi.git)
    cd projek-absensi
    ```
2.  **Install dependensi Backend & Frontend:**
    ```bash
    composer install
    npm install
    ```
3.  **Setup file `.env`:**
    ```bash
    cp .env.example .env
    ```
4.  **Generate application key:**
    ```bash
    php artisan key:generate
    ```
5.  **Konfigurasi database** (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) dan **kredensial email** (`MAIL_...`) Anda di dalam file `.env`.

6.  **Jalankan migrasi dan seeder** untuk membuat tabel dan data awal:
    ```bash
    php artisan migrate:fresh --seed
    ```
7.  **Buat symbolic link** untuk storage (agar foto bukti bisa diakses):
    ```bash
    php artisan storage:link
    ```
8.  **Jalankan server Vite dan Laravel** di dua terminal terpisah:
    ```bash
    # Di terminal 1
    npm run dev

    # Di terminal 2
    php artisan serve
    ```

Aplikasi sekarang berjalan di `http://127.0.0.1:8000`.

---

## 🔑 Kredensial Demo

Gunakan akun berikut untuk login dan mencoba fitur aplikasi:

| Peran | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@sakam.com` | `password` |
| **Karyawan**| `budi.s@sakam.com` | `password` |
| **Karyawan Lain**| `citra.l@sakam.com` | `password` |
