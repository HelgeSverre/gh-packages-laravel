# Laravel Indonesian Banks

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fadhila36/laravel-indonesian-banks.svg?style=flat-square)](https://packagist.org/packages/fadhila36/laravel-indonesian-banks)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fadhila36/laravel-indonesian-banks/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fadhila36/laravel-indonesian-banks/actions)
[![Total Downloads](https://img.shields.io/packagist/dt/fadhila36/laravel-indonesian-banks.svg?style=flat-square)](https://packagist.org/packages/fadhila36/laravel-indonesian-banks)
[![License](https://img.shields.io/packagist/l/fadhila36/laravel-indonesian-banks.svg?style=flat-square)](https://packagist.org/packages/fadhila36/laravel-indonesian-banks)

[🇮🇩 Bahasa Indonesia](README.md) | [🇺🇸 English](README.en.md)

**Laravel Indonesian Banks** adalah package komprehensif yang menyediakan data lengkap bank-bank di Indonesia untuk aplikasi Laravel Anda (mendukung Laravel 10, 11, 12, dan 13). Package ini dirancang untuk kemudahan penggunaan, performa tinggi, dan fleksibilitas.

## Fitur Utama

-   📦 **Data Lengkap**: Berisi daftar bank di Indonesia beserta kode bank terbaru (Update April 2026).
-   🚀 **Ringan & Cepat**: Menggunakan file JSON teroptimasi sebagai sumber data default, tanpa membebani database.
-   🛠 **Fleksibel**: Menyediakan Facade dan Service untuk akses mudah.
-   💾 **Opsi Database**: Menyediakan migrasi dan model Eloquent jika Anda ingin menyimpan data di database sendiri.
-   🔍 **Pencarian Mudah**: Fitur pencarian bank berdasarkan nama atau kode.

## Instalasi

Anda dapat menginstal package ini melalui Composer:

```bash
composer require fadhila36/laravel-indonesian-banks
```

Package ini mendukung fitur *auto-discovery* Laravel, sehingga Service Provider dan Facade akan otomatis terdaftar.

## Konfigurasi

Jika Anda ingin mengubah konfigurasi default, Anda dapat mempublikasikan file konfigurasi package ini:

```bash
php artisan vendor:publish --tag="indonesian-banks-config"
```

File konfigurasi akan disalin ke `config/indonesian-banks.php`. Berikut adalah contoh konfigurasi dasar:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Bank Data Source
    |--------------------------------------------------------------------------
    |
    | Opsi ini mengontrol sumber data bank. Secara default (null), package ini
    | menggunakan file JSON internal. Ubah ke path file custom jika ingin
    | menggunakan data Anda sendiri.
    |
    */
    'file_path' => null,
];
```

## Penggunaan

Anda dapat menggunakan Facade `IndonesianBank` untuk mengakses data bank dengan mudah.

### 1. Mendapatkan Semua Bank

```php
use Fadhila36\IndonesianBanks\Facades\IndonesianBank;

$banks = IndonesianBank::getBanks();

foreach ($banks as $bank) {
    echo $bank->name . ' (' . $bank->code . ')';
}
```

### 2. Mencari Bank Berdasarkan Kode

```php
use Fadhila36\IndonesianBanks\Facades\IndonesianBank;

$bank = IndonesianBank::findBank('014'); // Mencari BCA

if ($bank) {
    echo "Bank Ditemukan: " . $bank->name;
}
```

### 3. Mencari Bank Berdasarkan Nama

```php
use Fadhila36\IndonesianBanks\Facades\IndonesianBank;

$results = IndonesianBank::searchBanks('Mandiri');

foreach ($results as $bank) {
    echo $bank->name . ' - ' . $bank->code;
}
```

### 4. Mengambil Bank Berdasarkan Kategori

Anda dapat memfilter bank berdasarkan kategori (misal: `Syariah`, `BUMN`, `Swasta`, `BPD`).

```php
use Fadhila36\IndonesianBanks\Facades\IndonesianBank;

// Ambil semua bank Syariah
$syariahBanks = IndonesianBank::getBanksByCategory('Syariah');

foreach ($syariahBanks as $bank) {
    echo $bank->name; // Output: BANK SYARIAH INDONESIA, dll.
}

// Ambil semua kategori yang tersedia
$categories = IndonesianBank::getBankCategories();
// Output: ['Swasta', 'BUMN', 'Syariah', 'BPD']
```

## Contoh Implementasi Lengkap

Berikut adalah contoh penggunaan dalam Controller Laravel untuk menampilkan daftar bank di dropdown form:

```php
namespace App\Http\Controllers;

use Fadhila36\IndonesianBanks\Facades\IndonesianBank;
use Illuminate\Http\Request;

class BankController extends Controller
{
    public function index()
    {
        // Ambil semua data bank
        $banks = IndonesianBank::getBanks();

        return view('banks.index', compact('banks'));
    }

    public function check(Request $request)
    {
        $code = $request->input('bank_code');
        $bank = IndonesianBank::findBank($code);

        if (!$bank) {
            return back()->with('error', 'Bank tidak ditemukan.');
        }

        return back()->with('success', "Bank valid: {$bank->name}");
    }
}
```

### Di View (Blade)

```html
<select name="bank_code" class="form-control">
    <option value="">Pilih Bank</option>
    @foreach($banks as $bank)
        <option value="{{ $bank->code }}">{{ $bank->name }}</option>
    @endforeach
</select>
```

## Opsi Database (Lanjutan)

Jika Anda lebih suka menyimpan data bank di tabel database Anda sendiri (misalnya untuk relasi foreign key), Anda dapat mempublikasikan migrasi:

```bash
php artisan vendor:publish --tag="indonesian-banks-migrations"
```
*(Catatan: Pastikan tag migration tersedia atau copy manual dari `src/database/migrations` jika belum di-expose di ServiceProvider)*

Kemudian jalankan migrate:

```bash
php artisan migrate
```

Anda kemudian dapat menggunakan model `Fadhila36\IndonesianBanks\Models\BankEloquent` untuk berinteraksi dengan tabel `banks`.

## Kontribusi

Kontribusi sangat diterima! Silakan buat Pull Request untuk perbaikan bug atau penambahan fitur.

1.  Fork repository ini.
2.  Buat branch fitur baru (`git checkout -b feature/AmazingFeature`).
3.  Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`).
4.  Push ke branch (`git push origin feature/AmazingFeature`).
5.  Buka Pull Request.

## Lisensi

Package ini adalah software open-source di bawah lisensi [MIT](https://opensource.org/licenses/MIT).

---

**Dibuat dengan ❤️ oleh [Muhammad Fadhila Abiyyu Faris](https://fadhilaabiyyu.my.id)**
