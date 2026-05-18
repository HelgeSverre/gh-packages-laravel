# Kasir Fotocopy Sekolah

[![CI](https://github.com/ITCLUB-SMEAS/point-of-sales/actions/workflows/ci.yml/badge.svg)](https://github.com/ITCLUB-SMEAS/point-of-sales/actions/workflows/ci.yml)

Kasir Fotocopy Sekolah adalah aplikasi kasir sederhana untuk toko fotocopy di lingkungan sekolah. Aplikasi ini dibuat agar transaksi harian bisa dicatat dengan rapi, kasir murid tetap mudah menggunakan sistem, dan admin/guru tetap punya kontrol terhadap laporan, stok, dan aktivitas kasir.

## Kegunaan Utama

Aplikasi ini membantu toko fotocopy sekolah untuk:

- Mencatat transaksi fotocopy, print, scan, jilid, laminating, dan penjualan ATK.
- Membuka dan menutup shift kasir.
- Menerima pembayaran cash dan QRIS.
- Menyimpan draft keranjang ketika transaksi belum jadi dibayar.
- Mencetak atau melihat struk transaksi.
- Mengelola stok barang dan bahan habis pakai.
- Menampilkan peringatan stok menipis.
- Mencatat retur/refund transaksi.
- Membuat laporan harian dalam format PDF dan CSV.
- Melihat audit aktivitas kasir, terutama jika ada selisih kas.
- Meminta approval admin untuk aksi sensitif seperti void, refund, dan koreksi tertentu.

## Hak Akses

Ada beberapa peran pengguna di aplikasi:

- **Admin/Guru**: mengelola produk, stok, laporan, user, approval, audit, dan aktivitas backoffice.
- **Kasir Murid**: fokus memakai halaman kasir di `/pos`.
- **Supervisor**: bisa membantu approval dan pengecekan operasional jika dibutuhkan.

Kasir murid dibuat sesederhana mungkin agar tidak perlu masuk ke banyak menu admin.

## Halaman Penting

- `/pos` - halaman utama kasir untuk transaksi cepat.
- `/admin` - halaman admin/backoffice berbasis Filament.
- `/admin/daily-report` - laporan harian.
- `/admin/cashier-audit` - audit detail per kasir.
- `/admin/reorder-list` - daftar stok yang perlu dibeli ulang.

## Teknologi

Aplikasi ini menggunakan:

- Laravel 13
- PHP 8.4
- Filament 5
- Livewire 4
- Tailwind CSS 4
- MySQL
- Redis untuk cache saat menggunakan Docker
- FrankenPHP untuk menjalankan aplikasi di Docker
- Bun dan Vite untuk build frontend

## Menjalankan Secara Lokal

Pastikan komputer sudah memiliki PHP, Composer, Bun, dan MySQL.

1. Salin file environment:

```bash
cp .env.example .env
```

2. Install dependency backend:

```bash
composer install
```

3. Install dependency frontend:

```bash
bun install
```

4. Buat application key:

```bash
php artisan key:generate
```

5. Atur database di file `.env`, lalu jalankan migrasi dan data contoh:

```bash
php artisan migrate --seed
```

6. Build asset frontend:

```bash
bun run build
```

7. Jalankan aplikasi:

```bash
php artisan serve
```

Setelah itu aplikasi bisa dibuka di `http://localhost:8000`.

## Akun Contoh

Jika menjalankan `php artisan migrate --seed`, aplikasi akan membuat akun contoh:

| Peran | Email | Password |
| --- | --- | --- |
| Admin/Guru | `admin@sekolah.test` | `password` |
| Kasir Murid | `kasir@sekolah.test` | `password` |

Ganti password akun tersebut sebelum dipakai untuk operasional sungguhan.

## Menjalankan Dengan Docker dan FrankenPHP

Project ini sudah dilengkapi Docker Compose untuk menjalankan aplikasi bersama MySQL dan Redis.

1. Salin file environment:

```bash
cp .env.example .env
```

2. Isi `APP_KEY` di `.env`. Cara termudah:

```bash
php artisan key:generate --show
```

Salin hasilnya ke bagian `APP_KEY=` di file `.env`.

3. Jalankan Docker:

```bash
docker compose up --build
```

4. Jika ingin mengisi data contoh, jalankan:

```bash
docker compose exec frankenphp php artisan db:seed
```

Aplikasi akan tersedia di `http://localhost:8000`.

Catatan: saat container dijalankan, migration akan berjalan otomatis. Jika tidak ingin migration otomatis, isi `RUN_MIGRATIONS=false` di file `.env`.

## Perintah Pengembangan

Beberapa perintah yang sering dipakai:

```bash
php artisan test --compact
vendor/bin/pint --dirty --format agent
bun run build
```

Untuk mode pengembangan dengan Vite:

```bash
bun run dev
```

## CI

Project ini memiliki GitHub Actions di `.github/workflows/ci.yml`. Setiap push atau pull request ke branch utama akan menjalankan:

- Install dependency PHP.
- Install dependency frontend.
- Cek format kode dengan Laravel Pint.
- Jalankan PHPUnit.
- Build asset frontend.

## Catatan Operasional

Sebelum dipakai di toko sungguhan, pastikan:

- Data produk, layanan, dan harga sudah sesuai.
- Stok awal sudah diisi dengan benar.
- Akun admin dan kasir sudah dibuat sesuai petugas.
- Password akun contoh sudah diganti.
- Laporan harian dicek rutin oleh admin/guru.
- Backup database disiapkan jika aplikasi dipakai untuk operasional harian.

## Lisensi

Project ini dibuat untuk kebutuhan aplikasi kasir toko fotocopy sekolah. Penggunaan dan pengembangan lebih lanjut dapat disesuaikan dengan kebutuhan sekolah atau organisasi.
