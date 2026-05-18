# Laravel Chaos Testing

[![Latest Version on Packagist](https://img.shields.io/packagist/v/laravel-chaos/testing.svg?style=flat-square)](https://packagist.org/packages/laravel-chaos/testing)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/laravel-chaos/testing/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/laravel-chaos/testing/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/laravel-chaos/testing.svg?style=flat-square)](https://packagist.org/packages/laravel-chaos/testing)

A Laravel package for chaos engineering that deletes random files at random times. Use this to test your application's resilience against data loss or file system corruption.

> [!WARNING]
> **This package deletes files.** Do not use this in production unless you are absolutely sure what you are doing and have backups.

## Installation

You can install the package via composer:

```bash
composer require laravel-chaos/testing
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-chaos-testing-config"
```

This is the contents of the published config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Chaos Enabled
    |--------------------------------------------------------------------------
    |
    | This option controls whether the chaos command is enabled.
    | It is recommended to keep this disabled in production unless you
    | really know what you are doing.
    |
    */
    'enabled' => env('CHAOS_ENABLED', false),

    /*
    |--------------------------------------------------------------------------
    | Chaos Interval
    |--------------------------------------------------------------------------
    |
    | How often chaos should occur. Supported values:
    | - 'minute' (every minute)
    | - 'hour' (every hour)  
    | - 'day' (every day)
    | - 'week' (every week)
    | - 'month' (every month)
    |
    */
    'interval' => env('CHAOS_INTERVAL', 'week'),

    /*
    |--------------------------------------------------------------------------
    | Target Paths
    |--------------------------------------------------------------------------
    |
    | The paths where the chaos command will look for files to delete.
    |
    */
    'paths' => [
        storage_path('logs'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Target Extensions
    |--------------------------------------------------------------------------
    |
    | If specified, only files with these extensions will be deleted.
    | Leave empty to target all files.
    |
    */
    'extensions' => [],

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | The filesystem disk to use.
    |
    */
    'disk' => 'local',
];
```

## Usage

Once installed and enabled, the package registers a scheduled command `chaos:process` that runs hourly.

The command checks if it's time to "unleash chaos" based on a random schedule within your configured interval (default: once per week). If it is time, it will pick a random file from your configured `paths` and delete it.

### Configuration

1. Set the interval in your `.env`:
   ```env
   CHAOS_ENABLED=true
   CHAOS_INTERVAL=week  # minute, hour, day, week, or month
   ```

2. Or publish and edit the config file:
   ```bash
   php artisan vendor:publish --tag="laravel-chaos-testing-config"
   ```

You can also run the command manually:

```bash
php artisan chaos:process
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

- [Tharindu Wijayarathna](https://github.com/TharinduWijayarathna)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
