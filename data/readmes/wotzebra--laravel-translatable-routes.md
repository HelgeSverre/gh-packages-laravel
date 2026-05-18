# Package for Laravel to make routes translatable

Wrapper to define multiple locales for a website and associate a url per locale.

## Installation

You can install the package via composer:

```bash
composer require wotz/laravel-translatable-routes
```

## Usage

```php
use Wotz\LocaleCollection\Facades\LocaleCollection;

LocaleCollection::registerRoutes(base_path('routes/translatable.php'));
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
