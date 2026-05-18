# This is my package ai

[![Latest Version on Packagist](https://img.shields.io/packagist/v/backstage/laravel-ai.svg?style=flat-square)](https://packagist.org/packages/backstage/laravel-ai)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/backstagephp/laravel-ai/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/backstagephp/laravel-ai/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/backstagephp/laravel-ai/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/backstagephp/laravel-ai/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/backstage/laravel-ai.svg?style=flat-square)](https://packagist.org/packages/backstage/laravel-ai)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require backstagephp/laravel-ai
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="ai-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="ai-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="ai-views"
```

## Usage

```php
$aI = new Backstage\Laravel\AI();
echo $aI->echoPhrase('Hello, Backstage\Laravel!');
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

- [Manoj Hortulanus](https://github.com/backstagephp)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
