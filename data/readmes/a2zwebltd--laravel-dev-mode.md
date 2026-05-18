# Laravel Dev Mode

A lightweight Laravel package to temporarily disable Gate authorization for trusted developers.

[![Packagist Version](https://img.shields.io/packagist/v/a2zwebltd/laravel-dev-mode.svg)](https://packagist.org/packages/a2zwebltd/laravel-dev-mode)
[![Downloads](https://img.shields.io/packagist/dt/a2zwebltd/laravel-dev-mode.svg)](https://packagist.org/packages/a2zwebltd/laravel-dev-mode)
![PHP](https://img.shields.io/badge/PHP-%5E8.2-blue)
![Laravel](https://img.shields.io/badge/Laravel-12%20%7C%2013-blue)

This package lets developers temporarily bypass Laravel’s authorization system (Gates) to gain full access for testing or debugging. Access is automatically revoked after a configurable duration (default: 10 minutes). Security is enforced by limiting activation to a specific IP address and user combination.

It is designed for development environments. If you choose to enable it in production, be aware of the security implications. Activation still requires server access, so only privileged users can enable or disable Dev Mode.

## Features

* Temporarily bypasses Laravel Gates for a specific user and IP.
* Grants all abilities via a `Gate::before` hook integrated with Laravel’s authorization system.
* Access is time-limited through cache TTL (default: 600 seconds).
* Includes simple Artisan commands and a service API for programmatic control.
* Automatically revokes access after expiration.
* Provides IP-based restriction for additional security.
* Ships with an auto-discovered service provider and configurable TTL.
* Intended for development use; can be used in production with caution and proper access control.

## How it works

The package registers a `Gate::before` callback through its service provider.  
When Dev Mode is active, the callback grants all abilities to the specified user if the request originates from the whitelisted IP.  
Dev Mode status is stored in Laravel’s cache using keys like `dev-mode:{user_id}`, with automatic expiration after the configured TTL.

---

## Requirements

* PHP: ^8.2
* Laravel: 12 or 13

---

## Installation

Install via Composer:

```bash
composer require a2zwebltd/laravel-dev-mode
```

Publish the config:

```bash
php artisan vendor:publish --provider="A2ZWeb\DevMode\ServiceProvider"
```

---

## Configuration

- **Config file:** `config/dev-mode.php` (publishable)
- **Environment variable:** `DEV_MODE_TTL` (defaults to 600 seconds)
- **Service Provider:** `A2ZWeb\DevMode\ServiceProvider` (auto-discovered)
- **Cache key format:** `dev-mode:{user_id}`
- **Storage driver:** uses Laravel’s default cache backend

Example `.env`:
```env
DEV_MODE_TTL=600
```

---

## Usage

Dev Mode temporarily disables authorization checks for the defined user,
but only when requests come from the registered IP and while TTL is valid.

### Enable Dev Mode

```bash
php artisan dev-mode:enable --user=123 --ip=192.168.1.1
```

This command grants full access for the given user and IP combination for the configured TTL (default: 10 minutes).

### Disable Dev Mode

```bash
php artisan dev-mode:disable --user=123
```

*Tip:* You can include this command as a task inside the `deployer` script.

### Programmatic usage

```php
use A2ZWeb\DevMode\DevModeService;

$devMode = app(DevModeService::class);

// Enable for user and IP
$devMode->enable($user, '192.168.1.1');

// Check status
if ($devMode->isEnabled($user, request()->ip())) {
    // All abilities granted via Gate::before
}

// Disable
$devMode->disable($user);
```

Here’s a clean documentation section you can add under **Usage** or after **Programmatic usage** in your README.md:

---

### Conditional developer tools access

You can use the `DevModeService` check to conditionally enable developer tools such as **Laravel Debugbar**, **Telescope**, or any custom admin utilities for selected developers only.

Example:

```php
use A2ZWeb\DevMode\DevModeService;

$devMode = app(DevModeService::class);

if ($devMode->isEnabled(auth()->user(), request()->ip())) {
    // Show or enable developer-only tools
    \Debugbar::enable();
} else {
    \Debugbar::disable();
}
```

This lets you keep production safe while still giving specific developers full diagnostic visibility.
You can apply the same logic to any tool or section of your app that should remain hidden for normal users.


---
## Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly through private communication with the maintainers.

---
## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.

## Credits

Developed and maintained by the **A2Z WEB** crew:
* [Amir Yeganemehr](https://github.com/yeganemehr)
* [Dawid Makowski](https://github.com/makowskid)
* Website: [https://a2zweb.co/](https://a2zweb.co/)
* GitHub: [https://github.com/a2zwebltd/](https://github.com/a2zwebltd/)
* X/Twitter: [@a2zweb_co](https://twitter.com/a2zweb_co)

