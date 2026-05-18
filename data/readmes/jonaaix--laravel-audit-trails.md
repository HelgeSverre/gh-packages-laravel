<p align="center">
  <a href="https://github.com/jonaaix/laravel-audit-trails">
    <img src="https://raw.githubusercontent.com/jonaaix/laravel-audit-trails/main/assets/laravel-audit-trails.webp" alt="Laravel Audit Trails Logo" width="120">
  </a>
</p>

<h1 align="center">Laravel Audit Trails</h1>

<p align="center">
A lightweight Laravel audit-log package — one trait, polymorphic by design, soft-delete aware.
</p>

<p align="center">
  <a href="https://packagist.org/packages/aaix/laravel-audit-trails"><img src="https://img.shields.io/packagist/v/aaix/laravel-audit-trails.svg?style=flat-square" alt="Latest Version on Packagist"></a>
  <a href="https://packagist.org/packages/aaix/laravel-audit-trails"><img src="https://img.shields.io/packagist/dt/aaix/laravel-audit-trails.svg?style=flat-square" alt="Total Downloads"></a>
  <a href="https://github.com/jonaaix/laravel-audit-trails/actions/workflows/tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/jonaaix/laravel-audit-trails/tests.yml?branch=main&label=tests&style=flat-square" alt="GitHub Actions"></a>
  <a href="https://github.com/jonaaix/laravel-audit-trails/blob/main/LICENSE.md"><img src="https://img.shields.io/packagist/l/aaix/laravel-audit-trails.svg?style=flat-square" alt="License"></a>
</p>

---

## Installation

```shell
composer require aaix/laravel-audit-trails

# Publish the migrations
php artisan vendor:publish --tag="audit-trails-migrations"
php artisan migrate

# Optional
php artisan vendor:publish --tag="audit-trails-config"
```

## Quick start

```php
use Aaix\LaravelAuditTrails\Concerns\TracksAuditTrail;

class Order extends Model
{
    use TracksAuditTrail;
}
```

## Documentation

Full documentation: **[jonaaix.github.io/laravel-audit-trails](https://jonaaix.github.io/laravel-audit-trails)**

## License

MIT — see [LICENSE.md](LICENSE.md).
