> [!NOTE]  
> This is my opinionated Laravel package skeleton.
> Start by cloning this repository and selecting the minimum supported version of the Laravel framework.
> Remove everything you don't need for your package, commit your changes to your own remote repo, run the tests, and once everything is green, you're ready to start building your awesome new package.
> The branch name indicates the minimum Laravel version supported. For example, the `10.x` branch supports Laravel 10, 11, and 12.

# PackageName

[![Latest Version on Packagist](https://img.shields.io/packagist/v/vendor-name/package-name.svg?style=flat-square)](https://packagist.org/packages/vendor-name/package-name)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/vendor-name/package-name/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/vendor-name/package-name/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/vendor-name/package-name/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/vendor-name/package-name/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/vendor-name/package-name.svg?style=flat-square)](https://packagist.org/packages/vendor-name/package-name)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require vendor-name/package-name
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="package-name-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="package-name-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="package-name-views"
```

## Usage

```php
$variable = new VendorName\PackageName();
echo $variable->echoPhrase('Hello, VendorName!');
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

- [Forename Surname](https://github.com/vendor-name)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
