# Laravel Package for SitesMonkey Monitoring

[![Latest Version on Packagist](https://img.shields.io/packagist/v/monkeysoft/laravel-sitesmonkey.svg?style=flat-square)](https://packagist.org/packages/monkeysoft/laravel-sitesmonkey)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/monkeysoftnl/laravel-sitesmonkey/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/monkeysoftnl/laravel-sitesmonkey/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/monkeysoftnl/laravel-sitesmonkey/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/monkeysoftnl/laravel-sitesmonkey/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/monkeysoft/laravel-sitesmonkey.svg?style=flat-square)](https://packagist.org/packages/monkeysoft/laravel-sitesmonkey)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Support us

[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/laravel-sitesmonkey.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/laravel-sitesmonkey)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards).

## Installation

You can install the package via composer:

```bash
composer require monkeysoftnl/laravel-sitesmonkey
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-sitesmonkey-config"
```

This is the contents of the published config file:

```php
return [
    'enabled' => env('SITESMONKEY_ENABLED', true),
    'website_id' => env('SITESMONKEY_WEBSITE_ID', ''),
    'website_secret' => env('SITESMONKEY_SECRET_KEY', ''),
    'api_url' => env('SITESMONKEY_API_URL', 'https://api.sitesmonkey.com'),
    //
    'auth' => [
        'model' => env('SITESMONKEY_AUTH_MODEL', '\App\Models\User'),
        'route_after_login' => env('SITESMONKEY_AUTH_ROUTE_AFTER_LOGIN', 'dashboard'),
    ]
];
```

## Usage

Add SitesMonkey to your logging configuration in `config/logging.php`:
```php
        'sitesMonkey' => [
            'driver' => 'custom',
            'via' => \MonkeySoft\SitesMonkey\Logging\SitesMonkeyLogger::class,
        ],
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

- [MonkeySoft](https://github.com/monkeysoftnl)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
