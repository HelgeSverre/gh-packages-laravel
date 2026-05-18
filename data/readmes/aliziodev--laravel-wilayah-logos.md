# aliziodev/laravel-wilayah-logos

Addon **asset logo/lambang daerah** Indonesia (Provinsi dan Kab/Kota) untuk package [`aliziodev/laravel-wilayah`](https://github.com/aliziodev/laravel-wilayah).

Dataset logo tidak lagi disimpan sebagai ribuan file PNG di source repo. Package ini memakai manifest ringan di repo dan archive logo (`zip`) yang diunduh saat diperlukan.

## Requirements

```bash
composer require aliziodev/laravel-wilayah-logos
```

## Setup

```bash
php artisan logos:publish
```

Asset akan tersedia di `public/vendor/wilayah/logos/`.

## Penggunaan

```php
// Setelah install, Province dan Regency auto dapat method logoUrl() dan logoPath()

$province = Province::where('code', '32')->first();

// URL logo untuk <img> tag
echo $province->logoUrl();        // PNG 1200px
echo $province->logoUrl('thumb'); // PNG 100px (thumbnail)

// Path absolut (untuk server-side usage)
echo $province->logoPath();
echo $province->logoPath('thumb');

// Contoh: Kab/Kota
$regency = Regency::where('code', '32.73')->first();
echo $regency->logoUrl();         // Logo Kota Bandung
```

```html
<!-- Dalam Blade -->
<img src="{{ $province->logoUrl('thumb') }}" alt="{{ $province->name }}" width="100">
```

## Struktur Asset

```
public/vendor/wilayah/logos/
├── prov/
│   ├── img/     ← PNG 1200px (32.png, 11.png, ...)
│   └── thumbs/  ← PNG 100px
└── kab/
    ├── 32/
    │   ├── img/     ← PNG 1200px (32.01.png, 32.73.png, ...)
    │   └── thumbs/
    └── ...
```

## Cara Kerja Asset

- Repo package hanya menyimpan metadata kecil di `assets/version.php`
- GitHub Actions membangun archive logo sebagai release asset `.zip`
- Saat `logos:publish` dijalankan, package akan memakai archive lokal yang ada atau mengunduh release asset yang sesuai
- Archive diekstrak ke storage lalu dipublish ke `public/vendor/wilayah/logos`

## License

MIT © [Aliziodev](https://github.com/aliziodev)
