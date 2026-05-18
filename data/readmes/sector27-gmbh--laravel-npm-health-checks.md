# Laravel npm Health Checks

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sector27-gmbh/laravel-npm-health-checks.svg?style=flat-square)](https://packagist.org/packages/sector27-gmbh/laravel-npm-health-checks)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/sector27-gmbh/laravel-npm-health-checks/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/sector27-gmbh/laravel-npm-health-checks/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/sector27-gmbh/laravel-npm-health-checks/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/sector27-gmbh/laravel-npm-health-checks/actions/workflows/fix-php-code-style-issues.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/sector27-gmbh/laravel-npm-health-checks.svg?style=flat-square)](https://packagist.org/packages/sector27-gmbh/laravel-npm-health-checks)

This package adds a [Laravel Health](https://github.com/spatie/laravel-health) check for npm security advisories. It runs `npm audit --json`, stores the parsed audit output as check meta, and reports warnings or failures based on configurable severity thresholds.

## Installation

You can install the package via composer:

```bash
composer require sector27-gmbh/laravel-npm-health-checks
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-npm-health-checks-config"
```

This is the contents of the published config file:

```php
return [
    'paths' => [
        base_path(),
    ],

    'include_dev_dependencies' => false,

    'warning_threshold' => 'moderate',

    'failure_threshold' => 'high',

    'npm_binary' => 'npm',

    'timeout' => 60,
];
```

## Usage

Register the check with Laravel Health:

```php
use Sector27\LaravelNpmHealthChecks\NpmAuditCheck;
use Spatie\Health\Facades\Health;

Health::checks([
    NpmAuditCheck::new(),
]);
```

By default, the check audits production dependencies in your application root. It returns `ok` without a notification message when no vulnerabilities meet the warning threshold.

You may configure the check fluently:

```php
Health::checks([
    NpmAuditCheck::new()
        ->atPaths([
            base_path(),
            base_path('resources/frontend'),
        ])
        ->includeDevDependencies()
        ->warnWhenSeverityIsAtLeast('moderate')
        ->failWhenSeverityIsAtLeast('high')
        ->timeout(120),
]);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [sector27 GmbH](https://github.com/sector27-gmbh)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
