# aliziodev/laravel-wilayah

[![Latest Version](https://img.shields.io/packagist/v/aliziodev/laravel-wilayah)](https://packagist.org/packages/aliziodev/laravel-wilayah)
[![Tests](https://github.com/aliziodev/laravel-wilayah/actions/workflows/tests.yml/badge.svg)](https://github.com/aliziodev/laravel-wilayah/actions/workflows/tests.yml)
[![Data Sync](https://github.com/aliziodev/laravel-wilayah/actions/workflows/sync-upstream.yml/badge.svg)](https://github.com/aliziodev/laravel-wilayah/actions/workflows/sync-upstream.yml)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11%20%7C%2012%20%7C%2013-orange)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Data wilayah administratif Indonesia (Provinsi → Kabupaten/Kota → Kecamatan → Desa/Kelurahan) untuk Laravel — selalu *up-to-date* via CI/CD otomatis dari upstream [`cahyadsn/wilayah`](https://github.com/cahyadsn/wilayah) dan [`cahyadsn/wilayah_kodepos`](https://github.com/cahyadsn/wilayah_kodepos).

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Persyaratan](#persyaratan)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
  - [Pencarian Wilayah](#pencarian-wilayah)
  - [Pencarian Kode Pos](#pencarian-kode-pos)
  - [Hierarki & Alamat](#hierarki--alamat)
  - [Dropdown & Select](#dropdown--select)
  - [Paginasi](#paginasi)
  - [Model & Relasi](#model--relasi)
- [Fitur Opsional](#fitur-opsional)
- [Artisan Commands](#artisan-commands)
- [Update Data](#update-data)
- [Package Tambahan](#package-tambahan)
- [Testing](#testing)

---

## Fitur

| Fitur | Keterangan |
|-------|------------|
| 🗺 **4 Level Wilayah** | Provinsi, Kabupaten/Kota, Kecamatan, Desa/Kelurahan |
| 📮 **Kode Pos** | Terintegrasi dari `cahyadsn/wilayah_kodepos` |
| ⚡ **Cache Otomatis** | TTL per tipe query, driver configurable |
| 🔍 **Pencarian** | LIKE search, Full-text (MySQL/PostgreSQL), alamat lengkap, kode pos |
| 🌳 **Hierarki** | `toAddress()`, `toShortAddress()`, `ancestors()` |
| 📋 **Dropdown/Select** | Format cascade select & Livewire-ready |
| 📄 **Paginasi** | `paginate()`, `simplePaginate()`, `cursorPaginate()` |
| 🏝 **Data Opsional** | Islands, Luas Wilayah, Populasi (toggle via config) |
| 🔄 **Auto-Sync CI/CD** | Data dan metadata rilis diperbarui otomatis saat upstream update |
| 🐘 **MySQL & PostgreSQL** | Dukungan penuh kedua database |

---

## Persyaratan

- PHP **^8.2**
- Laravel **11.x / 12.x / 13.x**
- MySQL 8.0+ atau PostgreSQL 15+

---

## Instalasi

```bash
composer require aliziodev/laravel-wilayah
```

### Instalasi Cepat (Otomatis)

```bash
php artisan wilayah:install
```

Perintah ini akan otomatis: publish config, publish migrasi, jalankan migrate, dan seed data.

### Instalasi Manual

```bash
php artisan vendor:publish --tag=wilayah-config
php artisan vendor:publish --tag=wilayah-migrations
php artisan migrate
php artisan wilayah:seed
```

---

## Konfigurasi

File konfigurasi ada di `config/wilayah.php`:

```php
return [
    // Model (bisa di-override dengan model kustom)
    'models' => [
        'province' => \Aliziodev\Wilayah\Models\Province::class,
        'regency'  => \Aliziodev\Wilayah\Models\Regency::class,
        'district' => \Aliziodev\Wilayah\Models\District::class,
        'village'  => \Aliziodev\Wilayah\Models\Village::class,
    ],

    // Fitur opsional (Island, Area, Population)
    'features' => [
        'islands'     => false,  // Aktifkan data pulau
        'areas'       => false,  // Aktifkan data luas wilayah
        'populations' => false,  // Aktifkan data penduduk
    ],

    // Cache
    'cache' => [
        'enabled' => true,
        'driver'  => env('WILAYAH_CACHE_DRIVER', 'default'),
        'ttl'     => [
            'provinces' => 86400,   // 24 jam
            'regencies' => 86400,
            'districts' => 3600,    // 1 jam
            'villages'  => 3600,
        ],
    ],

    // Tabel (bisa di-override)
    'tables' => [
        'provinces' => 'provinces',
        'regencies' => 'regencies',
        'districts' => 'districts',
        'villages'  => 'villages',
    ],
];
```

---

## Penggunaan

Semua fitur tersedia via Facade:

```php
use Aliziodev\Wilayah\Facades\Wilayah;
```

### Pencarian Wilayah

```php
// Ambil semua — mengembalikan Query Builder
Wilayah::provinces()->get();
Wilayah::regencies()->get();
Wilayah::districts()->get();
Wilayah::villages()->get();

// Filter berdasarkan induk
Wilayah::regencies('32')->get();              // Kab/Kota di Jawa Barat
Wilayah::districts('32.73')->get();           // Kecamatan di Kota Bandung
Wilayah::villages('32.73.07')->get();         // Desa di Kec. Cicendo

// Cari berdasarkan nama (semua level sekaligus)
$result = Wilayah::search('Bandung');
// Returns: ['provinces' => [...], 'regencies' => [...], 'districts' => [...], 'villages' => [...]]

// Cari spesifik level
Wilayah::provinces()->where('name', 'like', '%barat%')->get();

// Cari dengan prefix kode
Wilayah::findByCodePrefix('32.73')->get();   // Semua kecamatan di Kota Bandung

// Full-text search (butuh FULLTEXT/tsvector index di database)
Wilayah::fullTextSearch('Sunter')->paginate(15);

// Pencarian alamat lengkap (multiple keyword)
$result = Wilayah::searchAddress('Coblong Bandung Jawa Barat');
// Returns: ['province' => ..., 'regency' => ..., 'district' => ..., 'villages' => [...], 'confidence' => 0.92]
```

### Pencarian Kode Pos

```php
// Exact match
Wilayah::postalCode('40172')->get();

// Wildcard (semua kode pos berawalan 401)
Wilayah::postalCode('401*')->get();

// Dengan relasi hierarki (Province, Regency, District, Village sekaligus)
$villages = Wilayah::searchByPostalCode('40172');
foreach ($villages as $v) {
    echo $v->district->name;   // Cicendo
    echo $v->regency->name;    // Kota Bandung
    echo $v->province->name;   // Jawa Barat
}
```

### Hierarki & Alamat

```php
// Muat hierarki dari kode apapun (desa, kecamatan, kab/kota, provinsi)
$h = Wilayah::hierarchy('32.73.07.1001');

// Akses tiap level
$h->village->name;    // ARJUNA
$h->district->name;   // CICENDO
$h->regency->name;    // KOTA BANDUNG
$h->province->name;   // JAWA BARAT

// Format alamat
$h->toAddress();
// → "Kel. Arjuna, Kec. Cicendo, Kota Bandung, Jawa Barat 40172"

$h->toShortAddress();
// → "Cicendo, Kota Bandung, Jawa Barat"

// Semua level leluhur sebagai Collection
$h->ancestors();
// → Collection [District, Regency, Province]

// Dari kode kecamatan
$h = Wilayah::hierarchy('32.73.07');
$h->province->name;  // JAWA BARAT
$h->village;         // null (tidak ada jika kode bukan desa)
```

### Dropdown & Select

```php
// Format [code => name] — cocok untuk HTML <select>
Wilayah::forDropdown('provinces');
// → ['11' => 'ACEH', '12' => 'SUMATERA UTARA', ...]

Wilayah::forDropdown('regencies', province: '32');
// → ['32.01' => 'KAB. BOGOR', '32.73' => 'KOTA BANDUNG', ...]

Wilayah::forDropdown('districts', regency: '32.73');
// → ['32.73.01' => 'ANDIR', '32.73.07' => 'CICENDO', ...]

Wilayah::forDropdown('villages', district: '32.73.07');

// Format [{value, label}] — cocok untuk Livewire, Alpine.js, Vue, React
Wilayah::forSelect('provinces');
// → [['value' => '32', 'label' => 'JAWA BARAT'], ...]

Wilayah::forSelect('regencies', province: '32');
```

### Paginasi

```php
// Lengkap dengan link
Wilayah::villages('32.73.07')->paginate(20);

// Sederhana (prev/next only — lebih cepat)
Wilayah::villages('32.73.07')->simplePaginate(20);

// Cursor pagination (untuk infinite scroll)
Wilayah::villages('32.73.07')->cursorPaginate(20);

// Search + paginate
Wilayah::search('Bandung')['regencies']->paginate(15);
```

### Model & Relasi

```php
use Aliziodev\Wilayah\Models\Province;
use Aliziodev\Wilayah\Models\Regency;
use Aliziodev\Wilayah\Models\Village;

// Eager loading
Province::with('regencies.districts.villages')->find('32');

// Relasi balik
Village::where('code', '32.73.07.1001')->with('district.regency.province')->first();

// Scope bawaan
Provincial::withCode('32')->first();
Regency::inProvince('32')->get();
District::inRegency('32.73')->get();
Village::withPostalCode('40172')->get();
```

---

## Fitur Opsional

Aktifkan fitur opsional di `config/wilayah.php`:

```php
'features' => [
    'islands'     => true,   // Data pulau (38.000+ pulau)
    'areas'       => true,   // Luas wilayah per level
    'populations' => true,   // Data jumlah penduduk
],
```

Lalu jalankan seed:

```bash
php artisan wilayah:seed --with=islands
php artisan wilayah:seed --with=areas
php artisan wilayah:seed --with=populations

# Atau semua sekaligus
php artisan wilayah:seed --with=islands --with=areas --with=populations
```

Contoh penggunaan setelah aktif:

```php
// Luas wilayah
$province = Province::find('32');
$province->area?->area_km2;     // 35.377,76 km²

// Jumlah penduduk
$province->population?->total;  // 48.782.382
```

---

## Artisan Commands

| Command | Keterangan |
|---------|------------|
| `wilayah:install` | Install otomatis (publish → migrate → seed) |
| `wilayah:seed` | Seed semua data ke database |
| `wilayah:seed --fresh` | Truncate lalu seed ulang |
| `wilayah:seed --province=32` | Seed hanya satu provinsi (Jawa Barat) |
| `wilayah:seed --with=islands` | Seed data pulau (fitur opsional) |
| `wilayah:sync` | Sinkronisasi data dengan file terbaru (safe: upsert) |
| `wilayah:sync --dry-run` | Preview perubahan tanpa menerapkan |
| `wilayah:sync --province=32` | Sync satu provinsi saja |
| `wilayah:version` | Cek versi data & hash upstream |
| `wilayah:cache-clear` | Hapus semua cache wilayah |

---

## Update Data

Data upstream diperbarui otomatis oleh GitHub Actions setiap hari pukul `02:00 UTC`. Workflow ini:

- memeriksa hash upstream dari `cahyadsn/wilayah` dan `cahyadsn/wilayah_kodepos`
- menjalankan `normalize.php` untuk memperbarui file di `data/`
- menaikkan patch version di `composer.json`
- membuat commit dan GitHub Release baru jika ada perubahan

Ketika ada rilis baru, cukup jalankan:

```bash
# 1. Update package
composer update aliziodev/laravel-wilayah

# 2. Preview dulu (opsional — untuk melihat perubahan)
php artisan wilayah:sync --dry-run

# 3. Terapkan
php artisan wilayah:sync
```

> **Aman digunakan di production** — Semua update menggunakan strategi `UPSERT`:
> - Data yang sudah ada **tidak akan dihapus**
> - Hanya row baru yang di-insert dan nama yang berubah di-update
> - Foreign key di tabel Anda tetap aman

### Skema Update di CI/CD Internal

```
Upstream update wilayah / kodepos
→ GitHub Actions cek fingerprint upstream
→ normalize.php download & parse SQL
→ generate file data/* + version metadata
→ auto bump patch version
→ commit ke branch utama
→ GitHub Release baru
→ Packagist dapat mengambil versi terbaru
```

### Catatan untuk Maintainer

- Workflow `sync-upstream.yml` menggunakan `GITHUB_TOKEN` bawaan GitHub Actions. Secret `PAT_TOKEN` tidak diperlukan untuk konfigurasi default repo ini.
- Jika branch utama memakai branch protection yang memblokir push dari GitHub Actions, step `git push` akan gagal sampai aturan repo mengizinkannya.
- Workflow ini belum mengelola `CHANGELOG.md` secara otomatis. Release dibuat dengan body markdown statis, bukan auto-changelog penuh.

---

## API Dropdown Controller (Siap Pakai)

Package ini menyediakan `WilayahController` yang mempermudah Anda membuat API untuk *nested dropdown* (Provinsi -> Kota/Kab -> Kecamatan -> Kel/Desa) di frontend seperti Vue, React, Livewire, atau sekadar jQuery Ajax. Outputnya sudah terformat dalam standar `[{ value: "id", label: "nama" }]`.

### 1. Daftarkan Route
Tambahkan definisi route ke dalam file `routes/api.php` di project Anda:

```php
use Aliziodev\Wilayah\Http\Controllers\WilayahController;

Route::prefix('wilayah')->group(function () {
    Route::get('provinces', [WilayahController::class, 'provinces']);
    Route::get('regencies', [WilayahController::class, 'regencies']);
    Route::get('districts', [WilayahController::class, 'districts']);
    Route::get('villages',  [WilayahController::class, 'villages']);
});
```

### 2. Implementasi Frontend (Contoh: Axios + Vanilla JS)
Berikut adalah contoh skrip sederhana menggunakan Axios dan Vanilla Javascript murni untuk menangani *nested* select-box:

```html
<select id="provinsi"><option value="">Pilih Provinsi</option></select>
<select id="kota" disabled><option value="">Pilih Kota/Kab</option></select>
<select id="kecamatan" disabled><option value="">Pilih Kecamatan</option></select>
<select id="desa" disabled><option value="">Pilih Desa</option></select>

<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const elProvinsi = document.getElementById('provinsi');
    const elKota = document.getElementById('kota');
    const elKecamatan = document.getElementById('kecamatan');
    const elDesa = document.getElementById('desa');

    const fillSelect = (el, data) => {
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            el.appendChild(option);
        });
    };

    // 1. Load Provinsi
    axios.get('/api/wilayah/provinces').then(res => fillSelect(elProvinsi, res.data));

    // 2. Load Kota/Kab
    elProvinsi.addEventListener('change', function() {
        const provId = this.value;
        elKota.innerHTML = '<option value="">Pilih Kota/Kab</option>';
        elKota.disabled = !provId;
        elKecamatan.innerHTML = '<option value="">...</option>'; elKecamatan.disabled = true;
        elDesa.innerHTML = '<option value="">...</option>'; elDesa.disabled = true;
        
        if (provId) {
            axios.get(`/api/wilayah/regencies?province=${provId}`)
                 .then(res => fillSelect(elKota, res.data));
        }
    });

    // 3. Load Kecamatan
    elKota.addEventListener('change', function() {
        const kotaId = this.value;
        elKecamatan.innerHTML = '<option value="">Pilih Kecamatan</option>';
        elKecamatan.disabled = !kotaId;
        elDesa.innerHTML = '<option value="">...</option>'; elDesa.disabled = true;
        
        if (kotaId) {
            axios.get(`/api/wilayah/districts?regency=${kotaId}`)
                 .then(res => fillSelect(elKecamatan, res.data));
        }
    });

    // 4. Load Desa/Kelurahan
    elKecamatan.addEventListener('change', function() {
        const kecId = this.value;
        elDesa.innerHTML = '<option value="">Pilih Desa</option>';
        elDesa.disabled = !kecId;
        
        if (kecId) {
            axios.get(`/api/wilayah/villages?district=${kecId}`)
                 .then(res => fillSelect(elDesa, res.data));
        }
    });
});
</script>
```

---

## Package Tambahan

### 🗺 Batas Wilayah (Polygon / GeoJSON)

```bash
composer require aliziodev/laravel-wilayah-boundaries
php artisan vendor:publish --tag=wilayah-boundaries-migrations
php artisan migrate
php artisan boundaries:seed
```

```php
use Aliziodev\WilayahBoundaries\Facades\Boundary;
use Aliziodev\Wilayah\Models\Province;

// 1. Menggunakan Facade
$geojson = Boundary::forCode('32')->toGeoJson();
$collection = Boundary::collection(level: 1); // FeatureCollection

// 2. Mengambil Wilayah beserta Boundary & Logo (BEST PRACTICE)
// ✅ Gunakan eager loading (with) untuk mencegah N+1 query problem
$province = Province::with('boundary')->find('32');

if ($province) {
    echo $province->name;                           // JAWA BARAT
    $logoUrl = $province->logoUrl();                // https://.../32.png
    $geojson = $province->boundary?->toGeoJson();   // Array GeoJSON (Polygon/MultiPolygon)
    $centroid = $province->boundary?->centroid();   // [lat, lng]
}
```

### 🖼 Logo / Lambang Daerah

```bash
composer require aliziodev/laravel-wilayah-logos
php artisan logos:publish
```

```php
use Aliziodev\Wilayah\Models\Regency;

// Ambil semua kabupaten di suatu provinsi lengkap dengan logonya
$regencies = Regency::where('province_id', 32)->get();

$data = $regencies->map(function ($regency) {
    return [
        'code' => $regency->code,
        'name' => $regency->name,
        // Macro logoUrl() dipanggil secara lazy, tidak menambah query DB
        'logo' => $regency->logoUrl(),
        'logo_thumb' => $regency->logoUrl('thumb'),
    ];
});
```

Di Blade:

```blade
<img src="{{ $province->logoUrl() }}" alt="{{ $province->name }}" width="80">
<img src="{{ $province->logoUrl('thumb') }}" alt="{{ $province->name }}" width="32">
```

---

## Testing

```bash
composer install
vendor/bin/pest
```

Untuk menjalankan test suite per fitur:

```bash
vendor/bin/pest --group=feature
vendor/bin/pest tests/Feature/SearchTest.php
vendor/bin/pest tests/Feature/HierarchyTest.php
vendor/bin/pest tests/Feature/DropdownTest.php
```

---

## Kontribusi

Pull request sangat diterima! Silakan buka issue terlebih dahulu untuk mendiskusikan perubahan yang ingin Anda buat.

---

## Lisensi

MIT © [Aliziodev](https://github.com/aliziodev)

---

## Kredit Data

Data wilayah bersumber dari:
- 🏛 [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) — Data 4 level wilayah administratif Indonesia
- 📮 [cahyadsn/wilayah_kodepos](https://github.com/cahyadsn/wilayah_kodepos) — Data kode pos
