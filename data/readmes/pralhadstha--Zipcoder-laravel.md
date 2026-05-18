# Zipcoder Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/pralhadstha/zipcoder-laravel.svg?style=flat-square)](https://packagist.org/packages/pralhadstha/zipcoder-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/pralhadstha/zipcoder-laravel.svg?style=flat-square)](https://packagist.org/packages/pralhadstha/zipcoder-laravel)
[![License](https://img.shields.io/packagist/l/pralhadstha/zipcoder-laravel.svg?style=flat-square)](LICENSE)
[![PHP Version](https://img.shields.io/packagist/php-v/pralhadstha/zipcoder-laravel.svg?style=flat-square)](composer.json)
[![Tests](https://img.shields.io/github/actions/workflow/status/pralhadstha/zipcoder-laravel/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/pralhadstha/zipcoder-laravel/actions)

A Laravel package to resolve postal codes and zip codes to addresses. Supports multiple geocoding providers with automatic failover, built-in caching, Facade support, and publishable config.

## Why Zipcoder Laravel?

- **Multiple providers** — GeoNames, Zippopotamus, Zipcodestack, Zipcodebase, and JP Postal Code out of the box
- **Automatic failover** — Chain of Responsibility pattern tries providers in order until one succeeds
- **Built-in caching** — PSR-16 cache integration with configurable TTL and store, reducing API calls
- **Zero config for free providers** — Zippopotamus and JP Postal Code work without API keys
- **Custom providers** — Register your own provider via config, no package forking needed
- **Laravel-native** — Auto-discovery, Facade, publishable config, env-driven settings

## Requirements

- PHP 8.2 or higher
- Laravel 11, 12, or 13

## Installation

```bash
composer require pralhadstha/zipcoder-laravel
```

The package auto-discovers the service provider and facade. No manual registration needed.

Publish the configuration file:

```bash
php artisan vendor:publish --tag=zipcoder-config
```

## Configuration

The published config file (`config/zipcoder.php`) has four sections:

### HTTP Client

```php
'http' => [
    'timeout' => env('ZIPCODER_HTTP_TIMEOUT', 10),
    'connect_timeout' => env('ZIPCODER_HTTP_CONNECT_TIMEOUT', 5),
],
```

Uses Guzzle 7+ (ships with Laravel) implementing PSR-18. You can override by binding your own `ClientInterface` in the container.

### Providers

Configure credentials for each provider:

```php
'providers' => [
    'geonames' => [
        'username' => env('GEONAMES_USERNAME'),
    ],
    'zippopotamus' => [
        'enabled' => true,
    ],
    'zipcodestack' => [
        'api_key' => env('ZIPCODESTACK_API_KEY'),
    ],
    'zipcodebase' => [
        'api_key' => env('ZIPCODEBASE_API_KEY'),
    ],
    'jp-postal-code' => [
        'enabled' => true,
        'locale' => env('JP_POSTAL_CODE_LOCALE', 'en'),
    ],
],
```

Providers with missing credentials are automatically skipped.

### Chain Order

Controls the order in which providers are attempted. The first provider to return a result wins:

```php
'chain' => [
    'jp-postal-code',
    'zippopotamus',
    'geonames',
    'zipcodebase',
    'zipcodestack',
],
```

### Cache

```php
'cache' => [
    'enabled' => env('ZIPCODER_CACHE_ENABLED', true),
    'ttl' => env('ZIPCODER_CACHE_TTL', 86400), // 24 hours
    'store' => env('ZIPCODER_CACHE_STORE'),     // null = default store
],
```

## Usage

### Basic Lookup

```php
use Pralhad\Zipcoder\Laravel\Facades\Zipcoder;
use Pralhad\Zipcoder\Query;

$results = Zipcoder::lookup(Query::create('10001', 'US'));

$address = $results->first();

echo $address->city;        // "New York"
echo $address->state;       // "New York"
echo $address->stateCode;   // "NY"
echo $address->countryCode; // "US"
echo $address->latitude;    // 40.7484
echo $address->longitude;   // -73.9967
```

### Iterating Results

```php
$results = Zipcoder::lookup(Query::create('100-0001', 'JP'));

foreach ($results as $address) {
    echo "{$address->city}, {$address->state}" . PHP_EOL;
}
```

### Checking for Results

```php
$results = Zipcoder::lookup(Query::create('10001', 'US'));

if ($results->isEmpty()) {
    // No addresses found
}

echo $results->count(); // Number of addresses returned
```

### Converting to Array

```php
$array = $results->first()->toArray();
// or all results
$allArrays = $results->toArray();
```

## Available Providers

| Provider | Credentials | Countries | Notes |
|---|---|---|---|
| **Zippopotamus** | None | Multiple | Free, no API key required. Default fallback. |
| **GeoNames** | `username` | Multiple | Free account at [geonames.org](https://www.geonames.org/) |
| **Zipcodebase** | `api_key` | Multiple | API key from [zipcodebase.com](https://zipcodebase.com/) |
| **Zipcodestack** | `api_key` | Multiple | API key from [zipcodestack.com](https://zipcodestack.com/) |
| **JP Postal Code** | None | Japan only | Supports `en` and `ja` locales |

## Custom Providers

Create a class implementing `Pralhad\Zipcoder\Contract\Provider`:

```php
namespace App\Zipcoder;

use Pralhad\Zipcoder\Contract\Provider;
use Pralhad\Zipcoder\Query;
use Pralhad\Zipcoder\Result\AddressCollection;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;

class MyProvider implements Provider
{
    public function __construct(
        private ClientInterface $client,
        private RequestFactoryInterface $requestFactory,
        private string $api_url,
    ) {}

    public function lookup(Query $query): AddressCollection
    {
        // Your implementation
    }

    public function getName(): string
    {
        return 'my-provider';
    }
}
```

Register it in the config:

```php
'providers' => [
    // ... built-in providers

    'my-provider' => [
        'class' => \App\Zipcoder\MyProvider::class,
        'enabled' => true,
        'api_url' => 'https://api.example.com',
    ],
],

'chain' => [
    'my-provider', // Add to chain order
    'zippopotamus',
    // ...
],
```

The `$client` and `$requestFactory` are injected automatically. Extra config keys (like `api_url`) are passed as constructor parameters.

## Caching

Caching is enabled by default with a 24-hour TTL. Results are cached per postal code and country code using Laravel's cache store.

To disable caching:

```env
ZIPCODER_CACHE_ENABLED=false
```

To change TTL (in seconds):

```env
ZIPCODER_CACHE_TTL=3600
```

To use a specific cache store:

```env
ZIPCODER_CACHE_STORE=redis
```

## Facade API Reference

```php
// Look up addresses for a postal code
Zipcoder::lookup(Query $query): AddressCollection

// Use a specific provider (bypasses chain)
Zipcoder::using(string $providerName): Provider

// Register an additional provider at runtime
Zipcoder::registerProvider(Provider $provider): ZipcoderLookup

// List all registered provider names
Zipcoder::getRegisteredProviders(): array
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover a security vulnerability, please see our [Security Policy](.github/SECURITY.md). Do not open a public issue for security vulnerabilities.

## License

MIT. See [LICENSE](LICENSE) for details.
