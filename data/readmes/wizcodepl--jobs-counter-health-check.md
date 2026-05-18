<p align="center">
  <img src="art/logo.svg" alt="Jobs Counter Health Check" width="200">
</p>

# This package provides a Laravel Health check to monitor the number of active and failed jobs in your queue system.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wizcodepl/jobs-counter-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/jobs-counter-health-check)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/jobs-counter-health-check/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wizcodepl/jobs-counter-health-check/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/jobs-counter-health-check/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wizcodepl/jobs-counter-health-check/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wizcodepl/jobs-counter-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/jobs-counter-health-check)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## About us
Wizcode builds expandable MVPs with lightning-speed development solutions. We create scalable web platforms, mobile apps, and IoT solutions. Check for more: https://wizcode.pl

## Installation

You can install the package via composer:

```bash
composer require wizcodepl/jobs-counter-health-check
```

## Usage

```php
use WizcodePl\JobsCounterHealthCheck\JobsCounterCheck;

Health::checks([
    JobsCounterCheck::new()
        ->failedJobsThreshold(1)
        ->queue('default'),
]);
```

for all queues:

```php
use WizcodePl\JobsCounterHealthCheck\JobsCounterCheck;

Health::checks([
    JobsCounterCheck::new()
        ->failedJobsThreshold(1),
]);
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

- [Jakub Szcześniak](https://github.com/jakub-wizcode)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
