# Laravel layouts wrapper package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/fuelviews/laravel-layouts-wrapper.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-layouts-wrapper)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-layouts-wrapper/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/fuelviews/laravel-layouts-wrapper/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/fuelviews/laravel-layouts-wrapper/fix-php-code-style-issues.yml?label=code%20style&style=flat-square)](https://github.com/fuelviews/laravel-layouts-wrapper/actions?query=workflow%3A"Fix+PHP+code+style+issues")
[![Total Downloads](https://img.shields.io/packagist/dt/fuelviews/laravel-layouts-wrapper.svg?style=flat-square)](https://packagist.org/packages/fuelviews/laravel-layouts-wrapper)

Laravel layouts wrapper package

## Installation

You can install the package via composer:

```bash
composer require fuelviews/laravel-layouts-wrapper:^0.0
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="layouts-wrapper-config"
```

This is the contents of the published config file:

```php
return [
    // Enable or disable Google Tag Manager
    'gtm_enabled' => false,

    // Enable or disable Livewire
    'livewire_enabled' => true,

    // Enable or disable Navigation
    'navigation_enabled' => true,

    // Enable or disable Forms Modal
    'forms_modal_enabled' => true,
    
    // Enable or disable Forms Modal
    'forms_modal_enabled' => true,
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="layouts-wrapper-views"
```

## Usage

Wrap your blade files using:

```php
<x-layouts-wrapper::layouts.app>
    <div class="h-screen">
        <div class="flex w-full h-full bg-gray-300">

        </div>
    </div>
</x-layouts-wrapper::layouts.app>
```

## Tailwindcss classes

Add laravel-forms to your tailwind.config.js file:

```javascript
    content: [
        './vendor/fuelviews/laravel-*/resources/**/*.{js,vue,blade.php}',
    ]
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Thejmitchener](https://github.com/thejmitchener)
- [Fuelviews](https://github.com/fuelviews)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
