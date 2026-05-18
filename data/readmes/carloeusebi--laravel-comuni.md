<a href="https://github.com/carloeusebi/laravel-comuni/actions" target="_blank">
    <img alt="Tests" src="https://github.com/carloeusebi/laravel-comuni/actions/workflows/tests.yml/badge.svg">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-comuni" target="_blank">
    <img alt="Total Downloads" src="https://img.shields.io/packagist/dt/carloeusebi/laravel-comuni">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-comuni" target="_blank">
    <img alt="Latest Version" src="https://img.shields.io/packagist/v/carloeusebi/laravel-comuni">
</a>
<a href="https://packagist.org/packages/carloeusebi/laravel-comuni" target="_blank">
    <img alt="License" src="https://img.shields.io/packagist/l/carloeusebi/laravel-comuni">
</a>

# Laravel Comuni

A Laravel package that provides a simple and elegant way to retrive italian comuni, province and regioni.
This package uses third party apis and provides only an easy wrapper to access those apis.

Currently supported apis:

- [Samurai016/Comuni-ITA](https://github.com/Samurai016/Comuni-ITA)

## Installation

You can install the package via composer:

```bash
composer require carloeusebi/laravel-comuni
```

The package will automatically register its service provider.

## Usage

This package provides a simple facade to access Italian geographical data:

```php
use CarloEusebi\LaravelComuni\Facades\Comuni;

// Get all regions
$regions = Comuni::regioni();

// Get all provinces
$provinces = Comuni::province();

// Get all municipalities
$comuni = Comuni::comuni();

// Get municipalities by region
$comuni = Comuni::comuni(regione: 'Lazio');

// Get municipalities by province
$comuni = Comuni::comuni(provincia: 'Roma');
```

### Filtering and Pagination

You can filter and paginate results using the `params` array:

```php
// Get municipalities with pagination
$comuni = Comuni::comuni(params: ['page' => 1, 'pagesize' => 10]);

// Filter municipalities by name
$comuni = Comuni::comuni(params: ['nome' => 'Roma']);

// Get only municipality names
$comuni = Comuni::comuni(params: ['onlyname' => true]);

// Filter regions by name
$regions = Comuni::regioni(['nome' => 'Lazio']);
```

### Available Parameters

For available parameters please refer to third parties documentations:

- [Samurai016/Comuni-ITA](https://comuni-ita.readme.io/reference/comuni-1)

## Configuration

You can publish the configuration file with:

```bash
php artisan vendor:publish --provider="CarloEusebi\LaravelComuni\ComuniServiceProvider"
```

This will create a `config/comuni.php` file where you can modify the default settings:

You can safely cache the responses for a long period of time. As these services are hosted on free platforms, please
consider keeping responses cached as long as possible.

```php
return [

    // currently the only provider is `comuni-ita`
    'provider' => 'comuni-ita',

    'cache' => [
        // the prefix for the cache key
        'prefix' => 'comuni-',

        // the number of days the responses should be cached for
        'ttl' => 60,

        // the number of days after which the cache becomes stale
        'stale' => 30,
    ],
];
```

## Response Format

All methods return Laravel Collections. Here's an example of the data structure for each type:

### Comuni

```php
[
    'codice' => '058091',
    'nome' => 'Roma',
    'nomeStraniero' => 'Rome',
    'cap' => ['00118', '00121', '00122', ...],
    'prefisso' => '06',
    'provincia' => [
        'codice' => '058',
        'nome' => 'Roma',
        'sigla' => 'RM',
        'regione' => 'Lazio'
    ],
    'email' => 'protocollo.gabinettosindaco@pec.comune.roma.it',
    'pec' => 'protocollo.gabinettosindaco@pec.comune.roma.it',
    'telefono' => '0667101',
    'fax' => '0667103590',
    'popolazione' => 2873494,
    'coordinate' => [
        'lat' => 41.89277,
        'lng' => 12.48366
    ]
]
```

### Province

```php
[
    'codice' => '058',
    'nome' => 'Roma',
    'sigla' => 'RM',
    'regione' => 'Lazio'
]
```

### Regioni

Returns a collection of region names as strings:

```php
['Abruzzo', 'Basilicata', 'Calabria', ...]
```

## Faking

This package already has a comprehensive test suite. You don't need to test this package in your app.
But if you would like to test your implementation of this package, you can mock `Comuni` and decide what it should
return, or you can fake it and this package will generate a fake generic response for you.

```php
\CarloEusebi\LaravelComuni\Facades\Comuni::fake();

\CarloEusebi\LaravelComuni\Facades\Comuni::shouldReceive('comuni')->andReturn(collect(['Abano Terme', 'Abbadia Cerreto', 'Abbadia Lariana', 'Abbadia San Salvatore']));
```

## Testing

This package includes a comprehensive test suite. To run tests:

```bash
composer test
```
