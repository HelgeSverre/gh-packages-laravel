# A laravel package to vacuum and analyze tables in the public shema

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cytech-services/laravel-postgres-vacuum-analyze.svg?style=flat-square)](https://packagist.org/packages/cytech-services/laravel-postgres-vacuum-analyze)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/cytech-services/laravel-postgres-vacuum-analyze/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/cytech-services/laravel-postgres-vacuum-analyze/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/cytech-services/laravel-postgres-vacuum-analyze/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/cytech-services/laravel-postgres-vacuum-analyze/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/cytech-services/laravel-postgres-vacuum-analyze.svg?style=flat-square)](https://packagist.org/packages/cytech-services/laravel-postgres-vacuum-analyze)

This package provides a command that will vacuum and analylze tables for specific Laravel database connections for specific schemas.
You can then create a scheduled task for this command to regularly optimize your database!

## Installation

You can install the package via composer:

```bash
composer require cytech-services/laravel-postgres-vacuum-analyze
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-postgres-vacuum-analyze-config"
```

This is the contents of the published config file:

```php
return [

    /**
     * The connections to use for the vacuum analyze command.
     */
    'connections' => [
        /**
         * The connection name.
         * By default, the connection name is the default postgres connection.
         */
        'pgsql' => [
            /**
             * The schema name.
             * By default, the schema name is the public schema.
             */
            'public' => [
                /**
                 * A array list of tables to include in the vacuum analyze command.
                 * If no tables are specified, all tables will be included.
                 */
                'include' => [
                    //
                ],

                /**
                 * A array list of tables to exclude in the vacuum analyze command.
                 */
                'exclude' => [
                    //
                ],
            ],
        ],
    ],

    // Enable or disable the logging of errors.
    'log_errors' => true,

    // Enable or disable verbose logging.
    'log_verbose' => true,
];
```

## Usage

```bash
php artisan db:vacuum-analyze
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

- [Christopher Graham](https://github.com/cytech-services)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
