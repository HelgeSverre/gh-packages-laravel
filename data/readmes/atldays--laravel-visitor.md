# Laravel Visitor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/atldays/laravel-visitor.svg?logo=packagist&style=for-the-badge)](https://packagist.org/packages/atldays/laravel-visitor)
[![Total Downloads](https://img.shields.io/packagist/dt/atldays/laravel-visitor.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/atldays/laravel-visitor/stats)
[![CI](https://img.shields.io/github/actions/workflow/status/atldays/laravel-visitor/ci.yml?style=for-the-badge&label=CI)](https://github.com/atldays/laravel-visitor/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE.md)

Resolve a full visitor profile from the current Laravel request.

`atldays/laravel-visitor` gives you a clean, typed abstraction over the most important visitor signals:

- IP address
- User-Agent
- preferred language and accepted languages
- parsed agent metadata through `atldays/laravel-agent`
- geo metadata through `atldays/laravel-geo`
- configurable fingerprint generation

It is designed to be the thin orchestration layer that connects those concerns into one consistent visitor object.

## Why This Package

When you need to understand who is visiting your application, you usually end up stitching together several low-level request details by hand.

This package gives you one place to resolve:

- the raw visitor identity signals
- the parsed device and browser information
- the geo lookup result
- the language context
- a stable fingerprint strategy that you can customize

## Installation

```bash
composer require atldays/laravel-visitor
```

## Quick Start

Resolve the current visitor through the manager:

```php
use Atldays\Visitor\Facades\VisitorManager;

$visitor = VisitorManager::request();

$visitor->ip();
$visitor->userAgent();
$visitor->language()->language();
$visitor->language()->languages();
$visitor->fingerprint();
$visitor->agent();
$visitor->geo();
```

Resolve the current visitor directly from the request:

```php
$visitor = request()->visitor();
```

Resolve the current visitor through the `Visitor` facade:

```php
use Atldays\Visitor\Facades\Visitor;

Visitor::ip();
Visitor::userAgent();
Visitor::language();
Visitor::fingerprint();
Visitor::agent();
Visitor::geo();
```

Create a visitor manually:

```php
use Atldays\Visitor\Facades\VisitorManager;

$visitor = VisitorManager::from(
    '8.8.8.8',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    [
        'language' => 'en-US',
        'languages' => ['en-US', 'en'],
    ],
);
```

## API Overview

### `VisitorManager`

Use `VisitorManager` when you want to resolve a full visitor object:

- `VisitorManager::request()`
- `VisitorManager::from($ip, $userAgent, $language = [])`

### `Visitor`

Use `Visitor` when you want quick access to the current resolved visitor:

- `Visitor::ip()`
- `Visitor::userAgent()`
- `Visitor::language()`
- `Visitor::fingerprint()`
- `Visitor::agent()`
- `Visitor::geo()`

## Language Object

Language data is exposed as a dedicated DTO instead of plain strings scattered across the visitor object.

```php
$language = $visitor->language();

$language->language();  // Most preferred language
$language->languages(); // All accepted languages in priority order
```

## Fingerprint Driver

By default, the package builds a fingerprint from the visitor IP address and User-Agent.

Publish the config file if you want to replace the default fingerprint driver:

```bash
php artisan vendor:publish --tag=visitor-config
```

You can replace the implementation in the config:

```php
return [
    'fingerprint' => [
        'driver' => App\Support\Visitors\CustomFingerprint::class,
    ],
];
```

Your custom driver must implement `Atldays\Visitor\Contracts\FingerprintContract`.

## Built On

This package works as an orchestration layer on top of:

- [`atldays/laravel-agent`](https://github.com/atldays/laravel-agent)
- [`atldays/laravel-geo`](https://github.com/atldays/laravel-geo)

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
