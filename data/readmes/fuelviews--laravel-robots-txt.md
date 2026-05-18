# Laravel Robots.txt Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-robots-txt.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-robots-txt)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-robots-txt/run-tests.yml?label=tests&style=flat-square)](https://github.com/fuelviews/laravel-robots-txt/actions/workflows/run-tests.yml)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-robots-txt/php-cs-fixer.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-robots-txt/actions/workflows/php-cs-fixer.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-robots-txt.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-robots-txt)
[![PHP Version](https://img.shields.io/badge/PHP-^8.3-blue.svg?style=flat-square)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-^10|^11|^12-red.svg?style=flat-square)](https://laravel.com)

Laravel Robots.txt is a robust and easy-to-use solution designed to automatically generate and serve dynamic robots.txt files for your Laravel application. The package provides intelligent caching, environment-based rules, and seamless integration with your application's routing system.

## Requirements

- PHP ^8.3
- Laravel ^10.0 || ^11.0 || ^12.0

## Installation

Install the package via Composer:

```bash
composer require fuelviews/laravel-robots-txt
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="robots-txt-config"
```

## Basic Usage

### Automatic Route Registration

The package automatically registers a route at `/robots.txt` that serves your dynamic robots.txt file:

```
https://yoursite.com/robots.txt
```

### Configuration

Configure your robots.txt rules in `config/robots-txt.php`:

```php
<?php

return [
    /**
     * The disk where the robots.txt file will be saved
     */
    'disk' => 'public',

    /**
     * User agent rules for different paths
     */
    'user_agents' => [
        '*' => [
            'Allow' => [
                '/',
            ],
            'Disallow' => [
                '/admin',
                '/dashboard',
            ],
        ],
        'Googlebot' => [
            'Allow' => [
                '/',
            ],
            'Disallow' => [
                '/admin',
            ],
        ],
    ],

    /**
     * Sitemaps to include in robots.txt
     */
    'sitemap' => [
        'sitemap.xml',
    ],
];
```

## Environment Behavior

### Development/Staging Environments

In non-production environments (`app.env` !== 'production'), the package automatically generates a restrictive robots.txt:

```
User-agent: *
Disallow: /
```

This prevents search engines from indexing your development or staging sites.

### Production Environment

In production, the package uses your configured rules to generate the robots.txt file.

## Advanced Usage

### Using the Facade

```php
use Fuelviews\RobotsTxt\Facades\RobotsTxt;

// Get robots.txt content
$content = RobotsTxt::getContent();

// Generate fresh content (bypasses cache)
$content = RobotsTxt::generate();

// Save to a specific disk and path
RobotsTxt::saveToFile('s3', 'seo/robots.txt');
```

### Direct Class Usage

```php
use Fuelviews\RobotsTxt\RobotsTxt;

$robotsTxt = app(RobotsTxt::class);

// Check if regeneration is needed
$content = $robotsTxt->getContent();

// Generate and save to custom location
$robotsTxt->saveToFile('public', 'custom-robots.txt');
```

### Named Routes

The package registers a named route that you can reference:

```php
// In your views
<link rel="robots" href="{{ route('robots') }}">

// Generate URL
$robotsUrl = route('robots');
```

## Configuration Options

### Disk Configuration

Specify which Laravel filesystem disk to use for storing the robots.txt file:

```php
'disk' => 'public', // or 's3', 'local', etc.
```

### User Agent Rules

Define rules for different user agents:

```php
'user_agents' => [
    '*' => [
        'Allow' => ['/'],
        'Disallow' => ['/admin', '/dashboard'],
    ],
    'Googlebot' => [
        'Allow' => ['/api/public/*'],
        'Disallow' => ['/api/private/*'],
    ],
    'Bingbot' => [
        'Crawl-delay' => ['1'],
        'Disallow' => ['/admin'],
    ],
],
```

### Sitemap Integration

Include sitemap URLs in your robots.txt:

```php
'sitemap' => [
    'sitemap.xml',
    'posts-sitemap.xml',
    'categories-sitemap.xml',
],
```

This generates:

```
Sitemap: https://yoursite.com/sitemap.xml
Sitemap: https://yoursite.com/posts-sitemap.xml
Sitemap: https://yoursite.com/categories-sitemap.xml
```

## Caching System

The package uses an intelligent caching system that regenerates the robots.txt file only when:

- The configuration changes
- The application environment changes
- The application URL changes
- The cached file doesn't exist

### Cache Management

Cache is automatically managed, but you can clear it manually:

```php
use Illuminate\Support\Facades\Cache;

// Clear the robots.txt cache
Cache::forget('robots-txt.checksum');
```

## File Storage

### Automatic Storage

The package automatically stores the generated robots.txt file to your configured disk at `robots-txt/robots.txt`.

### Custom Storage

```php
use Fuelviews\RobotsTxt\Facades\RobotsTxt;

// Save to specific location
RobotsTxt::saveToFile('s3', 'seo/robots.txt');

// Save to multiple locations
RobotsTxt::saveToFile('public', 'robots.txt');
RobotsTxt::saveToFile('backup', 'robots-backup.txt');
```

## Example Generated Output

### Production Environment

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard

User-agent: Googlebot
Allow: /
Disallow: /admin

Sitemap: https://yoursite.com/sitemap.xml
Sitemap: https://yoursite.com/posts-sitemap.xml
```

### Non-Production Environment

```
User-agent: *
Disallow: /
```

## Testing

Run the package tests:

```bash
composer test
```

## Troubleshooting

### Robots.txt Not Updating

If your robots.txt isn't reflecting configuration changes:

1. Clear the application cache: `php artisan cache:clear`
2. Ensure your configuration is valid
3. Check file permissions for the storage disk

### Route Conflicts

If you have an existing `/robots.txt` route or static file:

1. Remove any static `public/robots.txt` file (the package automatically removes it)
2. Ensure no other routes conflict with `/robots.txt`

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/fuelviews/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](https://github.com/fuelviews/laravel-robots-txt/security/policy) on how to report security vulnerabilities.

## Credits

- [Joshua Mitchener](https://github.com/thejmitchener)
- [Daniel Clark](https://github.com/sweatybreeze)
- [Fuelviews](https://github.com/fuelviews)
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
