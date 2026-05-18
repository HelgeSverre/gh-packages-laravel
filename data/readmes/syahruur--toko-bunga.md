![Toko Bunga](./public/img/toko-bunga.png)
# Toko Bunga

<p align="center">
  <img src="https://img.shields.io/badge/Laravel-12.x-red?logo=laravel" />
  <img src="https://img.shields.io/badge/Livewire-3.x-blueviolet?logo=laravel" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
  <img src="https://img.shields.io/badge/Theme-Zinc%20%2B%20Pink-ff69b4" />
  <img src="https://img.shields.io/badge/Responsive-Yes-success" />
</p>

<p align="center">
  <a href="./LAPORAN-CRUD.md" style="text-decoration:none;">
    <img src="https://img.shields.io/badge/Lihat%20Laporan%20CRUD-blue?style=for-the-badge" alt="Lihat Laporan CRUD" />
  </a>
</p>

Aplikasi web toko bunga modern berbasis Laravel + Livewire dengan fitur lengkap, UI/UX dark zinc-pink, dan dashboard analitik. Mendukung peran admin & customer, serta sistem pembayaran COD.

---

## Fitur Utama

- **Laravel 10 + Livewire 3**: SPA-like, tanpa reload.
- **UI/UX Modern**: Tema zinc gelap & pink, responsif, mobile friendly.
- **Role**: Admin & Customer (otomatis saat register).
- **CRUD**: Produk, User, Order, Cart, dsb.
- **Upload Gambar**: Produk dengan preview.
- **Dashboard Analitik**: Chart.js (penjualan, pendapatan, status, produk terlaris, user baru, dsb).
- **Live Search & Pagination**: Semua tabel.
- **SweetAlert2**: Konfirmasi hapus (Alpine.js).
- **Livewire Alert**: Notifikasi aksi.
- **Validasi Bahasa Indonesia**: Termasuk mapping atribut.
- **Lacak Pesanan**: Tanpa login.
- **COD (Bayar di Tempat)**: Simulasi checkout.
- **Custom Error Page**: 404, 500, dsb.
- **Loading Overlay**: Global.
- **Stock & Status Order**: Otomatis update.
- **Middleware Admin**: Proteksi route.

---

## Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/syahruur/toko-bunga.git
   cd toko-bunga
   ```
2. **Install dependency**
   ```bash
   composer install
   npm install
   ```
3. **Copy & edit .env**
   ```bash
   cp .env.example .env
   # Edit DB, mail, dsb sesuai kebutuhan
   ```
4. **Generate key & migrate**
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```
5. **Build asset**
   ```bash
   npm run build
   # atau npm run dev untuk development
   ```
6. **Jalankan server**
   ```bash
   php artisan serve
   ```
7. **Akses**
   - Buka [http://localhost:8000](http://localhost:8000)

---

## Quick Setup (Windows/PowerShell)

Untuk setup & menjalankan project secara otomatis, gunakan script berikut:

```powershell
# Jalankan dari root project
.\setup-and-run.ps1
```

Script ini akan:
- Install Composer & NPM dependencies jika belum ada
- Copy .env jika belum ada
- Generate APP_KEY jika belum ada
- Jalankan migrate & seed jika database kosong
- Menjalankan `npm run dev` & `php artisan serve` secara paralel

Setelah script selesai, buka [http://localhost:8000](http://localhost:8000) di browser Anda.

---

## Stop Semua Proses (Windows/PowerShell)

Untuk menghentikan semua proses background (npm run dev & php artisan serve), jalankan:

```powershell
.\stop-all.ps1
```

Script ini akan otomatis menghentikan semua proses node (Vite) dan php (Artisan Serve) yang berjalan di background.

---

## Akun Demo

- **Admin**
  - Email: admin@tokobunga.test
  - Password: password
- **Customer**
- Email: customer@tokobunga.test
  - Password: password

---

## Struktur Folder Penting

- `app/Models/` — Model utama: User, Product, Order, Cart, dsb.
- `app/Livewire/` — Komponen Livewire (Admin, Customer, Dashboard, dsb).
- `resources/views/` — Blade view (dashboard, welcome, produk, dsb).
- `resources/js/` — JS utama: app.js, chart-dashboard.js.
- `public/img/` — Gambar statis (misal: flower-hero.jpg).
- `database/` — Seeder, factory, migration.

---

## Fitur Dashboard & Chart

- **Admin**
  - Penjualan & pendapatan bulanan (bar/line)
  - Produk terlaris (bar)
  - Status pesanan (pie)
  - User baru per bulan (line)
- **Customer**
  - Pengeluaran bulanan (line)
  - Status pesanan (pie)
- **Semua data chart**: Dinamis, diambil dari database, tanpa inline JS.

---

## Pengembangan

- **Livewire**: Komponen di `app/Livewire/`
- **Chart.js**: Data dikirim via data-chart attribute, render di `resources/js/chart-dashboard.js`
- **TailwindCSS**: Kustomisasi di `tailwind.config.js` (jika ada)
- **SweetAlert2**: Konfirmasi hapus via Alpine.js di Blade
- **Livewire Alert**: Notifikasi aksi

---

## Kontribusi

1. Fork & clone repo
2. Buat branch fitur/bugfix
3. Pull request ke `main`

---

## Lisensi

[MIT](./LICENSE)

---

## Kontak & Kredit

- Dev: [@syahruur](https://github.com/syahruur)
- UI/UX: Dark zinc + pink, full responsive
- Powered by Laravel, Livewire, Chart.js, SweetAlert2, TailwindCSS