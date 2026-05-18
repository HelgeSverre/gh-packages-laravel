# Laravel Basics Package

[![Latest Version on Packagist](https://img.shields.io/packagist/v/danielemontecchi/laravel-basics.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-basics)
[![Total Downloads](https://img.shields.io/packagist/dt/danielemontecchi/laravel-basics.svg?style=flat-square)](https://packagist.org/packages/danielemontecchi/laravel-basics)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE.md)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/danielemontecchi/laravel-basics/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/danielemontecchi/laravel-basics/actions/workflows/tests.yml)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-basics&metric=coverage)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-basics)
[![PHPStan](https://img.shields.io/badge/PHPStan-level%20max-brightgreen.svg?style=flat-square)](https://phpstan.org/)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-basics&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-basics)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=danielemontecchi_laravel-basics&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=danielemontecchi_laravel-basics)
[![Documentation](https://img.shields.io/badge/docs-available-brightgreen.svg?style=flat-square)](https://danielemontecchi.github.io/laravel-basics)

A zero-setup package to bootstrap your Laravel projects with a collection of sensible defaults, strict mode helpers,
developer protections, and performance tooling. Inspired
by [nunomaduro/essentials](https://github.com/nunomaduro/essentials).

---

## Requirements

- PHP `^8.1 || ^8.2 || ^8.3 || ^8.4`
- Laravel `^10.0 | ^11.0 | ^12.0 | ^13.0`

---

## Installation

```bash
composer require danielemontecchi/laravel-basics
```

The package auto-registers via Laravel's service provider discovery.

---

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=laravel-basics-config
```

This will create `config/laravel-basics.php`, where each feature can be individually enabled or disabled.

---

## Full Setup: Development Tools, Code Style and Git Hooks

Run the following command to interactively install and configure useful development tools:

```bash
php artisan basics:setup
```

This command will offer to install and configure the following:

- **Laravel Folio**: page based routing for Laravel.
- **Laravel Octane**: supercharge your Laravel application's performance.
- **Laravel Pulse**: real-time application performance monitoring dashboard.
- **Laravel Reverb**: real-time WebSocket communication backend for Laravel.
- **Laravel Debugbar**: debugbar for Laravel applications.
- **Log Viewer**: fast and beautiful Log Viewer for Laravel logs.
- **Laravel Ray**: debug with Ray to fix problems faster.
- **Laravel Backup**: backup your Laravel applications.
- **Symfony Security Checker**: scan your app dependencies for known vulnerabilities.
- **Predis**: a flexible and feature-complete Redis/Valkey client for PHP.
- **Laravel Horizon**: dashboard and queue configuration for Laravel queues.
- **PHP-CS-Fixer**: a tool to automatically fix PHP Coding Standards issues.
- **PHPStan**: discover bugs in your code without running it (static analysis).
- **EditorConfig**: helps maintain consistent coding styles for multiple developers.
- **Pest**: an elegant PHP testing framework.
- **Peck**: identifies wording or spelling mistakes in your codebase.
- **Laravel IDE Helper**: generates IDE helper files for better autocompletion.
- **Husky Git Hooks**: improves your commits and more.
- **gitignore**: a standard gitignore file for Laravel projects.

You can safely rerun this command. It will never overwrite files without asking for confirmation.

---

## Available Features

### ✅ AutomaticallyEagerLoadRelationships

Enables automatic eager loading of relationships listed in `$touches` (Laravel 10.37+).
Prevents N+1 queries caused by deferred loading of touched relations.

### ✅ DefaultPasswordRules

Enforces stricter password validation globally in production: minimum 12 characters, maximum 50,
and cross-checked against known data breach databases.
No rules are enforced in non-production environments.

### ✅ DisableQueryLog

Disables the Eloquent query log in production. The log accumulates all executed queries in memory
and is only useful during debugging — leaving it enabled causes silent memory growth
in long-running processes.

### ✅ FakeSleep

Mocks `Sleep::for(...)` during tests so no real time is spent waiting.
Keeps the test suite fast without changing application code.

### ✅ ForceHttpsScheme

Forces all generated URLs to use HTTPS via `URL::forceScheme('https')`.
Useful when the app runs behind a proxy or CDN that terminates SSL.

### ✅ HttpClientGlobalTimeout

Sets a global timeout (default: 30 seconds) for all outgoing `Http::` client requests.
Prevents hanging requests from blocking production workers indefinitely.
Set the value in seconds; use `false` to disable.

### ✅ ImmutableDates

Replaces mutable `Carbon` instances with `CarbonImmutable` across the entire application.
Prevents accidental date mutations when passing date objects between methods.

### ✅ LogSlowQueries

Logs database queries exceeding a configurable threshold (default: 100ms) as warnings.
Helps surface performance issues early in development and staging.

### ✅ PreventAccessingMissingAttributes

Throws an exception when accessing a model attribute that has not been loaded or does not exist.
Catches typos and missing `select()` columns that would otherwise fail silently.

### ✅ PreventLazyLoading

Throws an exception for any lazy-loaded relationship in non-production environments.
Forces eager loading and prevents N+1 query problems from reaching production undetected.

### ✅ PreventSilentlyDiscardingAttributes

Throws an exception if attributes unknown to the model are passed to `fill()` or `create()`.
Prevents silent data loss caused by mismatched field names or typos in mass assignments.

### ✅ PreventStrayHttpRequests

Prevents real HTTP requests from being made during tests unless explicitly faked with `Http::fake()`.
Protects against tests accidentally calling external services.

### ✅ ProhibitDestructiveCommands

Blocks Artisan commands like `migrate:fresh`, `db:wipe`, and `migrate:reset` in production.
Reduces the risk of irreversible data loss from accidental command execution.

### ✅ SchemaDefaultStringLength

Sets the default string column length for migrations (default: 191).
Required for utf8mb4 charset support on older MySQL and MariaDB versions.

### ✅ SetDefaultTimezone

Sets the PHP runtime timezone from the `app.timezone` config value.
Complements `SetLocale` to ensure both locale and timezone are consistently applied
from the application configuration.

### ✅ SetLocale

Sets the PHP and Carbon locale using the current `app.locale` config value.
Ensures date formatting and string operations use the correct language settings.

### ✅ ShouldBeStrict

Enables Eloquent strict mode globally in non-production environments.
Combines `PreventLazyLoading`, `PreventSilentlyDiscardingAttributes`, and
`PreventAccessingMissingAttributes` into a single model-level setting.

### ✅ TrustProxies

Configures trusted proxies for applications running behind load balancers or CDNs.
Required for `ForceHttpsScheme` and correct client IP detection to work reliably
when the app sits behind a reverse proxy. Trusts `127.0.0.1` and `::1` by default.

### ✅ UnguardModels

Disables Laravel mass-assignment protection globally.
Use only in safe, controlled environments such as internal tools, seeders, or closed systems.

### ✅ ViteAggressivePrefetching

Enables aggressive chunk prefetching in Vite to reduce navigation latency in SPAs.

---

## License

Laravel Basics is open-source software licensed under the **MIT license**.
See the [LICENSE.md](LICENSE.md) file for full details.

---

Made with ❤️ by [Daniele Montecchi](https://danielemontecchi.com)
