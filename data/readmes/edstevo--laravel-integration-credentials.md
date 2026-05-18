# Laravel Integration Credentials

[![Latest Version on Packagist](https://img.shields.io/packagist/v/edstevo/laravel-integration-credentials.svg?style=flat-square)](https://packagist.org/packages/edstevo/laravel-integration-credentials)
[![Tests](https://img.shields.io/github/actions/workflow/status/edstevo/laravel-integration-credentials/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/edstevo/laravel-integration-credentials/actions/workflows/run-tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/edstevo/laravel-integration-credentials.svg?style=flat-square)](https://packagist.org/packages/edstevo/laravel-integration-credentials)

Store integration credentials (provider/key/value) against any Eloquent model through a polymorphic relationship.

## Installation

```bash
composer require edstevo/laravel-integration-credentials
```

Migrations are auto-discovered and run with your normal `php artisan migrate` flow.

If you prefer publishing package migrations first:

```bash
php artisan vendor:publish --tag="laravel-integration-credentials-migrations"
php artisan migrate
```

## Usage

Add the trait to any model that should own credentials:

```php
<?php

namespace App\Models;

use EdStevo\LaravelIntegrationCredentials\Models\Concerns\MorphManyIntegrationCredentials;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use MorphManyIntegrationCredentials;
}
```

Set and read credentials:

```php
$store->setIntegrationCredential('shopify', 'access_token', 'token_123');

$credential = $store->getIntegrationCredential('shopify', 'access_token');
$value = $store->getIntegrationCredentialValue('shopify', 'access_token');
```

Use expirations:

```php
$store->setIntegrationCredential(
    provider: 'shopify',
    key: 'access_token',
    value: 'token_123',
    expiresAt: now()->addHour(),
);

$validValue = $store->getIntegrationCredentialValue('shopify', 'access_token');
$includeExpired = $store->getIntegrationCredentialValue('shopify', 'access_token', allowExpired: true);
```

Delete one credential or all credentials for a provider:

```php
$store->forgetIntegrationCredential('shopify', 'access_token');
$store->forgetIntegrationProvider('shopify');
```

Query models by integration credential value:

```php
$store = Store::whereHasIntegrationCredentialValue('shopify', 'shop_id', '12345')->first();

$storeIncludingExpired = Store::whereHasIntegrationCredentialValue(
    provider: 'shopify',
    key: 'shop_id',
    value: '12345',
    mustBeValid: false,
)->first();
```

## Testing

```bash
composer test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md).
