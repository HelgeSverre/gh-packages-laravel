# Easy Locale for Laravel

Easy Locale adds locale-aware routing and link generation to Laravel with a simple, predictable rule:

- The default locale has no URL prefix (clean URLs).
- Non-default locales are prefixed as the first URL segment (e.g., `/np/about`).

This helps you ship a single set of routes while presenting localized URLs only when needed.

## Features

- Clean URLs for your default locale (e.g., `en` → `/about`).
- Prefixed URLs for non-default locales (e.g., `np` → `/np/about`).
- Lightweight helper to group your routes once and let the package handle locale prefixes.
- Built-in locale switch endpoint to redirect correctly when changing languages.
- Optional, publishable Blade switcher UI and translation stubs.

## Requirements

- PHP 8.2+
- Laravel 12 (Illuminate Support ^12.0)

## Installation (Composer)

Install from Packagist:

```bash
composer require bpnpdl/easy-locale
```

Laravel will auto-discover the service provider.

## Publish assets

```bash
php artisan vendor:publish --provider="Bpnpdl\EasyLocale\EasyLocaleServiceProvider" --tag=config
php artisan vendor:publish --provider="Bpnpdl\EasyLocale\EasyLocaleServiceProvider" --tag=lang
php artisan vendor:publish --provider="Bpnpdl\EasyLocale\EasyLocaleServiceProvider" --tag=views
```

## Configuration

`config/easy-locale.php`:

```php
return [
        'locales' => [
                'en' => 'English',
                'np' => 'नेपाली',
                // add more like:
                // 'hi' => 'Hindi',
                // 'es' => 'Español',
        ],
        'default' => 'en', // default app locale; has no URL prefix
];
```

## Routing: group by current locale

Group your frontend routes once. Easy Locale mounts them with no prefix for the default locale and with `/{locale}` for others:

```php
use Bpnpdl\EasyLocale\Services\GroupLocaleRouteService;

$frontend = function () {
        Route::get('/', fn () => view('welcome'))->name('home');
        Route::get('/about', [PageController::class, 'about'])->name('about');
        Route::get('/contact', [PageController::class, 'contact'])->name('contact');
};

GroupLocaleRouteService::setLocaleRoutePrefix($frontend);
```

Behind the scenes, the package sets `app()->getLocale()` from the first URL segment if it matches a configured locale; otherwise it uses your configured default.
This means you avoid duplicating route definitions while still serving localized paths.

## Locale switching

The package registers:

- `GET /locale/{locale}` → `easy-locale.switch-language`

Use it to switch languages without breaking URLs. Examples:

```blade
<a href="{{ route('easy-locale.switch-language', 'en') }}">English</a>
<a href="{{ route('easy-locale.switch-language', 'np') }}">नेपाली</a>
```

If you prefer a ready-made UI, include the switcher view:

```blade
@include('easy-locale::switcher')
{{-- or if you published views: --}}
@include('vendor.easy-locale.switcher')
```

## Translations and views

- Translations can be published to `lang/vendor/easy-locale`.
- Views can be published to `resources/views/vendor/easy-locale`.

Use your own app translation files (e.g., `lang/en/pages.php`, `lang/np/pages.php`) for labels and navigation. The package does not override your app’s translation loading; it focuses on routing and URL shape.

In your app views you can use normal Laravel translation files (e.g., `lang/en/*.php`, `lang/np/*.php`). The package itself does not override your app’s translation loading.

## Example: links

When you build links using named routes, the current locale determines the URL. Use your app's translation labels for link text:

```blade
<a href="{{ route('home') }}">{{ __('pages.home') }}</a>
<a href="{{ route('about') }}">{{ __('pages.about') }}</a>
<a href="{{ route('contact') }}">{{ __('pages.contact') }}</a>
```

- Default locale `en`: `/`, `/about`, `/contact`
- Locale `np`: `/np`, `/np/about`, `/np/contact`

## Troubleshooting

- Seeing `/en/...` when you expect no prefix? Ensure `default` in `config/easy-locale.php` is set to `en` and that you group routes with `GroupLocaleRouteService`.
- Switching to the default locale still shows a prefix? Use the `easy-locale.switch-language` route; it removes the prefix for the default locale.
- Added a new locale but URLs don’t work? Add the locale code to `config('easy-locale.locales')`, clear caches, and verify your route group is using `GroupLocaleRouteService`.

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development workflow, coding standards, and PR process.

## License

MIT — see [LICENSE.md](LICENSE.md).

## Contact

- Email: bipinpaudel6774@gmail.com
- LinkedIn: https://www.linkedin.com/in/bpnpdl/
