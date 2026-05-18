![locky-image.png](locky-image.png)

# A simple Laravel package for distributed lock

[![Latest Version on Packagist](https://img.shields.io/packagist/v/andp97/laravel-locky.svg?style=flat-square)](https://packagist.org/packages/andp97/laravel-locky)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/andp97/laravel-locky/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/andp97/laravel-locky/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/andp97/laravel-locky/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/andp97/laravel-locky/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/andp97/laravel-locky.svg?style=flat-square)](https://packagist.org/packages/andp97/laravel-locky)

A simple Laravel package for distributed lock around Redis atomic locks with retry + backoff (with jitter). It’s easy to read, chainable, and testable.

## Installation

You can install the package via composer:

```bash
composer require andp97/laravel-locky
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-locky-config"
```

## Usage

### Basic

```php
use Pavons\Locky\Facades\Locky;

$result = Locky::make("widgets:{$id}")
    ->ttl(10)
    ->run(function () use ($id) {
        processWidget($id);
        return true;
    });
```

#### With retries, exponential backoff, and **full jitter**

```php
use Pavons\Locky\Facades\Locky;

Locky::make("widgets:{$orderId}")
    ->ttl(12)
    ->attempts(7)
    ->baseDelayMs(75)     // 75, 150, 300, 600, 1200, 2000…
    ->multiplier(2.0)
    ->maxDelayMs(2000)
    ->jitter('full')      // none|equal|full
    ->onRetry(function ($key, $attempt, $sleepMs) {
        logger()->notice("Retrying lock", compact('key', 'attempt', 'sleepMs'));
    })
    ->onFail(function ($key, $attempts) {
        // Optional graceful fallback
        report(new \RuntimeException("Lock failed for {$key} after {$attempts} attempts"));
        return null; // Returning here prevents throwing; omit to throw
    })
    ->run(function () use ($orderId) {
        settleOrder($orderId);
    });
```

#### In a queued job (recommended)

```php
public function handle(): void
{
    Locky::make("job:import:{$this->batchId}")
        ->ttl(15)
        ->attempts(8)
        ->jitter('equal')
        ->run(function () {
            $this->performImport(); // exclusive section
        });
}
```

### Notes & best practices

- **Use Redis** (`CACHE_DRIVER=redis`) so `Cache::lock()` is truly distributed.
    
- **Pick TTL > worst-case critical section**, but keep it tight; split long work to keep the locked part short.
    
- **Jitter**:
    
    - `full`: best at smoothing thundering herds (default).
        
    - `equal`: narrows variance while avoiding sync.
        
    - `none`: only if you _really_ want deterministic waits.
        
- Hooks (`onRetry`, `onFail`) make it easy to add logs/metrics without cluttering business code.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Andrea Pavone](https://github.com/andp97)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
