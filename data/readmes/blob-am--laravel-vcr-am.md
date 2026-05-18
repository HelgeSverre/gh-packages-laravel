# Laravel adapter for the VCR.AM PHP SDK

[![Packagist Version](https://img.shields.io/packagist/v/blob-solutions/laravel-vcr-am.svg)](https://packagist.org/packages/blob-solutions/laravel-vcr-am)
[![PHP Version Require](https://img.shields.io/packagist/dependency-v/blob-solutions/laravel-vcr-am/php)](https://packagist.org/packages/blob-solutions/laravel-vcr-am)
[![License](https://img.shields.io/packagist/l/blob-solutions/laravel-vcr-am.svg)](LICENSE)
[![CI](https://github.com/blob-am/vcr-am-php/actions/workflows/ci.yml/badge.svg)](https://github.com/blob-am/vcr-am-php/actions/workflows/ci.yml)

A thin Laravel adapter around [`blob-solutions/vcr-am-sdk`](https://packagist.org/packages/blob-solutions/vcr-am-sdk). Wires the SDK's `VcrClient` into Laravel's container, publishes a config file, exposes a facade, and registers an Artisan health-check command.

The adapter contains **zero business logic** — every API call goes straight through to the SDK. If the SDK supports it, the adapter exposes it.

## Requirements

- PHP **8.2 or newer**
- Laravel **11.x or 12.x**
- A VCR.AM account and API key — sign up at [vcr.am](https://vcr.am)

## Installation

```bash
composer require blob-solutions/laravel-vcr-am
```

The service provider and facade are auto-discovered.

Add your API key to `.env`:

```env
VCR_AM_API_KEY=your-api-key-here
```

That's it — the package is ready to use.

## Configuration

To customise the configuration (e.g. point at a staging environment), publish the config file:

```bash
php artisan vendor:publish --tag=vcr-am-config
```

This creates `config/vcr-am.php`:

```php
return [
    'api_key' => env('VCR_AM_API_KEY'),
    'base_url' => env('VCR_AM_BASE_URL'), // null = SDK default (https://vcr.am/api/v1)
];
```

## Usage

### Via the facade

```php
use BlobSolutions\LaravelVcrAm\Facades\VcrAm;
use BlobSolutions\VcrAm\Input\RegisterSaleInput;

$response = VcrAm::registerSale(new RegisterSaleInput(/* ... */));
```

### Via dependency injection

```php
use BlobSolutions\VcrAm\VcrClient;

class CheckoutController
{
    public function __construct(private readonly VcrClient $vcr) {}

    public function __invoke(): RedirectResponse
    {
        $response = $this->vcr->registerSale(/* ... */);
        // ...
    }
}
```

`VcrClient` is bound as a singleton, so the same instance is reused for the lifetime of every request.

### Via the container

```php
$client = app(VcrClient::class);
```

## Health check

To verify connectivity from a running app or as part of your deployment pipeline:

```bash
php artisan vcr-am:health
```

```
VCR.AM API reachable. Found 3 cashier(s).
```

Exit code is `0` on success, `1` on failure (with the SDK's error message printed).

## Logging

The package forwards Laravel's PSR-3 logger into the SDK automatically. Every request and response is logged at the level configured in your `config/logging.php`. To filter only VCR.AM log entries, give the SDK its own channel:

```php
// config/logging.php
'channels' => [
    'vcr-am' => [
        'driver' => 'daily',
        'path' => storage_path('logs/vcr-am.log'),
        'days' => 14,
    ],
],
```

```php
// AppServiceProvider::register()
$this->app->bind(\Psr\Log\LoggerInterface::class, fn () => Log::channel('vcr-am'));
```

## HTTP client override

The SDK ships with Guzzle 7 by default. To swap it (e.g. for testing or to use a shared HTTP client with custom retry policies), bind a PSR-18 implementation in your `AppServiceProvider`:

```php
$this->app->bind(\Psr\Http\Client\ClientInterface::class, fn () => new MyHttpClient());
```

The adapter detects this binding and passes it into the SDK constructor.

## Documentation for SDK methods

See the [SDK README](https://github.com/blob-am/vcr-am-sdk-php) for every endpoint, every input DTO, and every response type. The Laravel adapter is a 1:1 wrapper — anything documented for `VcrClient` works through the facade or container binding.

## Status

> **Pre-release.** API tracks the SDK's `0.x` releases. Pin tightly until `1.0`.

## License

[ISC](LICENSE)
