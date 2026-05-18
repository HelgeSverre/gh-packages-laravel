# Package that adds an online scope

This package adds an online scope to your model, if it has an `online` boolean column.
It will also check if the model is translatable using the [`spatie/laravel-translatable`](https://github.com/spatie/laravel-translatable) package.

## Installation

You can install the package via composer:

```bash
composer require wotz/laravel-online-scope
```

## Usage

```php
use Wotz\OnlineScope\Model\Traits\HasOnlineScope;
```

## Documentation

For the full documentation, check [here](./docs/index.md).

## Testing

```bash
vendor/bin/pest
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Upgrading

Please see [UPGRADING](UPGRADING.md) for more information on how to upgrade to a new version.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

If you discover any security-related issues, please email info@whoownsthezebra.be instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
