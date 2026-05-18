# Laravel Nova Infinite Scroll

[![Latest Version on Packagist](https://img.shields.io/packagist/v/iamgerwin/nova-infinite-scroll.svg?style=flat-square)](https://packagist.org/packages/iamgerwin/nova-infinite-scroll)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/iamgerwin/nova-infinite-scroll/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/iamgerwin/nova-infinite-scroll/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/iamgerwin/nova-infinite-scroll/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/iamgerwin/nova-infinite-scroll/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/iamgerwin/nova-infinite-scroll.svg?style=flat-square)](https://packagist.org/packages/iamgerwin/nova-infinite-scroll)

Seamless infinite scrolling for Laravel Nova resources. Automatically loads more records as users scroll, eliminating traditional pagination and providing a smooth, modern browsing experience. Compatible with Nova 3, 4, and 5.

Perfect for resources with many records where traditional pagination feels clunky. Works harmoniously with filters, search, and sorting – everything just works! ✨

## Features

- 🚀 **Plug & Play**: Add one trait and you're done
- 🎯 **Smart Loading**: Only fetches what's needed, when it's needed
- 🔍 **Filter Friendly**: Works seamlessly with Nova's filters and search
- 🎨 **Theme Aware**: Respects Nova's light and dark modes
- ⚡ **Performance**: Low memory footprint with efficient query building
- 🔧 **Highly Configurable**: Customize per-resource or globally
- 📱 **Touch Optimized**: Smooth scrolling on mobile devices
- 🔄 **Auto-Reset**: Automatically resets on filter/search changes

## Requirements

- PHP 8.2 or higher
- Laravel 9.x, 10.x, 11.x, or 12.x
- Laravel Nova 3.x, 4.x, or 5.x

## Installation

Install the package via composer:

```bash
composer require iamgerwin/nova-infinite-scroll
```

Optionally, publish the configuration file:

```bash
php artisan vendor:publish --tag="nova-infinite-scroll-config"
```

The package automatically registers itself with Nova – no additional setup required!

## Quick Start

### Basic Usage

Add the `HasInfiniteScroll` trait to your Nova Resource:

```php
<?php

namespace App\Nova;

use Iamgerwin\NovaInfiniteScroll\Traits\HasInfiniteScroll;
use Laravel\Nova\Resource;

class User extends Resource
{
    use HasInfiniteScroll;

    // Your resource definition...
}
```

That's it! Your resource now supports infinite scrolling. 🎉

### Configuration

The package includes sensible defaults, but you can customize everything via the config file:

```php
return [
    // Enable/disable infinite scroll globally (not recommended)
    // Set to false to only enable for resources with HasInfiniteScroll trait
    'enabled' => false,

    // Number of records to load per batch
    'per_page' => 25,

    // Distance from bottom (in pixels) to trigger loading
    'threshold' => 200,

    // Customize loading messages
    'loading_text' => 'Loading more records...',
    'end_text' => 'All records loaded',

    // Auto-enable on resource index pages with the trait
    'auto_enable' => true,

    // Exclude specific resources (when global enabled is true)
    'excluded_resources' => [
        // App\Nova\User::class,
    ],
];
```

### Per-Resource Configuration

Override settings for individual resources:

```php
class Article extends Resource
{
    use HasInfiniteScroll;

    public static function infiniteScrollPerPage(): int
    {
        return 50; // Load 50 articles at a time
    }

    public static function infiniteScrollThreshold(): int
    {
        return 300; // Trigger loading 300px from bottom
    }

    public static function infiniteScrollEnabled(): bool
    {
        return auth()->user()->prefersInfiniteScroll ?? true;
    }
}
```

## How It Works

Nova Infinite Scroll uses the Intersection Observer API to detect when users scroll near the bottom of the resource table. When triggered:

1. **Checks State**: Ensures not already loading and more records exist
2. **Fetches Data**: Makes an API request for the next batch of records
3. **Appends Results**: Seamlessly adds new records to the existing list
4. **Repeats**: Continues until all records are loaded

The magic happens behind the scenes with Vue.js components that integrate directly with Nova's resource index pages. Filters, search, and sorting automatically reset the infinite scroll state – no manual intervention needed!

## Advanced Usage

### Conditionally Enable Infinite Scroll

```php
public static function infiniteScrollEnabled(): bool
{
    // Only for admins
    return auth()->user()->isAdmin();

    // Or based on resource count
    // return static::newModel()->count() > 100;
}
```

### Custom Batch Sizes Based on Context

```php
public static function infiniteScrollPerPage(): int
{
    // Smaller batches on mobile
    if (request()->header('User-Agent') && str_contains(request()->header('User-Agent'), 'Mobile')) {
        return 15;
    }

    return 30;
}
```

### Exclude Resources Programmatically

In your `config/nova-infinite-scroll.php`:

```php
'excluded_resources' => [
    \App\Nova\Resources\HeavyResource::class,
    \App\Nova\Resources\RealtimeData::class,
],
```

## Performance Tips

1. **Optimize Your Queries**: Use eager loading to prevent N+1 queries
2. **Index Database Columns**: Ensure frequently filtered/sorted columns are indexed
3. **Adjust Batch Size**: Larger batches = fewer requests, but more data transferred
4. **Use Threshold Wisely**: Lower threshold = earlier loading (smoother UX, more requests)

## Troubleshooting

### Infinite scroll not working?

- **Most Common**: Ensure the `HasInfiniteScroll` trait is added to your Resource
- Check browser console for JavaScript errors
- If using global mode, verify `nova-infinite-scroll.enabled` is `true` in config
- Confirm the resource isn't in `excluded_resources`
- Clear browser cache and reload the page

### Default pagination not working?

If you're experiencing issues with default pagination (clicking "Next" does nothing), ensure you're using the latest version. Versions prior to 1.1.0 had a critical bug that broke pagination for resources without the trait.

### Loading indicator doesn't show?

- Check if Nova's default styles are loaded
- Verify JavaScript assets are being served
- Try clearing Nova's compiled assets: `php artisan nova:publish`

### Performance issues?

- Reduce `per_page` value for fewer records per batch
- Add database indexes on frequently queried columns
- Consider excluding resources with complex computed fields

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Check code style:

```bash
composer format
```

Run static analysis:

```bash
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on recent changes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate and adhere to PSR-12 coding standards.

## Security

If you discover any security-related issues, please email iamgerwin@live.com instead of using the issue tracker.

## Credits

- [Gerwin](https://github.com/iamgerwin) - Creator and maintainer
- Inspired by [Filament Infinite Scroll](https://github.com/fibtegis/filament-infinite-scroll)
- Built with [Spatie's Laravel Package Tools](https://github.com/spatie/laravel-package-tools)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

Made with ❤️ for the Laravel Nova community
