# Laravel Sensible

[![Latest Stable Version](https://poser.pugx.org/datalogix/laravel-sensible/version)](https://packagist.org/packages/datalogix/laravel-sensible)
[![Total Downloads](https://poser.pugx.org/datalogix/laravel-sensible/downloads)](https://packagist.org/packages/datalogix/laravel-sensible)
[![tests](https://github.com/datalogix/laravel-sensible/workflows/tests/badge.svg)](https://github.com/datalogix/laravel-sensible/actions)
[![StyleCI](https://github.styleci.io/repos/966925497/shield?style=flat)](https://github.styleci.io/repos/966925497)
[![codecov](https://codecov.io/gh/datalogix/laravel-sensible/branch/main/graph/badge.svg)](https://codecov.io/gh/datalogix/laravel-sensible)
[![License](https://poser.pugx.org/datalogix/laravel-sensible/license)](https://packagist.org/packages/datalogix/laravel-sensible)

> Laravel Sensible is a lightweight utility package for applying smart defaults and common best practices in everyday Laravel development.

## Installation

You can install the package via composer:

```bash
composer require datalogix/laravel-sensible
```

The package will automatically register itself.

## Features

All features are optional and fully configurable via `config/sensible.php`:

-   🚀 **Asset Prefetching** – Preload assets for faster load times.
-   ⚡️ **Auto Eager Loading** – Avoid N+1 queries automatically.
-   😴 **Fake Sleep** – Mocks the delay function in tests, preventing real delays.
-   🔒 **Force HTTPS** – Enforce secure `https://` URLs.
-   🕒 **Immutable Dates** – Prevent unexpected date mutations.
-   🔄 **Prevent Stray Requests** – Block unmocked HTTP requests.
-   🛑 **Safe Console** – Block dangerous Artisan commands.
-   🔑 **Set Default Password** - Enforce strong password policies.
-   ✅ **Strict Models** – Enforce strict model behavior.
-   🔓 **Optional Unguarded Models** – Disable mass-assignment protection.

## Configuration

You can publish the config file using the command:

```bash
php artisan vendor:publish --provider="Datalogix\Sensible\SensibleServiceProvider" --tag="config"
```

This will create a `config/sensible.php` file where you can enable or disable individual features:`

```php
// config/sensible.php

return [
    \Datalogix\Sensible\Configurables\Unguard::class => false,
    // other configurables...
];
```

By default, most features are enabled. Simply set any option to `false` to disable it.
