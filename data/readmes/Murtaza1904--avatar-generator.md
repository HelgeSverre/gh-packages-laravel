---

# Laravel Avatar Generator

A simple and customizable avatar generator for Laravel applications.
Generate **PNG** or **SVG** avatars with initials, dynamic colors, and flexible configuration.

---

## 📦 Installation

```bash
composer require murtaza1904/avatar-generator
```

---

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=avatar-config
```

This will create `config/avatar.php`:

```php
return [
    'width' => 128,
    'color' => '#ffffff',
    'format' => 'png',
    'storage' => storage_path('app/public/avatars'),
    'filename_pattern' => '{name}-{timestamp}.{ext}',
    'palette' => [
        '#1abc9c','#2ecc71','#3498db','#9b59b6','#34495e',
        '#16a085','#27ae60','#2980b9','#8e44ad','#2c3e50',
        '#f39c12','#d35400','#c0392b','#7f8c8d','#e67e22',
    ],
];
```

---

## 🚀 Usage

### Generate & Save Avatar

```php
use murtaza1904\AvatarGenerator\Facades\Avatar;

// Save avatar to default storage (config/avatar.php → storage)
$filename = Avatar::create('John Doe')
    ->size(128)
    ->background('#3498db')
    ->color('#ffffff')
    ->format('png')
    ->save();

echo $filename; // john-doe-1695382930.png
```

### Save Avatar to Custom Directory

```php
$filename = Avatar::create('Jane Smith')
    ->filename('custom-avatar.png')
    ->path(storage_path('app/public/avatars'));
```

### Get Raw SVG/PNG

```php
$svg = Avatar::create('Ali Khan')
    ->format('svg')
    ->render();

echo $svg; // outputs SVG XML string
```

---

## 🎨 Features

* Generate avatars from initials (supports multi-word names).
* PNG and SVG output.
* Customizable size, colors, format, and filename.
* Configurable color palette.
* Laravel Facade with IDE autocompletion.
* Zero dependencies beyond Laravel & GD extension.

---

## 🛠️ Requirements

* PHP 8.1+
* Laravel 10+
* GD extension (for PNG support)

---

## 📄 License

MIT © [Murtaza1904](https://github.com/murtaza1904)

---