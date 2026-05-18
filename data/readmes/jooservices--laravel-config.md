# JOOservices Laravel Config

[![CI](https://github.com/jooservices/laravel-config/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/jooservices/laravel-config/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/jooservices/laravel-config/badge)](https://securityscorecards.dev/viewer/?uri=github.com/jooservices/laravel-config)
[![PHP Version](https://img.shields.io/badge/PHP-8.5%2B-blue.svg)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Packagist Version](https://img.shields.io/packagist/v/jooservices/laravel-config)](https://packagist.org/packages/jooservices/laravel-config)

The JOOservices Laravel Config package stores Laravel application configuration in MongoDB and exposes typed runtime access through `JOOservices\\LaravelConfig\\Facades\\Config`.

Package name: `jooservices/laravel-config`

## Install

```bash
composer require jooservices/laravel-config
```

Publish configuration:

```bash
php artisan vendor:publish --tag=config-store-config
```

## Requirements

- PHP 8.5+
- Laravel 11 or 12
- MongoDB via `mongodb/laravel-mongodb`
- MongoDB PHP extension

## What the package does

- stores values as `group`, `key`, `value`, and `type` documents in MongoDB
- loads a full in-memory map on first read and optionally caches that map
- supports typed normalization for `string`, `int`, `float`, `bool`, `array`, `json`, and `null`
- provides runtime `get`, `set`, `forget`, `group`, `all`, `refresh`, and `fresh` operations
- ships Artisan commands for common operator tasks

## Quick example

```php
use JOOservices\LaravelConfig\Facades\Config;

Config::set('system.site_name', 'XCrawler');
Config::set('system.enabled', true);
Config::set('payment.retry_times', 3);

$siteName = Config::get('system.site_name');
$system = Config::group('system');
$fresh = Config::fresh('system.site_name');
```

## Path format and validation

Paths must use the `group.key` format.

Rejected values include:

- empty paths
- missing dots
- leading dots
- trailing dots
- double dots
- empty group or empty key segments

Examples:

- valid: `system.site_name`
- valid: `payment.retry_times`
- invalid: `system`
- invalid: `.system.site_name`
- invalid: `system.`
- invalid: `system..site_name`

## Cache and memory behavior

- `get`, `has`, `group`, and `all` load from memory first
- when memory is cold, the service reads the cached full map first, then MongoDB on cache miss
- `set` and `forget` update MongoDB and keep the cache coherent without overwriting unrelated keys
- `refresh` clears in-memory state and the configured cache key, then reloads from MongoDB
- `fresh` bypasses the in-memory map and cache for a direct MongoDB read

Important limitation:

- the in-memory map is process-local, so long-running workers, Horizon processes, Octane workers, or multiple PHP-FPM workers can hold stale state until `refresh()` is called or the process is recycled

## MongoDB index requirement

Create a unique compound index on `group` and `key` so each config path remains unique.

```bash
php artisan config-store:ensure-index
```

Equivalent Mongo shell command:

```javascript
db.configs.createIndex(
  { group: 1, key: 1 },
  { name: 'config_group_key_unique', unique: true }
);
```

## Artisan commands

```bash
php artisan config-store:get system.site_name --default="Default"
php artisan config-store:set system.site_name XCrawler
php artisan config-store:set system.enabled true --type=bool
php artisan config-store:forget system.site_name
php artisan config-store:refresh
php artisan config-store:ensure-index
```

## Security note

This package can store sensitive values, but it does not encrypt stored values by default. Do not place credentials or secrets in this store unless your MongoDB deployment, backups, and access controls already satisfy your security requirements.

## Upgrade note

The canonical namespace for this package is now `JOOservices\\LaravelConfig\\`. Existing code that imports `JooServices\\LaravelConfig\\...` must be updated. This repository does not currently ship a compatibility alias layer.

## Documentation

Start with:

- [Documentation Hub](./docs/README.md)
- [Installation](./docs/01-getting-started/01-installation.md)
- [Quick Start](./docs/01-getting-started/02-quick-start.md)
- [Configuration](./docs/02-user-guide/01-configuration.md)
- [Usage Guide](./docs/02-user-guide/02-usage-guide.md)
- [Release Process](./docs/04-development/06-release-process.md)
- [Risks, Legacy, and Gaps](./docs/05-maintenance/01-risks-legacy-and-gaps.md)
- [Changelog](./CHANGELOG.md)

## AI support

This repository includes AI contributor guidance and skill files.

Start with:

- [AGENTS.md](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md)
- [AI Skills Map](./ai/skills/README.md)
- [AI Skills Usage Guide](./ai/skills/USAGE.md)

## Development

```bash
composer lint
composer lint:all
composer test
composer test:coverage
composer check
composer ci
```

MongoDB must be available for integration tests.

## Community

- [Contributing](./CONTRIBUTING.md)
- [Security Policy](./SECURITY.md)
- [License](./LICENSE)
