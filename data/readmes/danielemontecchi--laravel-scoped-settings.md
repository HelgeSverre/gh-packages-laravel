# Laravel Scoped Settings

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danielemontecchi/laravel-scoped-settings.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-scoped-settings)
[![Total Downloads](https://img.shields.io/packagist/dt/danielemontecchi/laravel-scoped-settings.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-scoped-settings)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/danielemontecchi/laravel-scoped-settings/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/danielemontecchi/laravel-scoped-settings/actions/workflows/tests.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-scoped-settings&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-scoped-settings)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-scoped-settings&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-scoped-settings)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg?style=flat-square)](https://danielemontecchi.github.io/laravel-scoped-settings)

---

**Laravel Scoped Settings** is a lightweight Laravel package that provides a simple and elegant way to manage global and model-scoped application settings.

- ⚡ Supports **global settings** and **per-model scoped settings**
- 🎯 API via Facade and `setting()` helper
- ✅ Includes artisan commands and full test suite
- 🚀 Optional **per-scope caching** built into `set()` and `get()`

---

## 📦 Installation

You can install the package via Composer:

```bash
composer require danielemontecchi/laravel-scoped-settings
```

To customize default cache behavior, publish the config file:

```bash
php artisan vendor:publish --tag="laravel-scoped-settings-config"
```

To publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-scoped-settings-migrations"
php artisan migrate
```

---

## 🛠 Usage

```php
// Global settings
setting()->set('site.name', 'My App');
$siteName = setting()->get('site.name');

// Set with optional caching (global or scoped)
setting()->set('site.name', 'My App', 3600); // Cache for 1 hour

// If TTL is omitted, uses default from config (or disables cache)
setting()->set('site.name', 'My App'); // No cache if config is null

// Check if a setting exists (ignores fallback)
if (setting()->has('site.name')) {
    // the value is explicitly set
}

// Scoped settings (e.g. per user)
setting()->for($user)->set('dashboard.layout', 'compact');
$layout = setting()->for($user)->get('dashboard.layout');
```

You can also retrieve all flat or grouped settings:

```php
setting()->all(); // ['site.name' => 'My App']
setting()->for($user)->group('dashboard'); // ['layout' => 'compact']
```

Clear a specific key:

```php
setting()->forget('site.name');
```

---

## 🛠 Artisan Commands

```bash
php artisan settings:list     # Show all settings in CLI
php artisan settings:clear    # Clear all settings
php artisan settings:export   # Export settings to JSON
php artisan settings:import   # Import settings from JSON
```

---

## 🧪 Testing

```bash
./vendor/bin/pest
```

Coverage reports are generated via `phpunit.xml` config and uploaded to [Codecov](https://codecov.io/).

---

## 📚 Documentation

Full documentation available at:

👉 [https://danielemontecchi.github.io/laravel-scoped-settings](https://danielemontecchi.github.io/laravel-scoped-settings)

Includes:

- Installation & Configuration
- Usage Examples
- Scoping Strategies
- Artisan Commands
- Advanced Tips

---

## License

Laravel Scoped Settings is open-source software licensed under the **MIT license**.
See the [LICENSE.md](LICENSE.md) file for full details.

---

Made with ❤️ by [Daniele Montecchi](https://danielemontecchi.com)
