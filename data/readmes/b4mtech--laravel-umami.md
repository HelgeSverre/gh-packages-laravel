![alt Laravel Umami](https://banners.beyondco.de/Laravel%20Umami.png?theme=light&packageManager=composer+require&packageName=b4mtech%2Flaravel-umami&pattern=architect&style=style_1&description=Laravel+component+to+add+analytics+to+your+app&md=1&showWatermark=1&fontSize=100px&images=https%3A%2F%2Flaravel.com%2Fimg%2Flogomark.min.svg)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/b4mtech/laravel-umami.svg?style=flat-square)](https://packagist.org/packages/b4mtech/laravel-umami)
[![Total Downloads](https://img.shields.io/packagist/dt/b4mtech/laravel-umami.svg?style=flat-square)](https://packagist.org/packages/b4mtech/laravel-umami)
![GitHub Actions](https://github.com/b4mtech/laravel-umami/actions/workflows/main.yml/badge.svg)

# Laravel Umami
This packages consist of a larvel component to be used with your own [umami](https://umami.is/) analytics server.

## Installation

You can install the package via composer:

```bash
composer require b4mtech/laravel-umami
```

## Publish Items
You should publish the config using the following command:
```bash
php artisan vendor:publish --provider="B4mtech\LaravelUmami\LaravelUmamiServiceProvider" --tag="umami-config"
```

If you want to customize the blade component:
```bash
php artisan vendor:publish --provider="B4mtech\LaravelUmami\LaravelUmamiServiceProvider" --tag="umami-view-component"
```
## Usage
As long as the `UMAMI_WEBSITE_ID` is set the blade component will be displayed. The following will need to be added inside your `head` html tags.

```php
@showUmami
<x-laravel-umami::umami />
@endshowUmami
```

### Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email mark@bandmtechnologies.com instead of using the issue tracker.

## Credits

-   [Mark Myers](https://github.com/b4mtech)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Laravel Package Boilerplate

This package was generated using the [Laravel Package Boilerplate](https://laravelpackageboilerplate.com).
