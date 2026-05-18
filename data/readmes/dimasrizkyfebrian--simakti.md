# SIMAKTI (Sistem Informasi Manajemen Kegiatan TI)

<p align="left">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/PHP-8.2%2B-777BB4.svg" alt="PHP 8.2+">
  <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20.svg" alt="Laravel 11">
  <img src="https://img.shields.io/badge/Livewire-3.x-4E56A6.svg" alt="Livewire 3">
  <img src="https://img.shields.io/badge/Alpine.js-3.x-8BC0D0.svg" alt="Alpine.js 3">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4.svg" alt="Tailwind CSS 3">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF.svg" alt="Vite 5">
  <img src="https://img.shields.io/badge/daisyUI-blueviolet" alt="daisyUI">
  <img src="https://img.shields.io/badge/MySQL-blue.svg" alt="MySQL">
</p>

SIMAKTI adalah aplikasi web yang dirancang untuk Jurusan Teknologi Informasi Politeknik Negeri Malang. Aplikasi ini berfungsi sebagai sistem terpusat untuk menggantikan pencatatan manual berbasis Excel, memungkinkan pengelolaan, pelacakan, dan pelaporan semua kegiatan, anggaran, dan realisasi keuangan jurusan secara efisien.

## Fitur Unggulan

Aplikasi ini memiliki alur kerja manajemen yang lengkap, dari perencanaan anggaran hingga pelaporan real-time.

### 1. Manajemen Kegiatan & Anggaran

-   **CRUD Kegiatan:** Mengelola data inti kegiatan, termasuk nama, sub-kegiatan, rentang tanggal, PIC, dan Ketua Pelaksana.
-   **Budgeting (Pagu vs. Pengajuan):** Menetapkan `Pagu Anggaran` (budget) dan `Total Pengajuan` untuk setiap kegiatan.
-   **Validasi Budget:** Sistem secara otomatis mencegah `Total Pengajuan` melebihi `Pagu Anggaran` yang telah ditetapkan.
-   **Status Kegiatan Otomatis:** Setiap kegiatan memiliki status yang dihitung secara _real-time_ (`Direncanakan`, `Persiapan`, `Sedang Berlangsung`, `Telah Selesai`, `Selesai & Lunas`) berdasarkan tanggal dan progres keuangannya.
-   **Pencarian & Filter:**
    -   Pencarian dinamis berdasarkan Nama Kegiatan, Sub-Kegiatan, atau Ketua Pelaksana.
    -   Filter kegiatan berdasarkan PIC (Penanggung Jawab).
    -   Filter kegiatan berdasarkan Status (Direncanakan, Berlangsung, Selesai, dll.).

### 2. Manajemen Transaksi (Buku Besar per Kegiatan)

-   **Detail Keuangan:** Setiap kegiatan memiliki halaman detail yang berfungsi sebagai buku besar (ledger).
-   **CRUD Transaksi:** Mencatat semua `Pemasukan` dan `Pengeluaran` (Realisasi) untuk kegiatan tersebut.
-   **Kalkulasi Realisasi Otomatis:** Setiap kali transaksi ditambah, diubah, atau dihapus, sistem akan **secara otomatis menghitung ulang** total realisasi (total pengeluaran) dan menyimpannya di data kegiatan utama.
-   **Dasbor Keuangan Real-time:** Halaman detail secara instan menampilkan kalkulasi `Total Pemasukan`, `Total Pengeluaran (Realisasi)`, dan `Saldo Kas` (Pemasukan - Pengeluaran).

### 3. Pelaporan (Reporting)

-   **Cetak Laporan:** Menyediakan halaman laporan detail per kegiatan yang dioptimalkan untuk dicetak (`layouts.print`), menampilkan semua informasi kegiatan beserta riwayat transaksinya.

### 4. Manajemen Pengguna & Hak Akses

-   **Autentikasi:** Sistem autentikasi lengkap (Login, Register, Lupa Password) menggunakan **Laravel Breeze**.
-   **Manajemen Profil:** Pengguna dapat memperbarui informasi profil dan kata sandi mereka sendiri.
-   **Manajemen Role (Admin):**
    -   Halaman khusus admin untuk CRUD pengguna (Staf, Dosen, Pejabat).
    -   Menetapkan hak akses (`role`) untuk setiap pengguna (misal: `admin`, `kaprodi`, `jurusan`).
    -   Pencarian dan filter pengguna berdasarkan Nama, Email, atau Role.

## Tumpukan Teknologi (Tech Stack)

Aplikasi ini dibangun menggunakan **TALL Stack** modern:

-   **Framework Backend:** **Laravel 11**
-   **Framework Frontend:** **Livewire 3**
-   **Database:** **MySQL**
-   **JavaScript:** **Alpine.js**
-   **Styling:** **Tailwind CSS**
-   **Komponen UI:** **daisyUI**
-   **Build Tool:** **Vite**
-   **Autentikasi:** **Laravel Breeze**
-   **Paket Tambahan:**
    -   `blade-ui-kit/blade-heroicons`: Untuk ikon SVG.
    -   `diglactic/laravel-breadcrumbs`: Untuk navigasi breadcrumb.
-   **Testing:** **Pest**

## Panduan Instalasi (Getting Started)

1.  **Clone repository:**

    ```bash
    git clone https://github.com/dimasrizkyfebrian/simakti.git
    cd simakti
    ```

2.  **Install dependensi Backend (PHP):**

    ```bash
    composer install
    ```

3.  **Install dependensi Frontend (Node.js):**

    ```bash
    npm install
    ```

4.  **Buat file `.env`:**
    Salin file `.env.example` menjadi `.env`.

    ```bash
    cp .env.example .env
    ```

5.  **Generate Application Key:**

    ```bash
    php artisan key:generate
    ```

6.  **Konfigurasi Database:**
    Buka file `.env` dan sesuaikan pengaturan database **MySQL** kamu.

    ```dotenv
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=simakti
    DB_USERNAME=root
    DB_PASSWORD=
    ```

7.  **Konfigurasi Driver (`.env`):**
    Untuk fungsionalitas optimal (sesuai `.env.example`), atur driver berikut ke `database`:

    ```dotenv
    SESSION_DRIVER=database
    QUEUE_CONNECTION=database
    CACHE_STORE=database
    ```

8.  **Jalankan Migrasi & Seeder:**
    Perintah ini akan membuat semua tabel dan (jika ada) mengisi data awal.

    ```bash
    php artisan migrate --seed
    ```

9.  **Jalankan Build Assets (Vite):**

    ```bash
    # Untuk development (menonton perubahan file)
    npm run dev

    # Atau untuk production
    npm run build
    ```

10. **Jalankan Server Lokal:**
    Buka terminal baru dan jalankan:
    ```bash
    php artisan serve
    ```

Aplikasi sekarang berjalan di `http://127.0.0.1:8000`.

## Lisensi

Proyek ini berada di bawah [Lisensi MIT](LICENSE).
