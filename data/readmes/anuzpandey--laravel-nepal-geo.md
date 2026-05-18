# A Laravel Package for Nepal's Province, Districts and City Data.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/anuzpandey/laravel-nepal-geo.svg?style=flat-square)](https://packagist.org/packages/anuzpandey/laravel-nepal-geo)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/anuzpandey/laravel-nepal-geo/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/anuzpandey/laravel-nepal-geo/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/anuzpandey/laravel-nepal-geo/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/anuzpandey/laravel-nepal-geo/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/anuzpandey/laravel-nepal-geo.svg?style=flat-square)](https://packagist.org/packages/anuzpandey/laravel-nepal-geo)

This package provides a Laravel Migration and Seeder Files for Province, Districts and City of the country Nepal.

## Installation

You can install the package via composer:

```bash
composer require anuzpandey/laravel-nepal-geo
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="nepal-geo-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="nepal-geo-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Usage

After running the migrations, you can use the following seeder classes to seed the data.

```php
use AnuzPandey\LaravelNepalGeo\Database\Seeders\NepalGeoSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // This will seed the data for Nepal's Province, Districts and City
            NepalGeoSeeder::class, 
        ]);
    }
}
```

Or you can include individual seeder classes to seed the data.

```php
use AnuzPandey\LaravelNepalGeo\Database\Seeders\DistrictSeeder;
use AnuzPandey\LaravelNepalGeo\Database\Seeders\CitySeeder;
use AnuzPandey\LaravelNepalGeo\Database\Seeders\StateSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            StateSeeder::class,
            DistrictSeeder::class,
            CitySeeder::class,
        ]);
    }
}
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

- [AnuzPandey](https://github.com/anuzpandey)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
