# Laravel API Versioning & Deprecation Manager

[![Latest Version](https://img.shields.io/github/v/release/malek-deghlawi/laravel-api-versioning)](https://github.com/malek-deghlawi/laravel-api-versioning/releases)
[![License](https://img.shields.io/github/license/malek-deghlawi/laravel-api-versioning)](LICENSE)
[![PHP Version](https://img.shields.io/badge/php-8.1%2B-blue)](#requirements)
[![Laravel](https://img.shields.io/badge/laravel-10%20%7C%2011-red)](#requirements)

A production-ready **API Versioning & Deprecation Lifecycle Manager for Laravel**.

---

## Table of Contents

- [Why This Package?](#why-this-package)
- [Features](#features)
- [Installation](#installation)
- [Quick Example](#quick-example)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [Artisan Commands](#artisan-commands)
- [Use Cases](#use-cases)
- [Production Notes](#production-notes)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author](#author)

---

## Why This Package?

Laravel does not provide structured API lifecycle management out of the box.

As APIs evolve, teams need:

- Version isolation (`/v1`, `/v2`)
- Safe deprecation workflows
- Sunset communication
- Client-aware usage tracking
- Deprecated traffic monitoring

This package provides an opinionated and production-focused solution.

---

## Features

### API Versioning

- Route prefix versioning
- Header-based version resolution
- Query parameter fallback
- Version mismatch protection

Example:

```php
use Malek\ApiVersioning\Facades\ApiRoute;

ApiRoute::version('v1')->group(function () {
    Route::get('/users', fn () => 'Users v1');
});
```

Access:
```bash
GET /v1/users
```


### API Deprecation Management

Mark routes as deprecated:

```php
ApiRoute::version('v2')
    ->deprecated('2026-01-01', 'Please migrate to v3')
    ->group(function () {
        Route::get('/legacy', fn () => 'Deprecated');
    });
```
Response headers:
```
Deprecation: true
Sunset: 2026-01-01
Warning: 299 - "Please migrate to v3"
```

### Per-Client Usage Tracking
Tracks:
- Version
- Route
- Client (API key or authenticated user)

Supports:
- Header-based client resolution
- Auth-based resolution
- Anonymous fallback


### Deprecated Usage Alerts

- Configurable threshold

- Time window monitoring

- Critical log trigger

## Installation
### Requirements
- PHP 8.1+
- Laravel 10 or 11

#### Install:
```bash
composer require malek/laravel-api-versioning
```

#### Publish config:
```bash
php artisan vendor:publish --tag=api-versioning-config
```
## Quick Example

```php
use Malek\ApiVersioning\Facades\ApiRoute;

ApiRoute::version('v1')->group(function () {
    Route::get('/users', fn () => 'Users v1');
});

ApiRoute::version('v2')
    ->deprecated('2026-01-01', 'Upgrade to v3')
    ->group(function () {
        Route::get('/users', fn () => 'Users v2');
    });
```
## Configuration
### File:
```
config/api-versioning.php
```
### Default Version
```
'default_version' => 'v1',
```
### Version Resolver
```
'resolver' => [
    'header' => 'X-API-Version',
    'query'  => 'api_version',
],
```
### Client Resolver
```
'client' => [
    'resolver' => 'header',
    'header'   => 'X-API-KEY',
    'fallback' => 'anonymous',
],
```
### Usage Tracking
```
'usage' => [
    'enabled' => true,
    'ttl' => 60 * 60 * 24 * 30,
],
```
### Deprecation Alerts
```
'alerts' => [
    'enabled' => true,
    'threshold' => 100,
    'window_minutes' => 5,
],
```
## Architecture

```
Request
  ↓
ResolveApiVersion Middleware
  ↓
VersionedRouteRegistrar
  ↓
DeprecationHeaders Middleware
  ↓
ApiUsageTracker
  ↓
DeprecatedUsageMonitor
  ↓
Response
```

## Artisan Commands
```
php artisan api:versions
php artisan api:deprecated
php artisan api:usage
php artisan api:alerts
```

## Use Cases
- Mobile API version governance
- SaaS public APIs
- Gradual API migrations
- Enterprise API lifecycle control
- B2B multi-client APIs

## Production Notes

- Uses Laravel Cache (Redis recommended)

- Logging-based alert mechanism

- No database dependency

- Horizontal scaling friendly

## Testing
```
vendor/bin/phpunit
```
## Roadmap

- Database persistence driver
- Slack / email alert integration
- Prometheus metrics exporter
- OpenAPI compatibility
- Sunset enforcement mode

Admin dashboard
## Contributing

- Fork repository
- Create feature branch
- Submit Pull Request


## License
MIT License

## Author
Malek Deghlawi
<br> GitHub: https://github.com/malek-deghlawi