# Rewired

[![Latest Version on Packagist](https://img.shields.io/packagist/v/oxytoxin/rewired.svg?style=flat-square)](https://packagist.org/packages/oxytoxin/rewired)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/oxytoxin/rewired/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/oxytoxin/rewired/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/oxytoxin/rewired/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/oxytoxin/rewired/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/oxytoxin/rewired.svg?style=flat-square)](https://packagist.org/packages/oxytoxin/rewired)

This Laravel package allows you to:

1. Use React inside Livewire
2. Call Livewire inside React

## Support me

Feel free to create discussions, open pull requests or provide suggestions.

This is my first ever Laravel package, so please go easy on me 😅.

## Installation

You can install the package via composer:

```bash
composer require oxytoxin/rewired
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="rewired-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="rewired-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="rewired-views"
```

## Usage

```php
$rewired = new Rewired();
echo $rewired->echoPhrase('Hello, oxytoxin!');
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

- [Lerry Casero](https://github.com/oxytoxin)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
