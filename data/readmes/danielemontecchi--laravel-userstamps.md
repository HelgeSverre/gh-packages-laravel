# Laravel Userstamps

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danielemontecchi/laravel-userstamps.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-userstamps)
[![Total Downloads](https://img.shields.io/packagist/dt/danielemontecchi/laravel-userstamps.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-userstamps)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/danielemontecchi/laravel-userstamps/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/danielemontecchi/laravel-userstamps/actions/workflows/tests.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-userstamps&metric=coverage)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-userstamps)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%20max-brightgreen.svg?style=flat-square)](https://phpstan.org/)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-userstamps&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-userstamps)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-userstamps&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-userstamps)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg?style=flat-square)](https://danielemontecchi.github.io/laravel-userstamps)

**Laravel Userstamps** is a lightweight, plug-and-play package to automatically track the user who created, updated, or deleted an Eloquent model in Laravel.

Much like Laravel's `timestamps()` for `created_at` and `updated_at`, this package handles the `created_by`, `updated_by`, and `deleted_by` fields in a clean and consistent way.

---

## 🛠️ Installation

```bash
composer require danielemontecchi/laravel-userstamps
````

Laravel automatically registers the service provider via package discovery.

---

## ⚙️ Usage in Eloquent models

Add the `HasUserstamps` trait to any model where you want userstamps to be tracked:

```php
use DanieleMontecchi\LaravelUserstamps\Traits\HasUserstamps;

class Post extends Model
{
    use HasUserstamps;
}
```

The trait automatically listens to Eloquent model events (`creating`, `updating`, `deleting`, `restoring`) and fills the appropriate `*_by` fields **only if they exist** in the database.

---

## 🧱 Migration helpers

The package provides expressive migration macros:

### ➕ Add `created_by` and `updated_by`

```php
$table->userstamps();
```

### ➕ Add `deleted_by` (similar to `softDeletes()`)

```php
$table->softDeletesBy();
```

### 🧩 Full example

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');

    $table->userstamps();       // created_by, updated_by
    $table->timestamps();       // created_at, updated_at
    $table->softDeletes();      // deleted_at
    $table->softDeletesBy();    // deleted_by
});
```

---

## 👤 User relations

The trait adds inverse relationships to the `User` model (or whatever model uses the IDs):

```php
$post->creator;    // The user who created the model
$post->updater;    // The user who last updated the model
$post->destroyer;  // The user who deleted the model
```

---

## 🚫 Temporarily disable tracking

You can disable userstamping (e.g. during seeding, bulk import, or testing):

```php
Post::disableUserstamps();

Post::create(['title' => 'Imported without tracking']);

Post::enableUserstamps();
```

---

## 🔧 Requirements

* PHP 8.1+
* Laravel 10.x, 11.x, 12.x, 13.x
* A `users` table (or any custom user model)

> Note: field names are not hardcoded. The macros can be customized or replaced as needed.

---

## ✅ Why this package?

* ✔️ Laravel-like API: `userstamps()` and `softDeletesBy()`
* ✔️ Zero configuration
* ✔️ Only acts on existing columns
* ✔️ Soft delete & restore support
* ✔️ Great for audits, logs, traceability

---

## License

Laravel Userstamps is open-source software licensed under the **MIT license**.
See the [LICENSE.md](LICENSE.md) file for full details.

---

Made with ❤️ by [Daniele Montecchi](https://danielemontecchi.com)
