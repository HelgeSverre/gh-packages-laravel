# Laravel DNS Checker

[![Latest Version on Packagist](https://img.shields.io/packagist/v/alyakin/dns-checker.svg)](https://packagist.org/packages/alyakin/dns-checker)
[![Total Downloads](https://img.shields.io/packagist/dt/alyakin/dns-checker.svg)](https://packagist.org/packages/alyakin/dns-checker)
[![PHP Version](https://img.shields.io/packagist/php-v/alyakin/dns-checker)](https://packagist.org/packages/alyakin/dns-checker)
[![Pint](https://github.com/2177866/dns-checker/actions/workflows/pint.yml/badge.svg?branch=main)](https://github.com/2177866/dns-checker/actions/workflows/pint.yml)
[![Tests](https://github.com/2177866/dns-checker/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/2177866/dns-checker/actions/workflows/tests.yml)
[![Coverage](https://github.com/2177866/dns-checker/actions/workflows/coverage.yml/badge.svg?branch=main)](https://github.com/2177866/dns-checker/actions/workflows/coverage.yml)
[![License](https://img.shields.io/packagist/l/alyakin/dns-checker.svg)](LICENSE)

A Laravel-friendly DNS lookup wrapper built on [NetDNS2 v2](https://github.com/mikepultz/netdns2) for custom resolvers, system fallback, typed exceptions, caching, and Laravel integration.

## Quick Start

```bash
composer require alyakin/dns-checker
```

### Laravel

```bash
php artisan vendor:publish --tag=dns-checker-config
```

```php
use Alyakin\DnsChecker\Facades\DnsChecker;

$records = DnsChecker::getRecords('example.com', 'A');
```

### Plain PHP

```php
use Alyakin\DnsChecker\DnsLookupService;

$dns = new DnsLookupService([
    'servers' => ['8.8.8.8', '1.1.1.1'],
    'timeout' => 2,
    'fallback_to_system' => true,
]);

$records = $dns->getRecords('example.com', 'MX');
```

## Compatibility

| Component | Supported / used |
|---|---|
| Package runtime | PHP `8.1`–`8.3` |
| CI matrix | PHP `8.1`, `8.3` |
| DNS library | `mikepultz/netdns2:^2.0` |
| Laravel support | `illuminate/support:^9.0 \|\| ^10.0 \|\| ^11.0` |

## Features

- custom DNS servers with optional fallback to the system resolver
- optional typed exceptions for DNS failures
- optional NXDOMAIN logging control
- optional Laravel Cache-backed caching
- facade, fluent API, DI contract and artisan command support

## Documentation

- [Usage](docs/usage.md)
- [Configuration](docs/configuration.md)
- [Error Handling](docs/error-handling.md)
- [Caching](docs/caching.md)
- [Laravel Integration](docs/laravel-integration.md)
- [Architecture](docs/architecture.md)
- [Development](docs/development.md)

## Development

See [docs/development.md](docs/development.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and migration notes.

## License

MIT
