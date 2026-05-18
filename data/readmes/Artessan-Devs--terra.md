# Laravel Terra — comprehensive world geodata

[![Latest Version on Packagist](https://img.shields.io/packagist/v/artessan-devs/terra.svg?style=flat-square)](https://packagist.org/packages/artessan-devs/terra)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/artessan-devs/terra/run-tests.yml?branch=development&label=tests&style=flat-square)](https://github.com/artessan-devs/terra/actions?query=workflow%3Arun-tests+branch%3Adevelopment)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/artessan-devs/terra/fix-php-code-style-issues.yml?branch=development&label=code%20style&style=flat-square)](https://github.com/artessan-devs/terra/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Adevelopment)
[![Total Downloads](https://img.shields.io/packagist/dt/artessan-devs/terra.svg?style=flat-square)](https://packagist.org/packages/artessan-devs/terra)

A Laravel package for countries, states, cities, currencies, postcodes, and timezones with multi-language support.

Data sourced from [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database).

## Installation

```bash
composer require artessan-devs/terra
```

Publish and run migrations:

```bash
php artisan vendor:publish --tag="terra-migrations"
php artisan migrate
```

Publish the config:

```bash
php artisan vendor:publish --tag="terra-config"
```

## Usage

Seed the geodata:

```bash
php artisan terra:seed
```

Query models:

```php
use App\Models\Country;

$countries = Country::where('iso2', 'US')->first();
echo $countries->name; // United States
echo $countries->translation('name', 'es'); // Estados Unidos
```

### Choosing a primary key type

Set `TERRA_ID_TYPE=uuid-v4` in your `.env` before running migrations. Extend the model classes to add `HasUuids` / `HasUlids` traits, then register them in `config('terra.models.*')`.

## Models

| Model | Translatable | Relations |
|---|---|---|---|
| `Region` | `localized_name` | `hasMany(Subregion)`, `hasMany(Country)` |
| `Subregion` | `localized_name` | `belongsTo(Region)`, `hasMany(Country)` |
| `Country` | `localized_name` | `belongsTo(Region)`, `belongsTo(Subregion)`, `belongsTo(Currency)`, `hasMany(Timezone)`, `hasMany(State)`, `hasMany(City)`, `hasMany(Postcode)` |
| `State` | `localized_name` | `belongsTo(Country)`, `belongsTo(State, parent_id)`, `hasMany(State, children)`, `hasMany(City)`, `hasMany(Postcode)` |
| `City` | `localized_name` | `belongsTo(State)`, `belongsTo(Country)`, `belongsTo(City, parent_id)`, `hasMany(City, children)`, `hasMany(Postcode)` |
| `Currency` | — | `hasMany(Country)` |
| `Timezone` | — | `belongsTo(Country)` |
| `Postcode` | — | `belongsTo(Country)`, `belongsTo(State)`, `belongsTo(City)` |

## Testing

```bash
composer test
```

## Data source

This package ships with geodata from [dr5hn/countries-states-cities-database](https://github.com/dr5hn/countries-states-cities-database) (MIT license). The dataset includes translations for 250+ countries, 5,000+ states, 150,000+ cities, and postcodes.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## License

The MIT License (MIT). See [LICENSE](LICENSE.md).
