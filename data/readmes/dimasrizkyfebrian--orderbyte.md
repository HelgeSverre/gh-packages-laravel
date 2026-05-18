# OrderByte (Sistem Manajemen Kafe)

<p align="left">
    <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20.svg" alt="Laravel 11">
    <img src="https://img.shields.io/badge/Filament-3.x-F59E0B.svg" alt="Filament 3">
    <img src="https://img.shields.io/badge/Livewire-3.x-4E56A6.svg" alt="Livewire 3">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4.svg" alt="Tailwind CSS 3">
    <img src="https://img.shields.io/badge/Vite-5.x-646CFF.svg" alt="Vite 5">
    <img src="https://img.shields.io/badge/MySQL-blue.svg" alt="MySQL">
</p>

Aplikasi web Point-of-Sale (POS) dan manajemen kafe yang dirancang untuk menangani alur pemesanan *multi-role* secara lengkap. Dibangun sebagai proyek untuk sertifikasi BNSP, aplikasi ini mengelola alur kerja dari pemesanan mandiri oleh pelanggan, konfirmasi kasir, Kitchen Display System (KDS), hingga pelaporan omset di panel admin.

## Alur Kerja Aplikasi (Multi-Role)

Aplikasi ini memiliki 4 peran utama dengan alur kerja yang saling terhubung:

### 1. Pelanggan (Customer)

* **Pemesanan Mandiri:** Pelanggan dapat memindai QR di meja, memilih meja, dan melihat menu yang dikelompokkan berdasarkan kategori.
* **Melihat Rating:** Setiap item menu menampilkan **rata-rata rating** dan **jumlah ulasan** dari pelanggan lain.
* **Checkout:** Setelah selesai memilih, pelanggan melakukan checkout. Pesanan dibuat dengan nomor order unik (misal: `ORD-251026-ABCD`) dan status **`menunggu_pembayaran`**.
* **Riwayat & Ulasan:** Setelah pesanan diselesaikan oleh kasir, pesanan akan muncul di halaman riwayat. Pelanggan dapat memberikan **rating (1-5 bintang)** dan **komentar** untuk setiap item menu yang telah mereka pesan.

### 2. Kasir (Cashier)

Dasbor kasir adalah pusat kendali yang memiliki dua tanggung jawab utama:

* **1. Konfirmasi Pembayaran:**
    * Melihat antrian pesanan yang berstatus `menunggu_pembayaran`.
    * Setelah pelanggan membayar, kasir menekan "Konfirmasi".
    * Status pesanan berubah menjadi **`diproses`** dan secara otomatis dikirim ke antrian Dapur (KDS).
* **2. Menyelesaikan Pesanan:**
    * Melihat antrian pesanan yang berstatus `siap_disajikan` (pesanan yang telah selesai disiapkan oleh dapur).
    * Kasir mengantarkan pesanan ke meja pelanggan, lalu menekan "Selesai".
    * Status pesanan berubah menjadi **`selesai`**, dan pesanan kini muncul di riwayat pelanggan.

### 3. Dapur (Kitchen Display System - KDS)

* **Antrian Pesanan:** Layar KDS hanya menampilkan pesanan yang relevan (status **`diproses`**).
* **Manajemen Stok Otomatis:** Saat koki selesai menyiapkan pesanan dan menekan "Siap Disajikan":
    * Logika ini dibungkus dalam `DB::transaction` untuk memastikan keamanan data.
    * Stok setiap item menu di dalam pesanan akan **dikurangi secara otomatis** dari database (`stock_quantity`).
    * Status pesanan berubah menjadi **`siap_disajikan`** dan hilang dari layar KDS.

### 4. Admin (Filament Panel)

Admin memiliki kontrol penuh atas seluruh ekosistem kafe melalui Panel Admin Filament:

* **Laporan Penjualan:** Melihat seluruh riwayat pesanan dengan filter canggih berdasarkan **rentang tanggal** dan **status**.
* **Kalkulasi Omset:** Halaman laporan secara otomatis **menjumlahkan total omset** dari semua pesanan yang ditampilkan (`summarize(Sum::make())`).
* **Manajemen Menu & Stok:** Menambah, mengedit, dan menghapus menu, serta **mengatur `stock_quantity`** (stok awal).
* **Manajemen Pengguna & Role:** Membuat akun untuk staf dan menetapkan *role* mereka (`admin`, `kasir`, `kitchen`).
* **Manajemen Ulasan:** Melihat semua ulasan yang masuk dari pelanggan dan dapat **memfilter ulasan berdasarkan rating** (misal: "tampilkan semua ulasan bintang 1").

## Disclaimer & Potensi Pengembangan

Harap dicatat bahwa proyek ini dibuat untuk memenuhi skema sertifikasi BNSP. Alur kerja utamanya telah selesai dan berfungsi, namun masih memiliki banyak ruang untuk pengembangan lebih lanjut.

Satu fitur utama yang direncanakan namun **belum diimplementasikan** adalah **pembayaran via QRIS**. Saat ini, alur pembayaran pelanggan masih menggunakan mekanisme manual (bayar di kasir), di mana kasir memvalidasi pembayaran secara manual.

Fitur potensial untuk pengembangan di masa depan meliputi:
* **Integrasi Payment Gateway (QRIS):** Mengganti alur bayar di kasir dengan sistem *payment gateway* (seperti Midtrans/Xendit) agar pelanggan bisa bayar langsung setelah checkout.
* **Real-time Notifications:** Menggunakan WebSockets (Laravel Echo) untuk notifikasi *real-time* (misalnya, notifikasi ke pelanggan saat pesanan "Siap Disajikan").
* **Manajemen Inventaris:** Sistem manajemen stok bahan baku yang lebih detail, yang akan mengurangi stok bahan (bukan stok menu) saat pesanan dibuat.

## Tumpukan Teknologi (Tech Stack)

* **Framework Backend:** **Laravel 11**
* **Panel Admin:** **Filament 3**
* **UI/Interactivity:** **Livewire 3**
* **Database:** **MySQL**
* **Styling:** **Tailwind CSS**
* **JavaScript:** **Alpine.js**
* **Autentikasi:** **Laravel Breeze**
* **Build Tool:** **Vite**

## Panduan Instalasi (Getting Started)

1.  **Clone repository:**
    ```bash
    git clone https://github.com/dimasrizkyfebrian/orderbyte.git
    cd orderbyte
    ```

2.  **Install dependensi Backend (PHP):**
    ```bash
    composer install
    ```

3.  **Install dependensi Frontend (Node.js):**
    ```bash
    npm install
    ```

4.  **Setup `.env`:**
    Salin file `.env.example` menjadi `.env`.
    ```bash
    cp .env.example .env
    ```

5.  **Generate Key:**
    ```bash
    php artisan key:generate
    ```

6.  **Konfigurasi Database:**
    Buka file `.env` dan sesuaikan pengaturan database **MySQL** kamu (buat database baru bernama `orderbyte`).
    ```dotenv
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=orderbyte
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
    ```bash
    php artisan migrate --seed
    ```

9.  **Link Storage:**
    ```bash
    php artisan storage:link
    ```

10. **Jalankan Build Assets (Vite):**
    ```bash
    # Untuk development (menonton perubahan file)
    npm run dev
    
    # Atau untuk production
    npm run build
    ```

11. **Jalankan Server Lokal:**
    Buka terminal baru dan jalankan:
    ```bash
    php artisan serve
    ```

Aplikasi sekarang berjalan di `http://127.0.0.1:8000`.

## Lisensi

Proyek ini berada di bawah [Lisensi MIT](LICENSE).
