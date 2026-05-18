# 🇮🇩 Indonesia Location for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/edi-prasetyo/indonesia-location.svg)](https://packagist.org/packages/edi-prasetyo/indonesia-location)
[![Total Downloads](https://img.shields.io/packagist/dt/edi-prasetyo/indonesia-location.svg)](https://packagist.org/packages/edi-prasetyo/indonesia-location)
[![License](https://img.shields.io/packagist/l/edi-prasetyo/indonesia-location.svg)](https://packagist.org/packages/edi-prasetyo/indonesia-location)
[![PHP Version Require](https://img.shields.io/packagist/php-v/edi-prasetyo/indonesia-location)](https://packagist.org/packages/edi-prasetyo/indonesia-location)
[![Laravel](https://img.shields.io/badge/Laravel-11%2B-red)](https://laravel.com)
[![Composer](https://img.shields.io/badge/Composer-required-885630)](https://getcomposer.org/)
[![Stability](https://img.shields.io/badge/stability-stable-green)](https://packagist.org/packages/edi-prasetyo/indonesia-location)
[![GitHub stars](https://img.shields.io/github/stars/edi-prasetyo/indonesia-location?style=social)](https://github.com/edi-prasetyo/indonesia-location)



**edi-prasetyo/indonesia-location** adalah package Laravel untuk menyediakan data wilayah administratif Indonesia (Provinsi, Kabupaten/Kota, Kecamatan, Desa) lengkap dengan **relasi database** dan **model Eloquent**.

Package ini dirancang untuk:

* Laravel **11 ke atas**
* Import data wilayah Indonesia dari file JSON
* Relasi internal berbasis `id` (bukan hanya kode)
* Siap dipakai langsung oleh developer

---

## ✨ Fitur

* ✅ Data lengkap: **Provinsi, Kabupaten/Kota, Kecamatan, Desa**
* ✅ Relasi internal (`province_id`, `regency_id`, `district_id`)
* ✅ Tetap menyimpan `code` resmi wilayah Indonesia
* ✅ Eloquent Model siap pakai
* ✅ Artisan command untuk install & import data
* ✅ Bisa digunakan untuk Web & Mobile API

---

## 📦 Instalasi

Install package via Composer:

```bash
composer require edi-prasetyo/indonesia-location
```

Package ini mendukung **auto-discovery**, tidak perlu menambahkan Service Provider secara manual.

### 1️⃣ Publish file migration

```bash
php artisan vendor:publish --tag=indonesia-location-migrations
```

### 2️⃣ Jalankan migration

```bash
php artisan migrate
```

---

## 🚀 Import Data Wilayah Indonesia

Jalankan command berikut:

```bash
php artisan indonesia-location:install
```

---

## Struktur Database

### provinces

| column        | type        |
| ------------- | ----------- |
| id            | bigint      |
| code          | string      |
| name          | string      |
| latitude      | decimal     |
| longitude     | decimal     |

### regencies

| column        | type        |
| ------------- | ----------- |
| id            | bigint      |
| province_id   | bigint (FK) |
| code          | string      |
| province_code | string      |
| name          | string      |
| latitude      | decimal     |
| longitude     | decimal     |

### districts

| column        | type        |
| ------------- | ----------- |
| id            | bigint      |
| province_id   | bigint (FK) |
| regency_id    | bigint (FK) |
| code          | string      |
| province_code | string      |
| regency_code  | string      |
| name          | string      |
| latitude      | decimal     |
| longitude     | decimal     |

### villages

| column        | type        |
| ------------- | ----------- |
| id            | bigint      |
| province_id   | bigint (FK) |
| regency_id    | bigint (FK) |
| district_id   | bigint (FK) |
| code          | string      |
| province_code | string      |
| regency_code  | string      |
| district_code | string      |
| name          | string      |
| postal_code   | string      |
| latitude      | decimal     |
| longitude     | decimal     |

---

## 📘 Penggunaan Model

* use EdiPrasetyo\IndonesiaLocation\Models\Province;
* use EdiPrasetyo\IndonesiaLocation\Models\Regency;
* use EdiPrasetyo\IndonesiaLocation\Models\District;
* use EdiPrasetyo\IndonesiaLocation\Models\Village;

### Ambil semua provinsi

```php
use EdiPrasetyo\IndonesiaLocation\Models\Province;

$provinces = Province::all();
```

### Dengan relasi

```php
$provinces = Province::with('regencies.districts.villages')->get();
```

### Contoh pencarian

```php
$aceh = Province::where('code', '11')->first();

$kabupaten = $aceh->regencies;
```

---

## 🔗 Relasi Eloquent

* Province → hasMany → Regencies
* Regency → hasMany → Districts
* District → hasMany → Villages

Semua relasi menggunakan **foreign key berbasis ID** untuk performa optimal.

---

## ⚙️ Kebutuhan Sistem

* PHP **8.2+**
* Laravel **11 atau lebih baru**
* Database MySQL / PostgreSQL

---

## 📄 Lisensi

Package ini dilisensikan di bawah **MIT License**.

---

## 👨‍💻 Author

**Edi Prasetyo**
GitHub: [https://github.com/edi-prasetyo](https://github.com/edi-prasetyo)

---

## 🤝 Kontribusi

Pull request & issue sangat diterima.
Silakan fork repository ini dan ajukan perubahan.

---

## ⭐ Penutup

Jika package ini membantu, jangan lupa beri ⭐ di GitHub 🙌

Happy coding 🚀
