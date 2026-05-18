# Laravel Patcher

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danielemontecchi/laravel-patcher.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-patcher)
[![Total Downloads](https://img.shields.io/packagist/dt/danielemontecchi/laravel-patcher.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-patcher)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/danielemontecchi/laravel-patcher/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/danielemontecchi/laravel-patcher/actions/workflows/tests.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-patcher&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-patcher)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-patcher&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-patcher)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg?style=flat-square)](https://danielemontecchi.github.io/laravel-patcher)

**Laravel Patcher** is a clean and predictable system for applying one-time patches to your Laravel application.
It works similarly to migrations but is designed for operational, data-related, or procedural logic that you need to run once and track.

Inspired by [Taylor Otwell’s patching concept](https://x.com/taylorotwell/status/1387766514674192384?s=46), this package formalizes and extends the idea to support a wide variety of use cases, including conditionally skipped patches, tracking applied states, and batch rollback.

---

## Features

- Runs patch classes similar to migrations
- Supports anonymous class patches using `return new class extends Patch`
- Automatically tracks execution via the `patches` database table
- Supports conditional execution via `shouldRun()`
- Distinguishes executed vs skipped patches using `is_applied`
- CLI output styled identically to `php artisan migrate`
- Allows rollback by batch

---

## Installation

```bash
composer require danielemontecchi/laravel-patcher
```

Laravel will automatically register the service provider.

To create the required database table, run:

```bash
php artisan migrate
```

### Patch Table Format

The `patches` table includes:

| Column      | Type      | Description                                                         |
|-------------|-----------|---------------------------------------------------------------------|
| id          | bigint    | Auto-increment primary key                                          |
| name        | string    | Patch filename (without `.php`)                                    |
| batch       | int       | Batch number (like migrations)                                     |
| is_applied  | boolean   | Whether `shouldRun()` returned `true` and the patch was executed   |
| applied_at  | timestamp | When the patch was recorded                                        |

> Skipped patches are still recorded, but with `is_applied = false`.

---

## Creating a Patch

```bash
php artisan make:patch FixUsernames
```

This will generate a new file in `database/patches/`:

```php
<?php

use DanieleMontecchi\LaravelPatcher\Contracts\Patch;

return new class extends Patch {
    public function shouldRun(): bool {
        return true; // Logic to determine if patch should run
    }

    public function up(): void {
        // Logic to apply
    }

    public function down(): void {
        // Logic to rollback
    }
};
```

> Patches must return an anonymous class instance that extends `Patch`.

---

## Executing Patches

```bash
php artisan patch
```

Executes all unapplied patches, skipping those already registered in the `patches` table. Patches for which `shouldRun()` returns `false` are marked as skipped and recorded accordingly.

---

## Rolling Back Patches

```bash
php artisan patch:rollback
```

Rolls back the latest batch of applied patches (only those where `is_applied = true`).

Use the `--step=N` option to rollback multiple batches:

```bash
php artisan patch:rollback --step=2
```

---

## License

Laravel Patcher is open-source software licensed under the **MIT license**.
See the [LICENSE.md](LICENSE.md) file for full details.

---

Made with ❤️ by [Daniele Montecchi](https://danielemontecchi.com)
