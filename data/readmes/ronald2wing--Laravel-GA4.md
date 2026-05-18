# Laravel GA4

[![Latest Version](https://img.shields.io/packagist/v/ronald2wing/laravel-ga4.svg?style=flat-square)](https://packagist.org/packages/ronald2wing/laravel-ga4)
[![License](https://img.shields.io/packagist/l/ronald2wing/laravel-ga4.svg?style=flat-square)](LICENSE)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%205-brightgreen.svg?style=flat-square)](https://github.com/ronald2wing/laravel-ga4)
[![CI](https://img.shields.io/github/actions/workflow/status/ronald2wing/laravel-ga4/php.yml?branch=master&style=flat-square)](https://github.com/ronald2wing/laravel-ga4/actions)

A small Laravel package that drops the Google Analytics 4 tracking snippet into your Blade layout. One directive, one env var, no ceremony.

## Requirements

- PHP 8.3+
- Laravel 10.x, 11.x, 12.x, or 13.x

## Installation

```bash
composer require ronald2wing/laravel-ga4
```

The service provider is auto-registered.

## Configuration

Add your measurement ID to `.env`:

```env
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

Optionally publish the config:

```bash
php artisan vendor:publish --tag=ga4-config
```

### gtag parameters

Forwarded as the third argument to `gtag('config', id, parameters)`:

```php
// config/ga4.php
'parameters' => [
    'send_page_view' => true,
    'anonymize_ip'   => true,
],
```

## Usage

Place `@ga4` in your layout's `<head>`:

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ config('app.name') }}</title>
    @ga4
</head>
<body>
    @yield('content')
</body>
</html>
```

The directive renders the tracking snippet, or nothing at all if no measurement ID is configured — so it's safe to drop into any layout unconditionally.

### Conditional rendering

`Ga4Tag::isEnabled()` lets you guard analytics-aware UI:

```blade
@use(Ronald2Wing\LaravelGa4\Ga4Tag)

@if(app(Ga4Tag::class)->isEnabled())
    <button data-track="sign_up">Sign Up</button>
@endif
```

`Ga4Tag` implements `Htmlable` and `Stringable`, so `{{ $tag }}` and `{!! $tag !!}` both work if you'd rather inject the instance directly.

## Composer scripts

```bash
composer test          # run tests
composer check         # lint + test
composer lint          # Pint dry-run
composer pint          # Pint fix
composer analyse       # PHPStan
```

## License

MIT © [Ronald2Wing](https://github.com/ronald2wing)
