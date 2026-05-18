# Statamic Client



[![Latest Version on Packagist](https://img.shields.io/packagist/v/marvinosswald/statamic-client.svg?style=flat-square)](https://packagist.org/packages/marvinosswald/statamic-client)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/marvinosswald/statamic-client/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/marvinosswald/statamic-client/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/marvinosswald/statamic-client/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/marvinosswald/statamic-client/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/marvinosswald/statamic-client.svg?style=flat-square)](https://packagist.org/packages/marvinosswald/statamic-client)

This package simplifies consuming external statamic installations from your laravel application.

NOT PRODUCTION READ

## Motivation

- I want my apps to be hosted using Octane which Statamic doesn't support
- I don't want my application being "taken over" by Statamic
- I love statamic and want to use it for my marketing pages and as a source for
content pages within my app

## Roadmap
- Pass through views, needs specific setup on your statamic installation
  - initial implementation done
- Auto discover entries of specific collections
- Load navigation from api
- Load globals from api

## Installation

You can install the package via composer:

```bash
composer require marvinosswald/statamic-client
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="statamic-client-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="statamic-client-config"
```

This is the contents of the published config file:

```php
return [
    'host_url' => env("STATAMIC_HOST_URL"),
    'pass_through' => [
        "enabled" => env('STATAMIC_PASSTHROUGH_ENABLED', true),
        "prefix" => "cms",
        'middleware' => ["web"],
        "view" => "statamic-client::pass-through"
    ],
    'discover' => [
        'enabled' => env('STATAMIC_DISCOVER_ENABLED', true),
    ]
];
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="statamic-client-views"
```

## Usage

```php
$statamicClient = new Marvinosswald\StatamicClient();
echo $statamicClient->echoPhrase('Hello, Marvinosswald!');
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

- [Marvin Osswald](https://github.com/marvinosswald)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
