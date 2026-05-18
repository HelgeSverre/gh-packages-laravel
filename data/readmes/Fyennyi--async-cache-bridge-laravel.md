# Async Cache Laravel Bridge

[![Latest Stable Version](https://img.shields.io/packagist/v/fyennyi/async-cache-bridge-laravel.svg?label=Packagist&logo=packagist)](https://packagist.org/packages/fyennyi/async-cache-bridge-laravel)
[![Total Downloads](https://img.shields.io/packagist/dt/fyennyi/async-cache-bridge-laravel.svg?label=Downloads&logo=packagist)](https://packagist.org/packages/fyennyi/async-cache-bridge-laravel)
[![License](https://img.shields.io/packagist/l/fyennyi/async-cache-bridge-laravel.svg?label=Licence&logo=open-source-initiative)](https://packagist.org/packages/fyennyi/async-cache-bridge-laravel)
[![Tests](https://img.shields.io/github/actions/workflow/status/Fyennyi/async-cache-bridge-laravel/phpunit.yml?label=Tests&logo=github)](https://github.com/Fyennyi/async-cache-bridge-laravel/actions/workflows/phpunit.yml)
[![Test Coverage](https://img.shields.io/codecov/c/github/Fyennyi/async-cache-bridge-laravel?label=Test%20Coverage&logo=codecov)](https://app.codecov.io/gh/Fyennyi/async-cache-bridge-laravel)
[![Static Analysis](https://img.shields.io/github/actions/workflow/status/Fyennyi/async-cache-bridge-laravel/phpstan.yml?label=PHPStan&logo=github)](https://github.com/Fyennyi/async-cache-bridge-laravel/actions/workflows/phpstan.yml)

This is a **Laravel Bridge** for the [Async Cache PHP](https://github.com/Fyennyi/async-cache-php) library. It integrates the asynchronous caching manager directly into your Laravel application, utilizing the standard Laravel Cache and Log components.

## Features

- **Automatic Discovery**: Uses Laravel Package Discovery to register the service provider.
- **Seamless Integration**: Automatically injects:
  - `cache.store` (Your default Laravel cache repository, which implements PSR-16).
  - `log` (Laravel Log Manager).
- **Configuration Friendly**: Allows defining global strategies via standard Laravel configuration files.

## Installation

Run the following command in your terminal:

```bash
composer require fyennyi/async-cache-bridge-laravel
```

## Configuration

To customize the configuration, publish the config file using the `vendor:publish` command:

```bash
php artisan vendor:publish --tag=async-cache-config
```

This will create a `config/async-cache.php` file where you can set the default strategy and adapter.

```php
// config/async-cache.php
return [
    'default_strategy' => 'strict', // strict, background, etc.
    'adapter' => 'cache.store',     // The service ID for the cache driver
];
```

## Usage

### Injecting the Manager

The bridge registers the `Fyennyi\AsyncCache\AsyncCacheManager` class as a singleton. You can use dependency injection to access it in your Controllers, Jobs, or Services.

```php
namespace App\Http\Controllers;

use Fyennyi\AsyncCache\AsyncCacheManager;
use Fyennyi\AsyncCache\CacheOptions;
use Illuminate\Http\Request;

class WeatherController extends Controller
{
    public function __construct(
        private AsyncCacheManager $cache
    ) {}

    public function index(string $city)
    {
        $promise = $this->cache->wrap(
            'weather_' . $city,
            fn() => $this->fetchFromApi($city),
            new CacheOptions(ttl: 300)
        );

        // Note: In a standard Laravel FPM request, you might need to wait for the promise.
        // In Swoole/Octane environments, you can handle it asynchronously.

        // Example for sync retrieval:
        return \React\Async\await($promise);
    }

    private function fetchFromApi(string $city) { /* ... */ }
}
```

## Contributing

Contributions are welcome and appreciated! Here's how you can contribute:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## License

This library is licensed under the CSSM Unlimited License v2.0 (CSSM-ULv2). See the [LICENSE](LICENSE) file for details.
