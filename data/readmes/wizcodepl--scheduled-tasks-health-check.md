<p align="center">
  <img src="art/logo.svg" alt="Scheduled Tasks Health Check" width="200">
</p>

# About

[![Latest Version on Packagist](https://img.shields.io/packagist/v/wizcodepl/scheduled-tasks-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/scheduled-tasks-health-check)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/scheduled-tasks-health-check/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/wizcodepl/scheduled-tasks-health-check/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/wizcodepl/scheduled-tasks-health-check/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/wizcodepl/scheduled-tasks-health-check/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/wizcodepl/scheduled-tasks-health-check.svg?style=flat-square)](https://packagist.org/packages/wizcodepl/scheduled-tasks-health-check)

Scheduled Tasks Health Check is a package for Laravel Health that monitors the execution of scheduled tasks (cron jobs). It helps ensure that your scheduled commands are running as expected and alerts you if any tasks fail or are delayed.

## About Us

Wizcode builds expandable MVPs with lightning-speed development solutions. We create scalable web platforms, mobile apps, and IoT solutions. Check for more: https://wizcode.pl

## Installation

You can install the package via composer:

```bash
composer require wizcodepl/scheduled-tasks-health-check
```

## Usage

```php
Health::checks([
    \App\Attributes\ScheduledTasksHealthCheck::new(),
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
