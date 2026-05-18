# Laravel IP Access Control

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Laravel package to control system access via IP address whitelist or blacklist, configurable through the `.env` file.

## Features

- ✅ **Whitelist** mode support (only specified IPs can access)
- ✅ **Blacklist** mode support (all IPs can access except those specified)
- ✅ Simple configuration via `.env` file
- ✅ Support for **wildcards** (e.g., `192.168.1.*`)
- ✅ Support for **CIDR notation** (e.g., `192.168.1.0/24`)
- ✅ Proxy and load balancer management (X-Forwarded-For)
- ✅ **HTTP 403 Forbidden** response when access is denied
- ✅ Middleware applicable globally, per route group, or single route

## Requirements

- PHP >= 7.4
- Laravel >= 8.0

## Installation

### 1. Package Installation

If the package is hosted on Packagist:

```bash
composer require rboschin/laravel-ip-access
composer update
```

If you are using a local repository, add it to your Laravel project's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../packages/laravel-ip-access"
        }
    ],
    "require": {
        "rboschin/laravel-ip-access": "*"
    }
}
```
or

```bash
composer config repositories.laravel-ip-access path ../packages/laravel-ip-access
composer require rboschin/laravel-ip-access:@dev
```

Then run:

```bash
composer update
```

### 2. Configuration Publication (Optional)

If you wish to customize the configuration, publish the config file:

```bash
php artisan vendor:publish --tag=ip-access-config
```

This will create the `config/ip-access.php` file.

## Configuration

### .env File

Add the following variables to your `.env` file:

#### Whitelist Mode

```env
# Mode: whitelist or blacklist
IP_ACCESS_MODE=whitelist

# List of allowed IPs (comma-separated)
IP_WHITELIST=127.0.0.1,192.168.1.100,10.0.0.*,172.16.0.0/12

# Optional custom access denied message
IP_ACCESS_FORBIDDEN_MESSAGE="Access denied. Your IP is not authorized."

# Optional trust proxies for X-Forwarded-For (default: true)
IP_ACCESS_TRUST_PROXIES=true
```

#### Blacklist Mode

```env
# Mode: whitelist or blacklist
IP_ACCESS_MODE=blacklist

# List of blocked IPs (comma-separated)
IP_BLACKLIST=123.45.67.89,98.76.54.32,192.168.100.*

# Optional custom access denied message
IP_ACCESS_FORBIDDEN_MESSAGE="Access denied. Your IP has been blocked."
```

### Supported IP Formats

- **Exact IP**: `192.168.1.100`
- **Wildcard**: `192.168.1.*` (all IPs from 192.168.1.0 to 192.168.1.255)
- **CIDR**: `192.168.1.0/24` (Standard CIDR notation)

## Usage

### Global Middleware Application

To apply IP control to all routes, add the middleware in `app/Http/Kernel.php`:

```php
protected $middleware = [
    // ...
    \Rboschin\LaravelIpAccess\Middleware\CheckIpAccess::class,
];
```

### Route Group Application

```php
// routes/web.php
Route::middleware(['ip.access'])->group(function () {
    Route::get('/admin', [AdminController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
```

### Single Route Application

```php
// routes/web.php
Route::get('/admin', [AdminController::class, 'index'])->middleware('ip.access');
```

### Conditional Application

You can also apply the middleware only in certain environments:

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        // ...
    ],
    
    'admin' => [
        // admin middlewares
        env('APP_ENV') === 'production' ? \Rboschin\LaravelIpAccess\Middleware\CheckIpAccess::class : null,
    ],
];
```

## Configuration Examples

### Example 1: Localhost only in development

```env
IP_ACCESS_MODE=whitelist
IP_WHITELIST=127.0.0.1,::1
```

### Example 2: Blocking specific IPs

```env
IP_ACCESS_MODE=blacklist
IP_BLACKLIST=123.45.67.89,98.76.54.32
```

### Example 3: Allowing only company network

```env
IP_ACCESS_MODE=whitelist
IP_WHITELIST=192.168.1.0/24,10.0.0.0/8
```

### Example 4: Allowing ranges with wildcard

```env
IP_ACCESS_MODE=whitelist
IP_WHITELIST=192.168.1.*,192.168.2.*,127.0.0.1
```

## Testing

To test the middleware, you can simulate different IPs:

```bash
# Test with curl specifying the IP
curl -H "X-Forwarded-For: 192.168.1.100" http://yourdomain.test/admin
```

Or create a PHPUnit test:

```php
public function test_ip_whitelist_blocks_unauthorized_ip()
{
    config(['ip-access.mode' => 'whitelist']);
    config(['ip-access.whitelist' => ['192.168.1.100']]);
    
    $response = $this->get('/admin', ['REMOTE_ADDR' => '10.0.0.1']);
    
    $response->assertStatus(403);
}

public function test_ip_whitelist_allows_authorized_ip()
{
    config(['ip-access.mode' => 'whitelist']);
    config(['ip-access.whitelist' => ['192.168.1.100']]);
    
    $response = $this->get('/admin', ['REMOTE_ADDR' => '192.168.1.100']);
    
    $response->assertStatus(200);
}
```

## How it works

1. The `CheckIpAccess` middleware intercepts every request
2. It retrieves the client's IP (considering X-Forwarded-For if configured)
3. It checks if the IP is allowed or blocked based on the configured mode
4. If access is denied, it returns an HTTP 403 Forbidden response
5. If access is allowed, it passes the request to the next middleware

## Security

- Ensure you correctly configure `IP_ACCESS_TRUST_PROXIES` based on your environment
- If using a load balancer or proxy, set `IP_ACCESS_TRUST_PROXIES=true`
- If the application is directly exposed, set `IP_ACCESS_TRUST_PROXIES=false` to avoid spoofing

## License

MIT License. See the [LICENSE](LICENSE) file for more details.

## Author

Roberto Boschin

## Support

For bugs, feature requests, or questions, please open an issue on GitHub.
