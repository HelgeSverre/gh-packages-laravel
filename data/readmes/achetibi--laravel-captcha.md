# Laravel Captcha

[![Latest Version on Packagist](https://img.shields.io/packagist/v/achetibi/laravel-captcha.svg?style=flat-square)](https://packagist.org/packages/achetibi/laravel-captcha)
[![Total Downloads](https://img.shields.io/packagist/dt/achetibi/laravel-captcha.svg?style=flat-square)](https://packagist.org/packages/achetibi/laravel-captcha)
[![Tests](https://img.shields.io/github/actions/workflow/status/achetibi/laravel-captcha/tests.yml?label=tests)](https://github.com/achetibi/laravel-captcha/actions)
[![License](https://img.shields.io/github/license/achetibi/laravel-captcha)](LICENSE.md)

**Laravel Captcha** is a modern, lightweight, and extensible CAPTCHA package for Laravel.
It provides a flexible and developer-friendly way to generate and validate CAPTCHA images, with support for multiple drivers and configurations.

> ⚠️ This package is **based primarily on** the excellent [mews/captcha](https://github.com/mewebstudio/captcha) package, with a redesigned architecture, improved testability, and modern Laravel support.

---

## 🚀 Features

- Simple and flexible CAPTCHA generation
- Multiple configurations (`default`, `flat`, `mini`, `inverse`, `math`)
- Support for **GD** and **Imagick** drivers
- API-friendly responses (Base64 image output)
- Built-in validation (session & API modes)
- Fully configurable:
    - Length
    - Fonts
    - Colors
    - Backgrounds
    - Effects (blur, sharpen, contrast, etc.)
- Math CAPTCHA support
- Laravel-native integration:
    - Service Provider
    - Facade
    - Helper functions
- Fully tested using Pest

---

## 📦 Requirements

- PHP **>= 8.3**
- Laravel **12.x or 13.x**

> ❗ Other Laravel versions are **not supported**

---

## 📦 Installation

```bash
composer require achetibi/laravel-captcha
```

---

## ⚙️ Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --provider="LaravelCaptcha\CaptchaServiceProvider"
```
---

🧠 Basic Usage

Generate CAPTCHA (HTML response)

```php
captcha();
```

Generate CAPTCHA (API / Base64)

```php
captcha('default');
```

Get CAPTCHA image URL

```php
captcha_src();
```

Get CAPTCHA HTML image

```php
captcha_img('default', ['class' => 'captcha']);
```

Validate CAPTCHA (session-based)

```php
captcha_check($value);
```

Validate CAPTCHA (API-based)

```php
captcha_api_check($value, $key);
```

Check CAPTCHA status

```php
captcha_enabled();
captcha_disabled();
```

---

## ⚙️ Configuration Options

Example configuration:

```php
'default' => [
    'length' => 6,
    'width' => 345,
    'height' => 65,
    'quality' => 90,
    'math' => false,
    'expire' => 60,
    'encrypt' => false,
],
```

---

## 🖼 Available Presets
- default
- flat
- mini
- inverse
- math

---

## 🖼 Image Drivers

The package supports two image drivers:

- GD (default)
- Imagick


Driver Configuration

```env
CAPTCHA_DRIVER=gd
```

or

```env
CAPTCHA_DRIVER=imagick
```

### Driver Fallback

If imagick is selected but not installed, the package will automatically fallback to GD.

---

## 🧪 Testing

Run the test suite:

```bash
composer test
```

The package includes:

- Unit tests
- Feature tests
- Driver validation tests (GD / Imagick)
- Exception handling tests
- Helper and facade tests

---

## 🧱 Architecture

The package is structured around:

- Captcha core service
- Laravel Service Container binding
- Facade for convenient access
- Global helper functions

---

## ⚠️ Important Notes
- CAPTCHA is single-use (invalidated after validation)
- Cache is used for expiration handling
- Session is used for standard validation
- API mode does not rely on session

---

## 🔒 Security
- Values are hashed using Laravel’s Hash Manager
- Optional encryption using Laravel Crypt
- One-time validation prevents replay attacks

---

## 📌 Roadmap
- Multiple configurations
- GD / Imagick support
- API validation
- Full test coverage
- Custom driver support
- WebP / AVIF support
- Rate limiting integration

---

## 🙏 Credits

- [Abderrahim CHETIBI](https://github.com/achetibi)
- [mews/captcha](https://github.com/mewebstudio/captcha)
- [All Contributors](../../contributors)

---

## 📄 License

The MIT License (MIT).
See [LICENSE.md](LICENSE.md) for full license text.
