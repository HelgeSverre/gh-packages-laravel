# Robots for Laravel

<p>
<a href="https://packagist.org/packages/seophp/robots-laravel"><img src="https://img.shields.io/packagist/dt/seophp/robots-laravel" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/seophp/robots-laravel"><img src="https://img.shields.io/packagist/v/seophp/robots-laravel" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/seophp/robots-laravel"><img src="https://img.shields.io/packagist/l/seophp/robots-laravel" alt="License"></a>
<a href="https://php.net"><img src="https://img.shields.io/badge/PHP-8.4+-777BB4?logo=php" alt="PHP Minimum Version"></a>
</p>

Laravel integration for [seophp/robots](https://github.com/seophp/php-robots). Serves a dynamic `robots.txt` response via a service provider you define in your application.

## Requirements

- PHP 8.4 or higher
- Laravel 12 or higher

## Installation

Install via [Composer](https://getcomposer.org):

```bash
composer require seophp/robots-laravel
```

Then run the install command to scaffold your service provider:

```bash
php artisan robots:install
```

This will:
- Create `app/Providers/RobotsTxtServiceProvider.php` in your application
- Register it automatically in `bootstrap/providers.php`

## Configuration

All configuration lives inside the generated service provider. Implement the `configure` method, which receives a `RobotsTxtConfig` instance:

```php
<?php

declare(strict_types=1);

namespace App\Providers;

use Seo\Robots\Laravel\Providers\RobotsTxtServiceProvider as ServiceProvider;
use Seo\Robots\Laravel\RobotsTxtConfig;
use Seo\Robots\RobotsTxtBuilder;
use Seo\Robots\RobotsTxtGroupBuilder;

final class RobotsTxtServiceProvider extends ServiceProvider
{
    protected function configure(RobotsTxtConfig $config): void
    {
        $config->robots(
            fn () => (new RobotsTxtBuilder())
                ->group(
                    fn (RobotsTxtGroupBuilder $group) => $group
                        ->agent('*')
                        ->disallow('/admin')
                        ->allow('/'),
                )
                ->sitemap('https://example.com/sitemap.xml')
                ->build(),
        );
    }
}
```

The route `/robots.txt` is registered automatically when the provider is loaded.

### Environments

The `robots` closure is only called in `production` and `local` environments. In all other environments (e.g. `staging`), the package automatically serves a disallow-all response:

```
User-agent: *
Disallow: /
```

This prevents non-production deployments from leaking into search engine indexes without any extra configuration.

### Middleware

Apply middleware to the `/robots.txt` route via `middleware()`:

```php
$config->middleware(['throttle:60,1']);
```

### Domain constraints

Restrict the route to a specific domain or subdomain. This is useful in monorepo setups where multiple apps share the same Laravel installation but each needs its own `robots.txt`:

```php
// App\Providers\MarketingRobotsTxtServiceProvider
$config
    ->domain('marketing.example.com')
    ->robots(fn () => (new RobotsTxtBuilder())
        ->group(fn (RobotsTxtGroupBuilder $group) => $group->agent('*')->allow('/'))
        ->build()
    );

// App\Providers\ApiRobotsTxtServiceProvider
$config
    ->domain('api.example.com')
    ->robots(fn () => (new RobotsTxtBuilder())
        ->group(fn (RobotsTxtGroupBuilder $group) => $group->agent('*')->disallow('/'))
        ->build()
    );
```

Register each as a separate provider in `bootstrap/providers.php`.

If `domain()` is not called, the config acts as a catch-all and matches any host. This is the correct setup for single-app projects and also works as a fallback in monorepo setups alongside domain-specific providers:

```php
// App\Providers\ApiRobotsTxtServiceProvider — only for api.example.com
$config
    ->domain('api.example.com')
    ->robots(fn () => (new RobotsTxtBuilder())
        ->group(fn (RobotsTxtGroupBuilder $group) => $group->agent('*')->disallow('/'))
        ->build()
    );

// App\Providers\RobotsTxtServiceProvider — catch-all for all other domains
$config->robots(fn () => (new RobotsTxtBuilder())
    ->group(fn (RobotsTxtGroupBuilder $group) => $group->agent('*')->allow('/'))
    ->sitemap('https://example.com/sitemap.xml')
    ->build()
);
```

## License

The MIT License (MIT). See the [license file](LICENSE) for more information.
