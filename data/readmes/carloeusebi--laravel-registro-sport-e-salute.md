<a href="https://github.com/carloeusebi/laravel-registro-sport-e-salute/actions" target="_blank">
    <img alt="Tests" src="https://github.com/carloeusebi/laravel-registro-sport-e-salute/actions/workflows/tests.yml/badge.svg">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-registro-sport-e-salute" target="_blank">
    <img alt="Total Downloads" src="https://img.shields.io/packagist/dt/carloeusebi/laravel-registro-sport-e-salute">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-registro-sport-e-salute" target="_blank">
    <img alt="Latest Version" src="https://img.shields.io/packagist/v/carloeusebi/laravel-registro-sport-e-salute">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-registro-sport-e-salute" target="_blank">
    <img alt="License" src="https://img.shields.io/packagist/l/carloeusebi/laravel-registro-sport-e-salute">
</a>

# Laravel Registro Sport e Salute

A Laravel package that provides a simple and elegant wrapper around the Italian "Registro Sport e Salute" API. This
package allows you to search and retrieve information about sports organizations registered in the Italian Sports
Registry.

Please visit the original [https://registro.sportesalute.eu](https://registro.sportesalute.eu/#/registro).

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
    - [Basic Usage](#basic-usage)
    - [Filtering](#filtering)
    - [Pagination](#pagination)
    - [Order](#order)
    - [Getting Organization Details](#getting-organization-details)
    - [Faking](#faking)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Requirements

- PHP 8.4 or higher
- Laravel 12.15 or higher

## Installation

Run the following command to install the latest version of the package:

```bash
composer require carloeusebi/laravel-registro-sport-e-salute
```

## Usage

### Basic Usage

```php
use CarloEusebi\RegistroSportESalute\Facades\RegistroSportESalute;


// Get organizations (returns a Collection of Organization objects)
$organizations = RegistroSportESalute::get();

// Access organization properties
foreach ($organizations as $organization) {
    echo $organization->getDenominazione(); // Organization name
    echo $organization->getCodiceFiscale(); // Tax code
    echo $organization->getRegioneSedeLegale(); // Region
    echo $organization->getComuneSedeLegale(); // City

    // Convert to array
    $organizationArray = $organization->toArray();
}

RegistroSportESalute::getCount() // The total number of matched records, useful for pagination
```

### Filtering

You can filter organizations by name (denominazione) or tax code (codice fiscale):

```php
use CarloEusebi\RegistroSportESalute\Facades\RegistroSportESalute;

// Filter by name
$organizations = RegistroSportESalute::filterByDenominazione('Sport Club')->get();

// Filter by tax code
$organizations = RegistroSportESalute::filterByCodiceFiscale('12345678901')->get();

// Chain filters
//💡 Tip: the `builder` method is an eye candy for when you have multiple statements
$organizations = RegistroSportESalute::builder() 
    ->filterByDenominazione('Sport Club')
    ->filterByCodiceFiscale('12345678901')
    ->get();
```

The ability to filter by other fields may come in future updates, or if you really really need it you can submit a PR.

### Pagination

The API supports pagination:

```php
use CarloEusebi\RegistroSportESalute\Facades\RegistroSportESalute;

// Set page (default is 1)
$organizations = RegistroSportESalute::page(2)->get();

// Set page size (default is 10)
$organizations = RegistroSportESalute::page(pageSize: 25)->get();

// Chain with filters
$organizations = RegistroSportESalute::builder()
    ->filterByDenominazione('Sport Club')
    ->page(2, 25)
    ->get();
```

### Order

Order feature is not present. If you need it please create an issue or submit a PR.

### Getting Organization Details

You can get detailed information about a specific organization by its ID:

```php
use CarloEusebi\RegistroSportESalute\Facades\RegistroSportESalute;

// Get organization details by ID
$details = RegistroSportESalute::getById(123);

// $details is an associative array with organization details
echo $details['Denominazione'];
echo $details['Codice Fiscale'];
// etc.
```

### Faking

You can `fake` the facade so you can focus on testing your own code.

```php
use CarloEusebi\RegistroSportESalute\Facades\RegistroSportESalute;

RegistroSportESalute::fake(
   count: 2 // how may mock Organizations should return; will return one by default
   shouldThrowHttpException: true, // it should simulate an HttpClientException
);
```

## Testing

This package includes a comprehensive test suite. To run the tests:

```bash
composer test
```

You can also run specific test suites:

```bash
# Run only unit tests
composer test:unit

# Check types wit PHPStan
composer test:types

# Check code style with Pint
composer test:lint
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
