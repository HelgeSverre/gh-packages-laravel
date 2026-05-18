# Laravel Doctor

<p align="center">
  <a href="https://rdhafiz.github.io/laravel-doctor/"><img src="marketing/og-cover.png" alt="Laravel Doctor" width="1200"></a>
</p>

Instantly diagnose configuration, performance and production safety issues in your Laravel application.

📄 **[View the landing page →](https://rdhafiz.github.io/laravel-doctor/)**

[![Tests](https://github.com/rdhafiz/laravel-doctor/actions/workflows/tests.yml/badge.svg)](https://github.com/rdhafiz/laravel-doctor/actions/workflows/tests.yml)
[![Latest Version](https://img.shields.io/packagist/v/codevioso/laravel-doctor.svg)](https://packagist.org/packages/codevioso/laravel-doctor)
[![Downloads](https://img.shields.io/packagist/dt/codevioso/laravel-doctor.svg)](https://packagist.org/packages/codevioso/laravel-doctor)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Introduction

Laravel Doctor is a CLI tool that scans your Laravel application for common configuration mistakes, performance anti-patterns, and production safety issues. It runs a set of checks against your app config, environment, and filesystem and reports findings with actionable messages.

Production misconfigurations—debug mode enabled, file-based cache in production, sync queue driver, missing storage symlink—are easy to overlook but costly in production. Laravel Doctor surfaces these issues before they impact users or performance. It verifies cache state, driver choices, file permissions, PHP extensions, and more.

Run it locally. No external services, no API calls, no network dependencies.

```bash
php artisan doctor:check
```

## Installation

```bash
composer require codevioso/laravel-doctor
```

Optionally publish the config file:

```bash
php artisan vendor:publish --tag=doctor-config
```

## Usage

```bash
php artisan doctor:check
```

**Run only specific checks:**

```bash
php artisan doctor:check --only=ConfigCacheCheck
```

**Skip checks:**

```bash
php artisan doctor:check --skip=RouteCacheCheck,ViewCacheCheck
```

**Demo report (sample output, no real checks):**

```bash
php artisan doctor:check --demo
```

## Example Output

```
Laravel Doctor Report
=====================

Errors: 1 | Warnings: 2 | Suggestions: 1 | Passed: 10

Errors:
--------
APP_DEBUG is enabled in production. Set APP_DEBUG=false.

Warnings:
---------
Cache driver is file in production. Use redis/memcached/database for better performance.
Config is not cached. Run: php artisan config:cache

Suggestions:
-----------
Cannot verify queue worker process from PHP. Ensure a supervisor/systemd process runs: php artisan queue:work

Passed:
--------
APP_ENV matches the environment.
Route cache not required for this environment.
View cache not required for this environment.
Queue driver is not sync in production.
Session driver is not file in production.
Storage symlink exists.
Log channel is appropriate for environment.
Composer autoload optimization not required for this environment.
All required PHP extensions are available.
Storage and bootstrap/cache directories are writable.

Completed in 45 ms
Fix errors first, then rerun.
```

## Included Checks

- APP_DEBUG in production
- APP_ENV mismatch
- Config cache
- Route cache
- View cache
- Queue sync driver in production
- Queue worker detection
- Cache driver in production
- Session driver in production
- Storage symlink
- File permissions
- Composer optimized autoload
- Required PHP extensions
- Log channel configuration

## Configuration

The `config/doctor.php` file controls which checks run and how. After publishing, you can:

- **Enable or disable the package:** Set `enabled` to `true` or `false`.
- **Enable or disable individual checks:** Use the `checks` array. Keys are check class names, values are `true` or `false`.
- **High-traffic flag:** Set `environment.high_traffic` to `true` to enable additional logging-related checks.
- **Custom checks:** Add class names to the `custom_checks` array to run your own checks (they are enabled by default).

## Extending (Custom Checks)

Register your own checks by implementing `Codevioso\LaravelDoctor\Contracts\CheckInterface` and registering them with the `Doctor` service:

```php
use Codevioso\LaravelDoctor\Doctor;

public function boot()
{
    app(Doctor::class)->registerCheck(App\Doctor\MyCustomCheck::class);
}
```

Custom checks must implement `CheckInterface`, which defines `key()`, `title()`, and `run(DoctorContext $context)` returning a `CheckResult`.

## Contributing

Contributions are welcome. Please submit a pull request on [GitHub](https://github.com/rdhafiz/laravel-doctor). Run tests before submitting (`composer test`) and follow the existing package architecture for checks and configuration.

## Security

If you discover a security vulnerability, please report it privately via [GitHub Security Advisories](https://github.com/rdhafiz/laravel-doctor/security/advisories) or contact the maintainers. Do not open a public issue.

## License

The MIT License (MIT). Please see [LICENSE](LICENSE) for more information.
