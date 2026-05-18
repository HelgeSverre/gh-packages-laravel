# Laravel API Middleware
A Laravel package providing middleware for API enhancement, including trust proxies, no-cache enforcement, and SSL requirement validation.

[![Latest Stable Version](https://img.shields.io/packagist/v/aporat/laravel-api-middleware.svg?style=flat-square&logo=composer)](https://packagist.org/packages/aporat/laravel-api-middleware)
[![Monthly Downloads](https://img.shields.io/packagist/dm/aporat/laravel-api-middleware.svg?style=flat-square&logo=composer)](https://packagist.org/packages/aporat/laravel-api-middleware)
[![Codecov](https://img.shields.io/codecov/c/github/aporat/laravel-api-middleware?style=flat-square)](https://codecov.io/github/aporat/laravel-api-middleware)
[![Laravel Version](https://img.shields.io/badge/Laravel-13.x-orange.svg?style=flat-square)](https://laravel.com/docs/13.x)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/aporat/laravel-api-middleware/ci.yml?style=flat-square)
[![License](https://img.shields.io/packagist/l/aporat/laravel-api-middleware.svg?style=flat-square)](https://github.com/aporat/laravel-api-middleware/blob/master/LICENSE)

A Laravel package offering middleware to enhance API security and performance with trust proxies, cache prevention, and SSL enforcement.

## Requirements
- **PHP**: 8.4, 8.5
- **Laravel**: 13.x

## Installation
Install the package via [Composer](https://getcomposer.org/):

```bash
composer require aporat/laravel-api-middleware
```

The service provider (`ApiMiddlewareServiceProvider`) is automatically registered via Laravel's package discovery. If auto-discovery is disabled, add it to `config/app.php`:

```php
'providers' => [
    // ...
    Aporat\\Laravel\\ApiMiddleware\\ApiMiddlewareServiceProvider::class,
],
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Aporat\\Laravel\\ApiMiddleware\\ApiMiddlewareServiceProvider" --tag="config"
```

This copies \`api-middleware.php\` to your `config/` directory.

## Configuration

Edit \`config/api-middleware.php\` to customize the middleware settings:

```php
<?php

return [
    'trust_proxies' => [
        'proxies' => ['127.0.0.1', '10.0.0.0/24', '10.0.0.0/8'],
        'headers' => \\Symfony\\Component\\HttpFoundation\\Request::HEADER_X_FORWARDED_AWS_ELB,
    ],
    'no_cache' => [
        'cache_control' => 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
        'pragma' => 'no-cache',
    ],
    'ssl_required' => [
        'except_routes' => ['/ping'],
        'except_environments' => ['development', 'local'],
    ],
];
```

- **`trust_proxies`**: Defines trusted proxy IPs or CIDR ranges and headers for proxy trust (e.g., AWS ELB).
- **`no_cache`**: Sets `Cache-Control` and `Pragma` headers to prevent caching.
- **`ssl_required`**: Configures routes and environments exempt from SSL enforcement.

## Usage

### Middleware
Apply the middleware to routes using their aliases:

```php
// routes/api.php
Route::middleware(['trust.proxies', 'no.cache', 'ssl.required'])->get('/test', function () {
    return response()->json(['message' => 'API Enhanced!']);
});
```

- **`trust.proxies`**: Trusts specified proxies for accurate request data (e.g., IP addresses).
- **`no.cache`**: Prevents caching of API responses.
- **`ssl.required`**: Enforces HTTPS, throwing an exception for non-secure requests (except exempted routes/environments).

### Manual Instantiation
Resolve an instance with custom settings in a controller or service:

```php
use Aporat\\Laravel\\ApiMiddleware\\TrustProxies;
use Aporat\\Laravel\\ApiMiddleware\\NoCache;
use Aporat\\Laravel\\ApiMiddleware\\SSLRequired;

$trustProxies = new TrustProxies(['192.168.1.1']);
$noCache = new NoCache('no-cache, max-age=0', 'no-store');
$sslRequired = new SSLRequired(['/custom'], ['testing']);

$response = $trustProxies->handle($request, function ($req) use ($noCache, $sslRequired) {
    return $noCache->handle($req, function ($req) use ($sslRequired) {
        return $sslRequired->handle($req, fn($req) => response()->json(['message' => 'API Enhanced!']));
    });
});
```

Or use dependency injection (requires binding adjustment in the service provider):

```php
use Aporat\\Laravel\\ApiMiddleware\\TrustProxies;
use Illuminate\\Http\\Request;

class ApiController extends Controller
{
    public function handleRequest(Request $request, TrustProxies $trustProxies)
    {
        return $trustProxies->handle($request, fn($req) => response()->json(['message' => 'Proxies Trusted!']));
    }
}
```

## Testing
Run the package's unit tests:

```bash
vendor/bin/phpunit
```

With coverage:

```bash
vendor/bin/phpunit --coverage-text --coverage-clover coverage.xml --log-junit junit.xml
```

Requires Xdebug or PCOV for coverage reports.

## Contributing
Contributions are welcome! Please:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License
This package is open-sourced under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for details.

## Support
- **Issues**: [github.com/aporat/laravel-api-middleware/issues](https://github.com/aporat/laravel-api-middleware/issues)
- **Source**: [github.com/aporat/laravel-api-middleware](https://github.com/aporat/laravel-api-middleware)
