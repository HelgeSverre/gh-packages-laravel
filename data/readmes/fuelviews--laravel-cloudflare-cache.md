# Laravel Cloudflare Cache

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-cloudflare-cache.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-cloudflare-cache)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-cloudflare-cache/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-cloudflare-cache/actions/workflows/run-tests.yml?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-cloudflare-cache/php-cs-fixer.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-cloudflare-cache/actions/workflows/php-cs-fixer.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-cloudflare-cache.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-cloudflare-cache)
[![PHP Version](https://img.shields.io/badge/PHP-^8.3-blue.svg?style=flat-square)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-^10|^11|^12-red.svg?style=flat-square)](https://laravel.com)

A powerful and intuitive Laravel package for managing Cloudflare cache purging directly from your Laravel application. Streamline your cache management workflow with comprehensive commands, validation, and seamless integration.

## 📋 Requirements

- PHP 8.3+
- Laravel 10.x, 11.x, or 12.x
- Cloudflare account with API access

## 🚀 Installation

Install the package via Composer:

```bash
composer require fuelviews/laravel-cloudflare-cache
```

### Quick Setup

Run the install command for guided setup:

```bash
php artisan cloudflare-cache:install
```

This will:
- Publish the configuration file
- Guide you through credential setup
- Validate your configuration
- Provide helpful next steps

### Manual Setup

Alternatively, you can manually publish the configuration:

```bash
# Publish configuration
php artisan vendor:publish --tag="cloudflare-cache-config"

# Publish service provider for advanced customization (optional)
php artisan vendor:publish --tag="cloudflare-cache-provider"
```

## ⚙️ Configuration

### Environment Variables

Add your Cloudflare credentials to your `.env` file:

```env
# Required
CLOUDFLARE_CACHE_API_KEY=your_api_key_here
CLOUDFLARE_CACHE_ZONE_ID=your_zone_id_here

# Optional
CLOUDFLARE_CACHE_DEBUG=false
```

### Getting Your Cloudflare Credentials

1. **API Key**: Create an API token at [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Use the "Custom token" option
   - Required permissions: `Zone:Zone:Read`, `Zone:Cache Purge:Edit`
   - Zone Resources: Include specific zones or all zones

2. **Zone ID**: Find your Zone ID in your Cloudflare dashboard
   - Go to your domain overview
   - Find "Zone ID" in the right sidebar
   - It's a 32-character hexadecimal string

### Configuration File

The published configuration file `config/cloudflare-cache.php`:

```php
<?php

return [
    /**
     * Generate zone or global api key.
     *
     * @see https://dash.cloudflare.com/profile/api-tokens
     */
    'api_key' => env('CLOUDFLARE_CACHE_API_KEY'),

    /**
     * The zone_id of your site on cloudflare dashboard.
     */
    'identifier' => env('CLOUDFLARE_CACHE_ZONE_ID'),

    /**
     * Debug mode.
     */
    'debug' => env('CLOUDFLARE_CACHE_DEBUG', false),
];
```

## 🎯 Basic Usage

### Using the Facade

```php
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

// Purge everything from Cloudflare cache
$result = CloudflareCache::purgeEverything();

if ($result !== false) {
    // Cache purged successfully
    // $result contains the purge operation ID
    echo "Cache purged successfully. Operation ID: {$result}";
} else {
    // Purge failed
    echo "Failed to purge cache";
}
```

### Using Dependency Injection

```php
use Fuelviews\CloudflareCache\CloudflareCacheInterface;

class CacheController extends Controller
{
    public function clearCache(CloudflareCacheInterface $cloudflareCache)
    {
        try {
            $result = $cloudflareCache->purgeEverything();
            
            if ($result !== false) {
                return response()->json([
                    'message' => 'Cache purged successfully',
                    'operation_id' => $result
                ]);
            }
            
            return response()->json(['message' => 'Failed to purge cache'], 500);
            
        } catch (\Fuelviews\CloudflareCache\Exceptions\CloudflareCacheRequestException $e) {
            return response()->json([
                'message' => 'Cache purge failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Environment-Aware Functionality

The package includes smart environment detection:

```php
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

// Check if cache purging should be performed
if (CloudflareCache::ive()) {
    $result = CloudflareCache::purgeEverything();
}
```

The `ive()` method returns `true` when:
- Running unit tests
- Debug mode is enabled (`CLOUDFLARE_CACHE_DEBUG=true`)
- Application is in production environment and credentials are configured

## 🛠️ Artisan Commands

### Cache Clear Command

Purge all Cloudflare cache:

```bash
php artisan cloudflare-cache:clear
```

**Success Output:**
```
Cloudflare cache successfully purged.
```

**Error Output:**
```
Error purging Cloudflare cache: Invalid API Token
```

### Validate Configuration

Check your configuration for issues:

```bash
php artisan cloudflare-cache:validate
```

**Successful validation:**
```
Validating Cloudflare Cache configuration...
✅ All configuration checks passed!
```

**With errors:**
```
Validating Cloudflare Cache configuration...

❌ Configuration Errors:
   • API Key is required. Set CLOUDFLARE_CACHE_API_KEY in your .env file.
   • Zone ID format appears invalid. Should be a 32-character hexadecimal string.

⚠️  Configuration Warnings:
   • Debug mode is enabled in production environment. Consider disabling it.

❌ Configuration validation failed. Please fix the errors above.
```

### Check Status

Test your API connection and configuration:

```bash
php artisan cloudflare-cache:status
```

**Successful status check:**
```
Checking Cloudflare Cache configuration and API connection...
✅ Configuration found:
   API Key: ************************abc12345
   Zone ID: 1234567890abcdef1234567890abcdef
   Debug Mode: disabled

🔍 Testing API connection...
✅ API connection successful
📡 Ready to purge Cloudflare cache
```

**With configuration issues:**
```
Checking Cloudflare Cache configuration and API connection...
❌ API Key not configured. Set CLOUDFLARE_CACHE_API_KEY in your .env file.
```

## 🎛️ Advanced Usage

### Integration with Events

Clear cache automatically when content changes:

```php
use Illuminate\Support\Facades\Event;
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

// In your EventServiceProvider or wherever you register listeners
Event::listen('content.updated', function () {
    if (CloudflareCache::ive()) {
        CloudflareCache::purgeEverything();
    }
});
```

### Using in Queue Jobs

For better performance, queue cache purging operations:

```php
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

class PurgeCloudflareCache implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function handle()
    {
        try {
            $result = CloudflareCache::purgeEverything();
            
            if ($result !== false) {
                logger()->info("Cloudflare cache purged successfully", [
                    'operation_id' => $result
                ]);
            } else {
                $this->fail('Failed to purge Cloudflare cache');
            }
        } catch (\Exception $e) {
            logger()->error('Cloudflare cache purge failed', [
                'error' => $e->getMessage()
            ]);
            $this->fail($e);
        }
    }
}

// Dispatch the job
PurgeCloudflareCache::dispatch();
```

### Custom Service Provider

Publish and customize the service provider:

```bash
php artisan vendor:publish --tag="cloudflare-cache-provider"
```

This publishes `CloudflareCacheServiceProvider` to your `app/Providers` directory for customization.

### Middleware Integration

Create middleware to automatically purge cache:

```php
use Closure;
use Illuminate\Http\Request;
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

class PurgeCloudflareMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        
        // Purge cache on successful POST/PUT/DELETE requests
        if ($request->isMethod(['post', 'put', 'delete']) && $response->isSuccessful()) {
            if (CloudflareCache::ive()) {
                CloudflareCache::purgeEverything();
            }
        }
        
        return $response;
    }
}
```

## 🛡️ Exception Handling

The package provides comprehensive error handling:

```php
use Fuelviews\CloudflareCache\Facades\CloudflareCache;
use Fuelviews\CloudflareCache\Exceptions\CloudflareCacheRequestException;

try {
    $result = CloudflareCache::purgeEverything();
    
    if ($result !== false) {
        // Success - $result contains operation ID
        logger()->info('Cache purged', ['operation_id' => $result]);
    } else {
        // API returned success: false
        logger()->warning('Cache purge returned false');
    }
    
} catch (CloudflareCacheRequestException $e) {
    // Handle Cloudflare API errors
    logger()->error('Cloudflare cache purge failed', [
        'message' => $e->getMessage(),
        'status_code' => $e->getCode(),
    ]);
    
    // Exception message format: "Request error: [API Error Message] | Code: [Error Code]"
    // You can parse this for specific error handling
}
```

## 🧪 Testing

### Running Package Tests

```bash
# Run all tests
composer test

# Run tests with coverage
composer test-coverage

# Code style formatting
composer format
```

### Testing in Your Application

The package automatically handles testing environments:

```php
use Fuelviews\CloudflareCache\Facades\CloudflareCache;

class CloudflareCacheTest extends TestCase
{
    public function test_cache_purging_works_in_tests()
    {
        // This returns true in testing environment
        $this->assertTrue(CloudflareCache::ive());
        
        // This succeeds without making actual API calls
        $result = CloudflareCache::purgeEverything();
        $this->assertTrue($result);
    }
    
    public function test_cache_purging_integration()
    {
        // Mock the facade for specific behavior
        CloudflareCache::shouldReceive('purgeEverything')
            ->once()
            ->andReturn('operation-id-12345');
            
        $response = $this->post('/admin/clear-cache');
        
        $response->assertStatus(200)
                 ->assertJson(['operation_id' => 'operation-id-12345']);
    }
}
```

### Feature Testing

```php
public function test_cache_clearing_endpoint()
{
    // Test your cache clearing endpoint
    $response = $this->actingAs($admin)
                     ->post('/admin/cache/clear');
    
    $response->assertStatus(200)
             ->assertJson(['message' => 'Cache purged successfully']);
}
```

## 🐛 Troubleshooting

### Common Issues

**❌ "API Key not configured"**
- Ensure `CLOUDFLARE_CACHE_API_KEY` is set in your `.env` file
- Run `php artisan config:clear` after updating environment variables
- Verify the API key has proper permissions

**❌ "Zone ID format appears invalid"**
- Zone IDs should be exactly 32 characters (hexadecimal)
- Check your Cloudflare dashboard for the correct Zone ID
- Ensure no extra spaces or characters

**❌ "Request error: Invalid API Token"**
- Verify your API token has the required permissions:
  - `Zone:Zone:Read`
  - `Zone:Cache Purge:Edit`
- Check that the token hasn't expired
- Ensure the token is active in your Cloudflare dashboard

**❌ "Request error: Zone not found"**
- Verify the Zone ID matches your domain
- Ensure the API token has access to the specified zone
- Check that the zone is active in Cloudflare

### Debug Mode

Enable debug mode for detailed information:

```env
CLOUDFLARE_CACHE_DEBUG=true
```

With debug mode enabled:
- Cache purging works in all environments
- Additional logging information is available
- The `ive()` method always returns `true`

### Validation Commands

Use built-in validation to diagnose issues:

```bash
# Comprehensive configuration check
php artisan cloudflare-cache:validate

# API connection test
php artisan cloudflare-cache:status
```

### Logging

Check Laravel logs for detailed error information:

```bash
# View recent logs
tail -f storage/logs/laravel.log

# Search for Cloudflare-related logs
grep -i "cloudflare" storage/logs/laravel.log
```

## 📚 API Reference

### CloudflareCacheInterface

#### `purgeEverything(): bool|string`
Purges all cache from Cloudflare for the configured zone.

**Returns:**
- `string`: Operation ID on success
- `false`: On failure (when API returns success: false)

**Throws:**
- `CloudflareCacheRequestException`: When API request fails

#### `ive(): bool`
Determines if cache purging should be performed based on environment and configuration.

**Returns:**
- `true`: When cache purging should be performed
- `false`: When cache purging should be skipped

### Available Commands

| Command | Description |
|---------|-------------|
| `cloudflare-cache:install` | Guided installation process |
| `cloudflare-cache:clear` | Purge all Cloudflare cache |
| `cloudflare-cache:validate` | Validate configuration settings |
| `cloudflare-cache:status` | Check API connection and configuration |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/fuelviews/laravel-cloudflare-cache.git
cd laravel-cloudflare-cache
composer install
composer test
```

## 📄 Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## 🔐 Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## 👨‍💻 Credits

- [Joshua Mitchener](https://github.com/thejmitchener)
- [Sweatybreeze](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
- [Yediyuz](https://github.com/yediyuz)
- [Mertasan](https://github.com/mertasan)
- [All Contributors](../../contributors)

## 📜 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

<div align="center">
    <p>Built with ❤️ by the <a href="https://fuelviews.com">Fuelviews</a> team</p>
    <p>
        <a href="https://github.com/fuelviews/laravel-cloudflare-cache">⭐ Star us on GitHub</a> •
        <a href="https://packagist.org/packages/fuelviews/laravel-cloudflare-cache">📦 View on Packagist</a>
    </p>
</div>
