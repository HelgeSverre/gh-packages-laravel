# Omnidesk Laravel fast integration

<img src="https://banners.beyondco.de/Omnidesk%20Laravel.jpeg?theme=light&packageManager=composer+require&packageName=palach%2Fomnidesk-laravel&pattern=intersectingCircles&style=style_2&description=Fast+integration+for+Omnidesk&md=1&showWatermark=1&fontSize=100px&images=arrow-circle-right" alt="Omnidesl Laravel">

**Omnidesk Laravel** is a Laravel package for start fast integration your service with [Omnidesk](https://omnidesk.ru).

## Installation

You can install the package via composer:

```bash
composer require palach/laravel-omnidesk
```

Publish and launch required migrations:

```bash
php artisan vendor:publish --tag="omnidesk-migrations"
```

```bash
php artisan migrate
```

Optionally, you can publish the config and translation file with:
```bash
php artisan vendor:publish --tag="omnidesk-config"
```
```bash
php artisan vendor:publish --tag="omnidesk-translations"
```

## Documentation

### Languages

- **[Русский](docs/ru/README.md)** — документация на русском языке
- **[English](docs/en/README.md)** — documentation in English


## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently. [Follow Us](https://twitter.com/FabioIvona) on Twitter for more updates about this package.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Credits

- [Alexey Gursky](https://github.com/palachX)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

