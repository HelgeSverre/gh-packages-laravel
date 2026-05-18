# Laravel Sitemap Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-sitemap.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sitemap)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-sitemap/run-tests.yml?label=tests&style=flat-square)](https://github.com/fuelviews/laravel-sitemap/actions/workflows/run-tests.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-sitemap/php-cs-fixer.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-sitemap/actions/workflows/php-cs-fixer.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-sitemap.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-sitemap)
[![PHP Version](https://img.shields.io/badge/PHP-^8.3-blue.svg?style=flat-square)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-^10|^11|^12-red.svg?style=flat-square)](https://laravel.com)

Laravel Sitemap is a robust and intelligent solution for automatically generating XML sitemaps for your Laravel application. Built on top of Spatie's excellent sitemap package, it provides advanced crawling capabilities, model integration, and flexible configuration options.

## Requirements

- PHP ^8.3
- Laravel ^10.0 || ^11.0 || ^12.0
- Spatie Sitemap ^2.0
- Spatie Crawler ^7.0

## Installation

Install the package via Composer:

```bash
composer require fuelviews/laravel-sitemap
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="sitemap-config"
```

This will create a `config/fv-sitemap.php` file where you can customize your sitemap settings.

## Basic Usage

### Generate Sitemap

Generate your sitemap using the Artisan command:

```bash
php artisan sitemap:generate
```

### Access Your Sitemap

Once generated, your sitemap will be available at:

```
https://yoursite.com/sitemap.xml
```

### Using the Facade

```php
use Fuelviews\Sitemap\Facades\Sitemap;

// Get sitemap content (generates if not exists)
$content = Sitemap::getSitemapContents('sitemap.xml');
```

### In Blade Templates

Link to your sitemap in templates:

```blade
<link rel="sitemap" type="application/xml" title="Sitemap" href="{{ route('sitemap') }}" />
```

## Configuration

### Basic Configuration

The main configuration options in `config/fv-sitemap.php`:

```php
return [
    // Storage disk for sitemap files
    'disk' => env('SITEMAP_DISK', 'public'),
    
    // Generate sitemap index for large sites
    'exclude_subcategory_sitemap_links' => env('SITEMAP_USE_INDEX', true),
    
    // Exclude redirect URLs
    'exclude_redirects' => env('SITEMAP_EXCLUDE_REDIRECTS', true),
    
    // Routes to exclude
    'exclude_route_names' => [
        // 'admin.*',
        // 'api.*',
    ],
    
    // Paths to exclude  
    'exclude_paths' => [
        // '/admin',
        // '/dashboard',
    ],
    
    // Specific URLs to exclude
    'exclude_urls' => [
        '/sitemap.xml',
        '/pages_sitemap.xml', 
        '/posts_sitemap.xml',
    ],
    
    // Models to include in posts sitemap
    'post_model' => [
        // App\Models\Post::class,
    ],
];
```

### Environment Variables

You can use environment variables for common settings:

```env
# .env file
SITEMAP_DISK=public
SITEMAP_USE_INDEX=true
SITEMAP_EXCLUDE_REDIRECTS=true
```

## Advanced Usage

### Model Integration

To include your Eloquent models in the sitemap, implement the `Sitemapable` interface:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Sitemap\Contracts\Sitemapable;
use Spatie\Sitemap\Tags\Url;

class Post extends Model implements Sitemapable
{
    /**
     * Convert the model instance into a sitemap URL entry.
     */
    public function toSitemapUrl(): Url
    {
        return Url::create(route('posts.show', $this))
            ->setLastModificationDate($this->updated_at)
            ->setChangeFrequency('weekly')
            ->setPriority(0.8);
    }
}
```

Then add your model to the configuration:

```php
// config/fv-sitemap.php
'post_model' => [
    App\Models\Post::class,
    App\Models\Article::class,
],
```

### Sitemap Types

#### Single Sitemap (Default)
When `exclude_subcategory_sitemap_links` is `false`, generates one sitemap containing all content:
- All crawlable pages
- All configured model entries

#### Sitemap Index
When `exclude_subcategory_sitemap_links` is `true`, generates:
- `sitemap.xml` - Sitemap index file
- `pages_sitemap.xml` - All crawled pages
- `posts_sitemap.xml` - All model entries

### Exclusion Rules

#### By Route Names
Exclude specific Laravel routes:

```php
'exclude_route_names' => [
    'admin.dashboard',
    'api.users.index', 
    'auth.*', // Wildcard support
],
```

#### By URL Paths  
Exclude URL paths (supports prefixes):

```php
'exclude_paths' => [
    '/admin',     // Excludes /admin, /admin/users, etc.
    '/dashboard', // Excludes /dashboard and sub-paths
    '/api',       // Excludes all API endpoints
],
```

#### By Exact URLs
Exclude specific URLs:

```php  
'exclude_urls' => [
    '/login',
    '/register',
    '/sitemap.xml', // Don't include sitemap in itself
],
```

### Custom Storage

Use different storage disks:

```php
// config/fv-sitemap.php
'disk' => 's3', // Store sitemaps on S3

// Or use environment variable
'disk' => env('SITEMAP_DISK', 'public'),
```

## Automatic Generation

The package automatically generates sitemaps when they're requested but don't exist. This means:

1. A user visits `/sitemap.xml`
2. If the sitemap doesn't exist, it's generated on-the-fly
3. The generated sitemap is served immediately
4. Future requests serve the cached version

## Performance Considerations

### Large Sites
For sites with many pages, use sitemap indexes:

```php
'exclude_subcategory_sitemap_links' => true,
```

This creates separate sitemaps for pages and posts, improving crawl efficiency.

### Crawler Configuration
The package uses Spatie's crawler with optimized settings:
- Ignores robots.txt for complete site mapping
- Filters out query parameters
- Normalizes URLs to prevent duplicates
- Excludes redirect URLs by default

### Caching
- Generated sitemaps are stored on your configured disk
- HTTP responses include appropriate cache headers
- Sitemaps are only regenerated when missing

## Command Reference

### Generate Sitemap
```bash
php artisan sitemap:generate
```

Generates the complete sitemap structure based on your configuration.

### Configuration Publishing
```bash
php artisan vendor:publish --tag="sitemap-config"
```

Publishes the configuration file to `config/fv-sitemap.php`.

## Testing

Run the package tests:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

## Troubleshooting

### Common Issues

#### Sitemap Not Generating
1. **Check configuration**: Ensure `config/fv-sitemap.php` is properly configured
2. **Model issues**: Verify models implement `Sitemapable` interface
3. **Storage permissions**: Ensure the configured disk is writable
4. **Route accessibility**: Verify your application routes are accessible

#### Empty Sitemap  
1. **Exclusion rules**: Check if your exclusion rules are too broad
2. **Route registration**: Ensure your routes are properly registered
3. **Model queries**: Verify your models have `published` status records

#### Memory Issues
1. **Use sitemap indexes**: Enable `exclude_subcategory_sitemap_links`
2. **Limit model queries**: Add additional constraints in your models
3. **Increase memory limit**: Adjust PHP memory limit for generation

### Debug Information

Enable debug logging by checking Laravel logs during generation:

```bash
tail -f storage/logs/laravel.log
```

The package logs detailed information about:
- Generation process
- Excluded URLs and reasons
- Model processing
- Storage operations

## SEO Best Practices

### URL Structure
- Use clean URLs without query parameters
- Implement proper canonical URLs
- Ensure consistent URL structure

### Update Frequencies
Configure appropriate change frequencies in your models:

```php
public function toSitemapUrl(): Url
{
    return Url::create(route('posts.show', $this))
        ->setLastModificationDate($this->updated_at)
        ->setChangeFrequency('weekly') // daily, weekly, monthly
        ->setPriority(0.8); // 0.0 to 1.0
}
```

### Sitemap Registration
Register your sitemap with search engines:
- Google Search Console
- Bing Webmaster Tools  
- Add `<link rel="sitemap">` to your HTML head

## Contributing

Please see [CONTRIBUTING](https://github.com/fuelviews/.github/blob/main/CONTRIBUTING.md) for details.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](https://github.com/fuelviews/laravel-sitemap/security/policy) on how to report security vulnerabilities.

## Credits

- [Joshua Mitchener](https://github.com/thejmitchener) - Lead Developer
- [Daniel Clark](https://github.com/sweatybreeze) - Contributor  
- [Fuelviews](https://github.com/fuelviews) - Organization
- [Spatie](https://github.com/spatie) - Underlying sitemap and crawler packages
- [All Contributors](../../contributors)

## 📜 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

<div align="center">
    <p>Built with ❤️ by the <a href="https://fuelviews.com">Fuelviews</a> team</p>
    <p>
        <a href="https://github.com/fuelviews/laravel-navigation">⭐ Star us on GitHub</a> •
        <a href="https://packagist.org/packages/fuelviews/laravel-navigation">📦 View on Packagist</a>
    </p>
</div>
