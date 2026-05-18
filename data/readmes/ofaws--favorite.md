# Favorites

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ofaws/favorite.svg?style=flat-square)](https://packagist.org/packages/ofaws/favorite)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ofaws/favorite/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ofaws/favorite/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ofaws/favorite/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ofaws/favorite/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ofaws/favorite.svg?style=flat-square)](https://packagist.org/packages/ofaws/favorite)

A Laravel package allowing users to mark as favorite any instance that has a Favoritable trait.

## Installation

You can install the package via composer:

```bash
composer require ofaws/favorite
```

Then run the installation command:
```bash
php artisan favorite:install
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="favorite-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="favorite-config"
```

It is very important to set the 'assets' and 'morph_map' values in the config file


## Usage

Add `HasFavorites` trait to your user model and `CanBeFavorite` trait to assets models.
Don't forget to add assets models to 'assets' and 'morph_map' values in the config file if you aim to use controller 
provided by this package

In order to use `filtered` scope within package's favorites controller you must ensure that each model using 
`CanBeFavorite` trait has a `type` column in corresponding table.

You can also add `filterByFavorite()` method to query builder of a model using `CanBeFavorite` trait - it will add
the `filtered` filter which can be true or false.

You can check the available endpoints by running the command below. Package will publish the routes while installation.
```bash
php artisan route:list
```

If you aim to use only the relations set by this package - check the traits to see what features are available.

## Testing

```bash
composer test
```

## Documentation

Please see [DOCUMENTATION](DOCUMENTATION.md) for more information on how to use package features.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Olga Fursova](https://github.com/ofaws)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
