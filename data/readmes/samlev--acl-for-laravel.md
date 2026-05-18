# This is my package acl-for-laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/samlev/acl-for-laravel.svg?style=flat-square)](https://packagist.org/packages/samlev/acl-for-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/samlev/acl-for-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/samlev/acl-for-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/samlev/acl-for-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/samlev/acl-for-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/samlev/acl-for-laravel.svg?style=flat-square)](https://packagist.org/packages/samlev/acl-for-laravel)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/acl-for-laravel.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/acl-for-laravel)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Installation

You can install the package via composer:

```bash
composer require samlev/acl-for-laravel
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="acl-for-laravel-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="acl-for-laravel-config"
```

This is the contents of the published config file:

```php
return [
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="acl-for-laravel-views"
```

## Usage

```php
$aclForLaravel = new SamLev\Acl();
echo $aclForLaravel->echoPhrase('Hello, Samuel Levy!');
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

- [Samuel Levy](https://github.com/samlev)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
