# A powerful package that allows you to aggregate knowledge from various sources and chat using Ai.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/binarcode/laravel-smart-chat.svg?style=flat-square)](https://packagist.org/packages/binarcode/laravel-smart-chat)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/binarcode/laravel-smart-chat/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/binarcode/laravel-smart-chat/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/binarcode/laravel-smart-chat/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/binarcode/laravel-smart-chat/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/binarcode/laravel-smart-chat.svg?style=flat-square)](https://packagist.org/packages/binarcode/laravel-smart-chat)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Installation

You can install the package via composer:

```bash
composer require binarcode/laravel-smart-chat
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-smart-chat-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-smart-chat-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-smart-chat-views"
```

## Usage

```php
$laravelSmartChat = new BinarCode\LaravelSmartChat();
echo $laravelSmartChat->echoPhrase('Hello, BinarCode!');
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

- [Eduard Lupacescu](https://github.com/binaryk)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
