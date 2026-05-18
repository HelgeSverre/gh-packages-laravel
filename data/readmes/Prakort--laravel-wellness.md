# A Laravel Wellness to monitor storage files
[![Latest Version on Packagist](https://img.shields.io/packagist/v/prakort/laravel-wellness.svg?style=flat-square)](https://packagist.org/packages/prakort/laravel-wellness)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/prakort/laravel-wellness/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/prakort/laravel-wellness/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/prakort/laravel-wellness/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/prakort/laravel-wellness/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/prakort/laravel-wellness.svg?style=flat-square)](https://packagist.org/packages/prakort/laravel-wellness)


This package contains a [Laravel Health](https://spatie.be/docs/laravel-health) File Size Monitoring: Identify files that exceed specified size limits to prevent unexpected storage overages.

## Installation

You can install the package via composer:

```bash
composer require prakort/laravel-wellness
```

## Usage

```php
use Spatie\Health\Facades\Health;
use prakort\LaravelWellness\FileSizeCheck;

Health::checks([
    FileSizeCheck::new()
        ->disk('s3')
        ->warningThreshold(5)
        ->errorThreshold(10)
        ->fileTypes(['png', 'pdf', 'txt'])
]);

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

- [Prakort Lean](https://github.com/prakort)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
