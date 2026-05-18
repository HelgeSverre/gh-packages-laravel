# Laravel Cache Groups

[![Latest Version on Packagist](https://img.shields.io/packagist/v/erjon/laravel-cache-groups.svg?style=flat-square)](https://packagist.org/packages/erjon/laravel-cache-groups)
[![Total Downloads](https://img.shields.io/packagist/dt/erjon/laravel-cache-groups.svg?style=flat-square)](https://packagist.org/packages/erjon/laravel-cache-groups)

A Laravel package that adds `cache()->groups()` functionality to cache drivers that don't support `cache()->tags()`. This package provides a drop-in replacement for cache tags, making it work with **all** cache drivers including File, Database, and others that lack native tagging support.

## Features

- **Universal Support**: Works with all Laravel cache drivers (File, Database, Redis, Memcached, etc.)
- **Drop-in Replacement**: Identical API to `cache()->tags()` - just replace `tags()` with `groups()`
- **Native Fallback**: Automatically uses native `tags()` when available for optimal performance
- **Laravel 7+**: Supports Laravel 7.x through 11.x

## Why Cache Groups?

Laravel's `cache()->tags()` is powerful but only works with Redis, Memcached, and Array cache drivers. If you're using File or Database drivers, calling `tags()` throws a `BadMethodCallException`.

**Cache Groups** solves this by:
- Tracking cache keys explicitly for each group
- Enabling selective cache invalidation (flush by group)
- Providing the same API experience across all cache drivers
- Automatically falling back to native tags when supported

### Comparison: Cache Tags vs Cache Groups

| Feature | `cache()->tags()` | `cache()->groups()` |
|---------|-------------------|---------------------|
| **File Driver Support** | ❌ No | ✅ Yes |
| **Database Driver Support** | ❌ No | ✅ Yes |
| **Redis Support** | ✅ Yes | ✅ Yes (delegates to tags) |
| **Memcached Support** | ✅ Yes | ✅ Yes (delegates to tags) |
| **Array Driver Support** | ✅ Yes | ✅ Yes (delegates to tags) |
| **API Compatibility** | Standard | 100% Compatible |
| **Performance on Redis** | Optimal | Optimal (uses native tags) |
| **Performance on File** | N/A | Good (explicit tracking) |
| **Laravel Version** | 5.8+ | 7.0+ |
| **Migration Effort** | N/A | Replace `tags()` with `groups()` |

## Installation

Install the package via Composer:

```bash
composer require erjon/laravel-cache-groups
```

The package will automatically register itself via Laravel's package auto-discovery.

### Manual Registration (Laravel 5.x - 6.x)

If using older Laravel versions without auto-discovery, add the service provider to `config/app.php`:

```php
'providers' => [
    // ...
    Erjon\CacheGroups\Providers\CacheGroupsServiceProvider::class,
],
```

## Usage

### Basic Usage

The API is identical to Laravel's `cache()->tags()`:

```php
use Illuminate\Support\Facades\Cache;

// Store a value in a group
Cache::groups(['products'])->put('item:1', $product, 3600);

// Retrieve a value
$product = Cache::groups(['products'])->get('item:1');

// Store with multiple groups
Cache::groups(['products', 'featured'])->put('item:1', $product, 3600);

// Flush all items in a group
Cache::groups(['products'])->flush();
```

### Available Methods

All standard Laravel cache methods are supported:

```php
// Store items
Cache::groups(['products'])->put('key', 'value', $seconds);
Cache::groups(['products'])->forever('key', 'value');
Cache::groups(['products'])->add('key', 'value', $seconds);
Cache::groups(['products'])->putMany(['key1' => 'value1', 'key2' => 'value2'], $seconds);

// Retrieve items
Cache::groups(['products'])->get('key');
Cache::groups(['products'])->get('key', 'default');
Cache::groups(['products'])->many(['key1', 'key2']);
Cache::groups(['products'])->has('key');

// Remember pattern
Cache::groups(['products'])->remember('key', $seconds, function () {
    return expensive_computation();
});

Cache::groups(['products'])->rememberForever('key', function () {
    return expensive_computation();
});

// Increment/Decrement
Cache::groups(['products'])->increment('counter', 1);
Cache::groups(['products'])->decrement('counter', 1);

// Remove items
Cache::groups(['products'])->forget('key');
Cache::groups(['products'])->flush(); // Flush entire group
```

### Variadic Group Syntax

You can also pass groups as separate arguments:

```php
// These are equivalent:
Cache::groups(['products', 'featured'])->put('key', 'value', 3600);
Cache::groups('products', 'featured')->put('key', 'value', 3600);
```

## How It Works

### For Drivers Without Tag Support (File, Database)

Cache Groups tracks all keys belonging to each group:

1. When you store a value: `Cache::groups(['products'])->put('item:1', $data, 3600)`
   - The key `item:1` is added to the `products` group's key list
   - This list is stored in the cache at `group:products:keys`

2. When you flush a group: `Cache::groups(['products'])->flush()`
   - All keys in the group's list are deleted
   - The group's key list itself is cleared

3. When you forget a key: `Cache::groups(['products'])->forget('item:1')`
   - The key is removed from the cache
   - The key is removed from all group membership lists (prevents memory leaks)

### For Drivers With Tag Support (Redis, Memcached, Array)

The package automatically detects if the cache driver supports tags and delegates to the native `tags()` implementation for better performance:

```php
// On Redis/Memcached, this internally calls cache()->tags()
Cache::groups(['products'])->put('item:1', $data, 3600);
```

This ensures you get the best possible performance while maintaining API consistency.

## Migration from Tags to Groups

If you're currently using `cache()->tags()` with Redis/Memcached and want to support File/Database drivers, simply replace `tags()` with `groups()`:

**Before:**
```php
Cache::tags(['products'])->put('item:1', $data, 3600);
$data = Cache::tags(['products'])->get('item:1');
Cache::tags(['products'])->flush();
```

**After:**
```php
Cache::groups(['products'])->put('item:1', $data, 3600);
$data = Cache::groups(['products'])->get('item:1');
Cache::groups(['products'])->flush();
```

That's it! Your code now works with all cache drivers.

## Performance Considerations

### Key Tracking Overhead

When using drivers without native tag support (File, Database), the package tracks keys explicitly:

- **Storage**: Each group maintains a list of its member keys in the cache
- **Write Operations**: Each `put()`, `forever()`, `add()` adds to the group's key list
- **Flush Operations**: Iterates through all tracked keys to delete them
- **Memory**: Large groups (10,000+ keys) may impact memory usage

### Best Practices

1. **Use Native Tags When Possible**: If you're on Redis/Memcached, consider using `cache()->tags()` directly for maximum performance

2. **Limit Group Size**: Try to keep groups under 10,000 keys for optimal performance

3. **Group Strategically**: Organize your cache into logical groups that are flushed together
   ```php
   // Good: Specific, manageable groups
   Cache::groups(['user:123'])->put('profile', $data, 3600);
   Cache::groups(['user:123'])->put('settings', $data, 3600);
   
   // Less optimal: One massive group
   Cache::groups(['all-data'])->put('random:key:' . $id, $data, 3600);
   ```

4. **Clean Up Manually**: While the package removes keys from groups when using `forget()`, expired keys will remain in group lists until the group is flushed. Consider periodic group flushes for long-lived groups with high churn.

## Testing

Run the test suite:

```bash
composer install
vendor/bin/phpunit
```

## Requirements

- PHP 7.2 or higher
- Laravel 7.x, 8.x, 9.x, 10.x, or 11.x

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Changelog

### 1.0.0 - Initial Release

- Initial release with full cache groups support
- Support for Laravel 7+ and all cache drivers
- Automatic fallback to native tags when available
- Comprehensive test suite
