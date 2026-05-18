# Highvertical Widget Package

Blade-first widgets for Laravel 10, 11, 12, and 13.

`v2.x` is the modern package line for Laravel 10+ applications. It keeps the package small, safe, and non-disruptive while preserving a clean Blade-first developer experience.

## Compatibility

| Package line | Laravel | PHP | Status |
| --- | --- | --- | --- |
| `1.x` | `^7.0 \| ^8.0 \| ^9.0` | `^7.2.5 \| ^8.0` | Maintained legacy line |
| `2.x` | `^10.0 \| ^11.0 \| ^12.0 \| ^13.0` | `^8.1` | Current modern line |

Current latest stable Laravel line verified for this package: Laravel `13`, using Orchestra Testbench `11`. Sources: [laravel/framework on Packagist](https://packagist.org/packages/laravel/framework) and [orchestra/testbench on Packagist](https://packagist.org/packages/orchestra/testbench).

## Safety

This package does not modify your application unless you explicitly publish resources.

It does not:

- write files into your application during normal boot
- clear caches, routes, config, or compiled views
- run migrations automatically
- register middleware
- make HTTP requests
- inject remote assets, telemetry, or tracking
- scan arbitrary directories or modules on each request

## Installation

```bash
composer require highvertical/widget-package:^2.0
```

Laravel package discovery is enabled by default. If you need manual registration, add the service provider to `config/app.php`:

```php
'providers' => [
    Highvertical\WidgetPackage\Providers\WidgetServiceProvider::class,
],
```

## Optional Publishing

Publish the package config:

```bash
php artisan vendor:publish --tag=widget-package-config
```

This creates:

```text
config/widget-package.php
```

Publish the component wrapper view if you want to customize the default widget shell:

```bash
php artisan vendor:publish --tag=widget-package-views
```

This creates:

```text
resources/views/vendor/widget-package/components/widget.blade.php
```

Publishing is optional. The package works without publishing any files.

## Configuration

Default config:

```php
<?php

return [
    'widgets' => [
        // 'profile-card' => \App\Widgets\ProfileCardWidget::class,
    ],
];
```

`config/widget-package.php` is the only supported config file in `v2.x`.

## Creating a Widget

Create a widget class that extends `Highvertical\WidgetPackage\Widgets\Widget`:

```php
<?php

namespace App\Widgets;

use Highvertical\WidgetPackage\Widgets\Widget;
use Illuminate\Contracts\View\View;

class WelcomeWidget extends Widget
{
    public function render(array $params = []): View
    {
        return view('widgets.welcome', [
            'name' => $params['name'] ?? 'Guest',
        ]);
    }
}
```

Register it in `config/widget-package.php`:

```php
'widgets' => [
    'welcome' => \App\Widgets\WelcomeWidget::class,
],
```

## Basic Usage

### Preferred Blade component

```blade
<x-widget-package alias="welcome" :data="['name' => 'Taylor']" />
```

### Preferred helper

```php
echo widgetPackage('welcome', ['name' => 'Taylor']);
```

### Include alias

```blade
@widgetPackage(['alias' => 'welcome', 'data' => ['name' => 'Taylor']])
```

### Blade directive

The `@widget(...)` Blade directive is still available in `v2.x` for template continuity:

```blade
@widget('welcome', ['name' => 'Taylor'])
```

### Programmatic registration

You can register widgets in your own service provider if you prefer code-based registration:

```php
use Highvertical\WidgetPackage\WidgetManager;

public function boot(): void
{
    app(WidgetManager::class)->register('welcome', \App\Widgets\WelcomeWidget::class);
}
```

## Security Behavior

Plain string output is escaped by default.

If you intentionally want raw HTML output, return an `Illuminate\Support\HtmlString`:

```php
use Illuminate\Support\HtmlString;

public function render(array $params = []): HtmlString
{
    return new HtmlString('<strong>Trusted markup</strong>');
}
```

Raw HTML pass-through is intentionally limited to `HtmlString`. Returning a generic `Htmlable` object is rejected by the package.

## Advanced Usage

### Constructor dependencies

Widget classes are resolved through Laravel's container, so constructor injection works normally:

```php
<?php

namespace App\Widgets;

use App\Services\ProfileService;
use Highvertical\WidgetPackage\Widgets\Widget;
use Illuminate\Contracts\View\View;

class ProfileWidget extends Widget
{
    public function __construct(
        private readonly ProfileService $profiles
    ) {
    }

    public function render(array $params = []): View
    {
        return view('widgets.profile', [
            'profile' => $this->profiles->find($params['user_id'] ?? null),
        ]);
    }
}
```

### Overriding the package view

After publishing views, customize:

```text
resources/views/vendor/widget-package/components/widget.blade.php
```

## Upgrade Guide From v1

`v2.x` removes legacy Laravel 7–9 compatibility code.

Changes to note:

- `config/widgets.php` is no longer supported; move registrations to `config/widget-package.php`.
- Legacy global helpers `widget()`, `register_widget()`, `widget_package_render()`, `widget_package_register()`, and `widget_package_manager()` have been removed.
- The preferred APIs are `<x-widget-package />` and `widgetPackage()`.
- The `@widget(...)` Blade directive remains available.

## Testing

Run the package test suite with:

```bash
composer test
```

Format the codebase with:

```bash
vendor/bin/pint
```

## CI

GitHub Actions covers the supported `v2.x` matrix:

- Laravel 10 / Testbench 8 / PHP 8.1 and 8.2
- Laravel 11 / Testbench 9 / PHP 8.2
- Laravel 12 / Testbench 10 / PHP 8.2
- Laravel 13 / Testbench 11 / PHP 8.3
- Lowest dependencies on Laravel 10 / Testbench 8 / PHP 8.1

## Troubleshooting

### Widget not found

Make sure the alias exists in `config/widget-package.php` or is registered programmatically before rendering.

### Widget class rejected

Widget classes must extend `Highvertical\WidgetPackage\Widgets\Widget`.

### Raw HTML is escaped

Plain strings are intentionally escaped. Return `HtmlString` if you need trusted raw markup.

## Contributing

1. Install Composer dependencies.
2. Run `composer test`.
3. Run `vendor/bin/pint`.
4. Submit a focused pull request with compatibility notes when relevant.

## License

MIT
