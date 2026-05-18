<img src="https://banners.beyondco.de/Laravel%20PWA.png?theme=light&packageManager=composer+require&packageName=codebar-ag%2Flaravel-pwa&pattern=circuitBoard&style=style_1&description=An+opinionated+way+to+implment+PWA+with+Laravel&md=1&showWatermark=0&fontSize=175px&images=document-report">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codebar-ag/laravel-pwa.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-pwa)
[![Total Downloads](https://img.shields.io/packagist/dt/codebar-ag/laravel-pwa.svg?style=flat-square)](https://packagist.org/packages/codebar-ag/laravel-pwa)
[![GitHub-Tests](https://github.com/codebar-ag/laravel-pwa/actions/workflows/run-tests.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-pwa/actions/workflows/run-tests.yml)
[![GitHub Code Style](https://github.com/codebar-ag/laravel-pwa/actions/workflows/fix-php-code-style-issues.yml/badge.svg?branch=main)](https://github.com/codebar-ag/laravel-pwa/actions/workflows/fix-php-code-style-issues.yml)
[![PHPStan](https://github.com/codebar-ag/laravel-pwa/actions/workflows/phpstan.yml/badge.svg)](https://github.com/codebar-ag/laravel-pwa/actions/workflows/phpstan.yml)
[![Dependency Review](https://github.com/codebar-ag/laravel-pwa/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/codebar-ag/laravel-pwa/actions/workflows/dependency-review.yml)

#  What is Laravel PWA?

Laravel PWA is a package for laravel that provides an easy way to integrate Progressive Web Apps into your Laravel application.

## 🛠 Requirements Table

| Package |     PHP     | Laravel | 
|:-------:|:-----------:|:-------:|
| v12.0.0 | ^8.2 - ^8.4 |  12.x   |

## Installation

You can install the package via composer:

```bash
composer require codebar-ag/laravel-pwa
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-pwa-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-pwa-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-pwa-views"
```

## Usage

```php
$laravelPWA = new CodebarAg\LaravelPWA();
echo $laravelPWA->echoPhrase('Hello, CodebarAg!');
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

- [Rhys Lees](https://github.com/43909932+RhysLees)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
