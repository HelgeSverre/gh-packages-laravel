<p align="center">
  <img src="art/logo.svg" alt="Outdated Packages Health Check" width="200">
</p>

# This package contains a Laravel Health check that can report any outdated PHP packages installed in your application using Composer.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wizcodepl/outdated-packages-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/outdated-packages-health-check)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/outdated-packages-health-check/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wizcodepl/outdated-packages-health-check/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/outdated-packages-health-check/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wizcodepl/outdated-packages-health-check/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wizcodepl/outdated-packages-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/outdated-packages-health-check)


This package contains a Laravel Health check that can report any outdated PHP packages installed in your application using Composer.

## About us
Wizcode builds expandable MVPs with lightning-speed development solutions. We create scalable web platforms, mobile apps, and IoT solutions. Check for more: https://wizcode.pl

## Installation

You can install the package via composer:

```bash
composer require wizcodepl/outdated-packages-health-check
```

## Usage

```php
use Spatie\Health\Facades\Health;
use WizcodePl\OutdatedPackagesHealthCheck\OutdatedPackagesCheck;

Health::checks([
    OutdatedPackagesCheck::new()
        ->direct()
        ->includeDev()
        ->composerPath('/path/to/composer'),
]);
```

By default the check **warns when ANY package has a newer release** (patch / minor / major). On a busy app this is noisy — every patch bump turns the dashboard yellow. To get signal on only the bumps that matter to you, restrict alert levels:

```php
// Alert only on major bumps (1.x.x → 2.0.0). Patch and minor still appear in `meta`,
// but they don't drive the check status.
OutdatedPackagesCheck::new()->onlyMajor();

// Alert on minor and major (e.g. 1.2.x → 1.3.0 or 2.0.0).
OutdatedPackagesCheck::new()->minorAndAbove();

// Or pick the exact set yourself:
OutdatedPackagesCheck::new()->alertOnLevels([
    OutdatedPackagesCheck::LEVEL_MAJOR,
    OutdatedPackagesCheck::LEVEL_MINOR,
]);
```

Versions that can't be parsed as `MAJOR.MINOR.PATCH` (e.g. `dev-main`, prerelease tags with the same numeric core) are bucketed as `LEVEL_UNKNOWN` and are alerted alongside `LEVEL_MAJOR` by `onlyMajor()` and `minorAndAbove()` — better to alarm wrongly than to silently miss a real upgrade.

The result's `meta` always contains the full picture, so dashboards can show what's outdated regardless of alerting:

```php
[
    'outdated_total' => 7,
    'outdated_by_level' => ['major' => 1, 'minor' => 2, 'patch' => 4, 'unknown' => 0],
    'alert_levels' => ['major', 'unknown'],
    'alerting_packages' => [
        ['name' => 'vendor/x', 'version' => '1.2.3', 'latest' => '2.0.0', 'level' => 'major'],
    ],
]
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Jakub Szcześniak](https://github.com/:jakub-wizcode)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
