# Laravel Custom Makes

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danielemontecchi/laravel-custom-makes.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-custom-makes)
[![Total Downloads](https://img.shields.io/packagist/dt/danielemontecchi/laravel-custom-makes.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-custom-makes)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/danielemontecchi/laravel-custom-makes/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/danielemontecchi/laravel-custom-makes/actions/workflows/tests.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-custom-makes&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-custom-makes)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-custom-makes&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-custom-makes)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg?style=flat-square)](https://danielemontecchi.github.io/laravel-custom-makes)

Generate custom Laravel classes using reusable stubs with Artisan.

---

## 📦 Installation

You can install the package via Composer:

```bash
composer require danielemontecchi/laravel-custom-makes
```

## ⚙️ Configuration

You can optionally publish the config file:

```bash
php artisan vendor:publish --tag=laravel-custom-makes-config
```

This will create `config/laravel-custom-makes.php` with the following options:

- `stubs_path`: path for storing custom stub files (default: `stubs`)

## 🚀 Usage

### Create a custom stub

To define a new generator stub:

```bash
php artisan make:custom service
```

This creates a stub file:

```
stubs/service.stub
```

If the stub already exists, the command will abort.

The generated stub will contain a simple template.

### Generate a class from a custom stub

Use `make:custom` with the stub type and class name:

```bash
php artisan make:custom service UserService
```

This will create:

```
app/Services/UserService.php
```

If no name is passed, it will generate (or suggest) the stub instead.

> You can also nest namespaces, e.g. `Admin/UserService` will generate `app/Services/Admin/UserService.php`

### Listing available custom generators

Run the following to see all available custom stubs:

```bash
php artisan make:custom-list
```

The command filters out Laravel native stub types.

## 📂 Stub management

Custom stubs are stored in:

```
stubs/
```

You can edit or remove these files manually. Stub content uses placeholders like `{{ namespace }}`, `{{ class }}`, etc.

### ✅ Supported placeholders

All stub templates can include the following placeholders:

- `{{ namespace }}`: Fully-qualified namespace of the class
- `{{ class }}`: The class name
- `{{ name }}`: The raw input name

## 🧪 Running tests

To run the test suite:

```bash
./vendor/bin/pest
```

Tests are powered by Pest and Orchestra Testbench.

---

## License

Laravel Custom Makes is open-source software licensed under the **MIT license**.
See the [LICENSE.md](LICENSE.md) file for full details.

---

Made with ❤️ by [Daniele Montecchi](https://danielemontecchi.com)
