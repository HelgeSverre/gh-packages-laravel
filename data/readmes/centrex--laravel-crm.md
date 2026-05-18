# Laravel CRM

[![Latest Version on Packagist](https://img.shields.io/packagist/v/centrex/laravel-crm.svg?style=flat-square)](https://packagist.org/packages/centrex/laravel-crm)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/centrex/laravel-crm/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/centrex/laravel-crm/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/centrex/laravel-crm/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/centrex/laravel-crm/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/centrex/laravel-crm?style=flat-square)](https://packagist.org/packages/centrex/laravel-crm)

A lightweight CRM foundation for Laravel apps with first-party support for companies, contacts, leads, deals, activities, and a simple dashboard view.

## Contents

  - [Installation](#installation)
  - [Usage](#usage)
  - [Testing](#testing)
  - [Changelog](#changelog)
  - [Contributing](#contributing)
  - [Credits](#credits)
  - [License](#license)

## Installation

You can install the package via composer:

```bash
composer require centrex/laravel-crm
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-crm-config"
```

This is the contents of the published config file:

```php
return [
    'table_prefix' => 'crm_',
    'drivers' => [
        'database' => [
            'connection' => env('CRM_DB_CONNECTION', env('DB_CONNECTION', 'sqlite')),
        ],
    ],
];
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="laravel-crm-migrations"
php artisan migrate
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="laravel-crm-views"
```

## Usage

```php
use Centrex\Crm\Crm;

$crm = app(Crm::class);

$lead = $crm->createLead([
    'title' => 'ERP rollout for Alpine Foods',
    'source' => 'website',
    'value' => 150000,
]);

$deal = $crm->qualifyLead($lead, [
    'expected_close_date' => now()->addMonth()->toDateString(),
]);

$crm->advanceDealStage($deal, 'proposal');

$summary = $crm->getPipelineSummary();
```

When web routes are enabled, the package also exposes a simple `/crm` dashboard.

## Testing

🧹 Keep a modern codebase with **Pint**:
```bash
composer lint
```

✅ Run refactors using **Rector**
```bash
composer refacto
```

⚗️ Run static analysis using **PHPStan**:
```bash
composer test:types
```

✅ Run unit tests using **PEST**
```bash
composer test:unit
```

🚀 Run the entire test suite:
```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [rochi88](https://github.com/centrex)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
