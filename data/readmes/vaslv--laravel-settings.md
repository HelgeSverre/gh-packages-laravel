# Laravel Settings

Reusable Laravel package for storing typed settings in the database with caching and a clean API.

## Requirements

- PHP 8.2+
- Laravel 10-13

Laravel 13 requires PHP 8.3+ because the underlying `illuminate/*` 13.x components require it.

## Installation

```bash
composer require vaslv/laravel-settings
```

Publish the config and migration:

```bash
php artisan vendor:publish --tag=settings-config
php artisan vendor:publish --tag=settings-migrations
```

Run migrations:

```bash
php artisan migrate
```

## Configuration

`config/settings.php`

```php
return [
    'table' => 'settings',
    'encryption' => [
        'enabled' => false,
    ],
    'cache' => [
        'enabled' => true,
        'ttl' => 3600,
        'key' => 'settings',
    ],
];
```

If you change `table`, the published migration will use the configured name.

## Usage

### Facade

```php
use Settings;

Settings::get('site.legal_text');
Settings::set('site.enabled', true);
Settings::set('site.legal_text', '# Legal', 'markdown');
Settings::set('legal_text', '# Legal'); // group = null
```

### Helper

```php
setting('site.legal_text');
setting('site.enabled', false);
setting('site.legal_text', '# Legal', 'markdown');
setting()->groups();
```

## Supported Types

- string
- boolean
- integer
- float
- html
- json
- markdown

Types are stored explicitly in the DB and cast on read.

## Cache

The package caches all settings under one key and clears it automatically on `set`.

## Encryption

Enable encryption to store raw values in encrypted form in the database. Values are decrypted on read.

```php
return [
    'encryption' => [
        'enabled' => true,
    ],
];
```

## Code Style

Code is formatted to comply with Laravel Pint.

## Compatibility

The package is tested against these combinations:

- Laravel 10 on PHP 8.2
- Laravel 11 on PHP 8.2
- Laravel 12 on PHP 8.2
- Laravel 13 on PHP 8.3
