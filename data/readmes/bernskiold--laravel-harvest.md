# Laravel Harvest API

[![Latest Version on Packagist](https://img.shields.io/packagist/v/bernskioldmedia/laravel-harvest.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-harvest)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/bernskioldmedia/laravel-harvest/run-tests?label=tests)](https://github.com/bernskioldmedia/laravel-harvest/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/workflow/status/bernskioldmedia/laravel-harvest/Check%20&%20fix%20styling?label=code%20style)](https://github.com/bernskioldmedia/laravel-harvest/actions?query=workflow%3A"Check+%26+fix+styling"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/bernskioldmedia/laravel-harvest.svg?style=flat-square)](https://packagist.org/packages/bernskioldmedia/laravel-harvest)

This package adds a fluent way of interacting with the [Harvest](https://getharvest.com) time tracking system and its
API.

## Installation

You can install the package via composer:

```bash
composer require bernskioldmedia/laravel-harvest
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="harvest-config"
```

This is the contents of the published config file:

```php
return [

    /**
     * The API key used for authenticating with the Harvest API.
     */
    'api_key' => env('HARVEST_API_KEY', ''),

    /**
     * The Account ID number from Harvest that you want to use.
     */
    'account_id' => env('HARVEST_ACCOUNT_ID', ''),

    /**
     * The user agent (application name) is sent through to
     * Harvest so that they can identify who requests come from.
     */
    'application_name' => env('HARVEST_APP_NAME', env('APP_NAME')),

    /**
     * The contact e-mail address for the application is required
     * so that Harvest can get in touch for any reason.
     */
    'application_email' => env('HARVEST_APP_EMAIL', ''),

    /**
     * The Base URL for the Harvest API including the version.
     * This package currently only supports V2 of the API.
     */
    'base_url' => env('HARVEST_API_URL', 'https://api.harvestapp.com/v2'),

];
```

## Usage

The package provides a convenient facade to interact with all resources. The package will let you consume the API
through fluent methods, but will not touch or map the response coming from the API. Please see the [Harvest API docs](#)
for more information on responses.

The package currently supports all Harvest API resources, as well as their reporting endpoints. Your IDE should discover
them on the Harvest Facade when typing.

When getting lists using the `all` method there are also fluent filtering methods to help you filter. Additionally some
resources have "actions" as well. The names of these functions match mostly to the parameters in the Harvest API docs.

```php
use BernskioldMedia\Harvest\Facades\Harvest;

// Get all clients from Harvest.
Harvest::clients()->all();

// Show only active clients from Harvest.
Harvest::clients()->active()->all();

// Get a single client from Harvest.
Harvest::clients()->get(123);

// Create a client from Harvest.
Harvest::clients()->create(['name' => 'My new client']);

// Update a client in Harvest.
Harvest::clients()->update(123, ['name' => 'My new name']);

// Delete a client from Harvest.
Harvest::clients()->delete(123);

// Mark an invoice as sent.
Harvest::invoices()->send(1);
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Bernskiold Media](https://github.com/bernskioldmedia)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
