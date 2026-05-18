# Laravel Graylog

[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/rpungello/laravel-graylog/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/rpungello/laravel-graylog/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/rpungello/laravel-graylog/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/rpungello/laravel-graylog/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)

Laravel package that utilizes the Graylog messages API to search for messages

## Installation

You can install the package via composer, but first you need to add my composer repository to your composer.json file:

```json
{
    "repositories": [
        {
            "type": "composer",
            "url": "https://composer.rpun.dev"
        }
    ]
}
```

Then you can install the package:

```bash
composer require rpungello/laravel-graylog
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="graylog-config"
```

This is the contents of the published config file:

```php
return [
    'https' => env('GRAYLOG_API_HTTPS', false),
    'host' => env('GRAYLOG_API_HOST'),
    'port' => env('GRAYLOG_API_PORT', 9000),
    'token' => env('GRAYLOG_API_TOKEN'),
];
```

## Usage

### Get Cluster Info

```php
\Rpungello\Graylog\Facades\Graylog::cluster();
```

### Run a Search

```php
\Rpungello\Graylog\Facades\Graylog::search(
    '000000000000',
    new \Rpungello\Graylog\TimeRange\Relative(new \Carbon\CarbonInterval(weeks: 4)),
    'field:value && other_field:other_value',
    ['field1', 'field2']
);
```

### Count Results
Runs a search, but instead of retrieving the data, simply returns the number of matching records

```php
\Rpungello\Graylog\Facades\Graylog::countResults(
    '000000000000',
    new \Rpungello\Graylog\TimeRange\Relative(new \Carbon\CarbonInterval(weeks: 4)),
    'field:value && other_field:other_value'
);
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

- [Rob Pungello](https://github.com/rpungello)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
