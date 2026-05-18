# Laravel QR Decoder

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mapo-89/laravel-qr-decoder.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-qr-decoder)
[![Total Downloads](https://img.shields.io/packagist/dt/mapo-89/laravel-qr-decoder.svg?style=flat-square)](https://packagist.org/packages/mapo-89/laravel-qr-decoder)
![GitHub Actions](https://github.com/mapo-89/laravel-qr-decoder/actions/workflows/main.yml/badge.svg)

A cross‑platform Laravel package for decoding QR codes from PNG images using Python (`zxing-cpp`).

This package wraps a Python decoder inside a virtual environment and exposes a clean Laravel API. It works on **Windows and Linux** using OS‑specific wrapper scripts.

---

## Features

* ✅ Cross‑platform (Windows & Linux)
* ✅ Python isolated via `venv`
* ✅ No global Python dependencies
* ✅ Secure execution via Symfony Process
* ✅ Works with logos / low‑contrast QR codes

---

## Requirements

* PHP >= 8.2
* Laravel >= 11
* Python >= 3.13

---

## Installation

### Install the package (local / path repository)

```json
// composer.json
{
  "repositories": [
    {
      "type": "path",
      "url": "packages/laravel-qr-decoder"
    }
  ]
}
```

```bash
composer require mapo-89/laravel-qr-decoder
```

---

### Publish config

```bash
php artisan vendor:publish --tag=config
```

---

### Configure Python path

Edit `config/qr-decoder.php`:

```bash
return [
    'python_path' => base_path('python/qr-decoder'),
    'timeout' => 10,
];
```

### Run the installer (recommended)

```bash
php artisan qr-decoder:install
```
This command will:
- Create a Python virtual environment in the configured path
- Install all required Python dependencies
- Work on Windows and Linux

## Usage

This package does not provide controllers or views.
It exposes a single service (`QrDecoder`) that can be used inside your application’s controllers, APIs, jobs or commands.

### Example Use Cases

1. **Decode an already uploaded file on button click:**

```php
use Mapo89\QrDecoder\QrDecoder;

$result = app(QrDecoder::class)->decode(
    storage_path('app/qr_uploaded_file.png')
);
```

2. **Upload a file and decode immediately:**

```php
public function uploadAndDecode(Request $request, QrDecoder $decoder)
{
    $request->validate([
        'qrpng' => ['required', 'file', 'mimes:png', 'max:5120'],
    ]);

    // Store temporarily
    $path = $request->file('qrpng')->store('qr-decoder');
    $fullPath = storage_path('app/private/' . $path);

    try {
        $result = $decoder->decode($fullPath);
    } catch (\Throwable $e) {
        $result = null;
        // Handle error if needed
    } finally {
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }

    return response()->json(['result' => $result]);
}
```

> Note: The controller should live in your application, not in this package.
> If you need a UI, build it in your application or in a separate package that depends on this one.

### Dependency Injection

```php
public function decode(QrDecoder $decoder)
{
    return $decoder->decode($path);
}
```

## Configuration

```php
return [
    'python_path' => base_path('python/qr-decoder'),
    'timeout' => 10,
];
```

---

## Directory Structure

```
laravel-qr-decoder/
├── src/
│   ├── QrDecoder.php
│   ├── QrDecoderFacade.php
│   └── QrDecoderServiceProvider.php
│
├── python/
│   ├── decode_qr.py
│   ├── requirements.txt
│   ├── run_qr_decoder
│   ├── run_qr_decoder.bat
│   └── venv/
│
├── config/
│   └── qr-decoder.php
│
├── composer.json
└── README.md
```

### Testing

```bash
composer test
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email info@postler.de instead of using the issue tracker.

## Credits

-   [Manuel Postler](https://github.com/mapo-89)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Laravel Package Boilerplate

This package was generated using the [Laravel Package Boilerplate](https://laravelpackageboilerplate.com).
