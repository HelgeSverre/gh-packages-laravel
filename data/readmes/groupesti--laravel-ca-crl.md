# Laravel CA CRL

> Certificate Revocation List (CRL) management package for Laravel CA. Generate, publish, and distribute full and delta CRLs for your Certificate Authorities.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/groupesti/laravel-ca-crl.svg)](https://packagist.org/packages/groupesti/laravel-ca-crl)
[![PHP Version](https://img.shields.io/badge/php-8.4%2B-blue)](https://www.php.net/releases/8.4/en.php)
[![Laravel](https://img.shields.io/badge/laravel-12.x%20|%2013.x-red)](https://laravel.com)
[![Tests](https://github.com/groupesti/laravel-ca-crl/actions/workflows/tests.yml/badge.svg)](https://github.com/groupesti/laravel-ca-crl/actions/workflows/tests.yml)
[![License](https://img.shields.io/github/license/groupesti/laravel-ca-crl)](LICENSE.md)

## Requirements

- PHP 8.4+
- Laravel 12.x or 13.x
- `groupesti/laravel-ca` ^0.1
- `groupesti/laravel-ca-crt` ^0.1
- `groupesti/laravel-ca-log` ^0.1
- `phpseclib/phpseclib` ^3.0

## Installation

```bash
composer require groupesti/laravel-ca-crl
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=ca-crl-config
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag=ca-crl-migrations
php artisan migrate
```

## Configuration

The configuration file is published to `config/ca-crl.php`. Available options:

| Key | Type | Default | Description |
|---|---|---|---|
| `lifetime_hours` | `int` | `24` | How many hours a generated CRL is valid for. |
| `overlap_hours` | `int` | `6` | Hours before expiration to generate a new CRL. |
| `auto_generate` | `bool` | `true` | Enable automatic CRL generation via the scheduler. |
| `schedule_frequency` | `string` | `'daily'` | Laravel scheduler frequency method (e.g. `hourly`, `daily`, `everyFourHours`). |
| `delta_crl_enabled` | `bool` | `false` | Enable delta CRL generation. |
| `storage_disk` | `string` | `'local'` | Laravel filesystem disk for published CRL files. |
| `storage_path` | `string` | `'ca/crls'` | Base path within the storage disk. |
| `distribution_url` | `string\|null` | `null` | Base URL for CRL distribution points. Falls back to route-based URLs. |
| `routes.enabled` | `bool` | `true` | Enable the CRL API routes. |
| `routes.prefix` | `string` | `'api/ca/crls'` | Route prefix for CRL endpoints. |
| `routes.middleware` | `array` | `['api']` | Middleware applied to CRL routes. |

## Usage

### Generate a Full CRL

```php
use CA\Crl\Contracts\CrlManagerInterface;
use CA\Models\CertificateAuthority;

$crlManager = app(CrlManagerInterface::class);
$ca = CertificateAuthority::find($caId);

$crl = $crlManager->generate(ca: $ca);
```

### Generate a Delta CRL

```php
$currentCrl = $crlManager->getCurrent(ca: $ca);
$deltaCrl = $crlManager->generateDelta(ca: $ca, baseCrl: $currentCrl);
```

### Publish a CRL to Storage

```php
$crlManager->publish(crl: $crl);
```

### Check if a Certificate Is Revoked

```php
$isRevoked = $crlManager->isRevoked(ca: $ca, serial: '01AB3F');
```

### Retrieve CRLs

```php
// Get the current (latest non-expired) full CRL
$current = $crlManager->getCurrent(ca: $ca);

// Get all CRLs for a CA
$all = $crlManager->getAll(ca: $ca);

// Find a CRL by UUID
$crl = $crlManager->findByUuid(uuid: '550e8400-e29b-41d4-a716-446655440000');
```

### Using the Facade

```php
use CA\Crl\Facades\CaCrl;

$crl = CaCrl::generate(ca: $ca);
CaCrl::publish(crl: $crl);
```

### Artisan Commands

```bash
# Generate a CRL for a Certificate Authority
php artisan ca-crl:generate {ca_id}

# Publish a CRL to the configured storage disk
php artisan ca-crl:publish {crl_id}

# List CRLs for a Certificate Authority
php artisan ca-crl:list {ca_id}
```

### Listening to Events

The `CrlGenerated` event is dispatched after every CRL generation (full or delta):

```php
use CA\Crl\Events\CrlGenerated;

Event::listen(CrlGenerated::class, function (CrlGenerated $event): void {
    $crl = $event->crl;
    // Notify, log, or trigger further processing...
});
```

### Auto-Scheduling

When `auto_generate` is enabled, the package registers a scheduled task that automatically generates and publishes CRLs for active CAs whose current CRL is approaching expiration (within the `overlap_hours` window). Ensure `php artisan schedule:work` or `php artisan schedule:run` is configured in your environment.

## Testing

```bash
./vendor/bin/pest
./vendor/bin/pint --test
./vendor/bin/phpstan analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover a security vulnerability, please see [SECURITY](SECURITY.md). Do not open a public issue.

## Credits

- [Groupesti](https://github.com/groupesti)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
