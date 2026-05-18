# Visualize eloquent models information

[![Latest Version on Packagist](https://img.shields.io/packagist/v/c-arena/eloquent-stalker.svg?style=flat-square)](https://packagist.org/packages/c-arena/eloquent-stalker)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/c-arena/eloquent-stalker/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/c-arena/eloquent-stalker/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/c-arena/eloquent-stalker/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/c-arena/eloquent-stalker/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/c-arena/eloquent-stalker.svg?style=flat-square)](https://packagist.org/packages/c-arena/eloquent-stalker)

It helps visualize the eloquent models and their defined relationships. Very useful when comparing to the actual database so we can know what relationships are missing.


## Installation

You can install the package via composer:

```bash
composer require c-arena/eloquent-stalker
```

Now you need to run the installer:

```bash
php artisan eloquent-stalker:install
```

Optionally, you can publish the views using

```bash
php artisan vendor:publish --tag="eloquent-stalker-views"
```

You have to make sure the namespace and class name are directly related to the path of the models. Otherwise, it won't work as expected. We use the app_path() to look for all the existant models in your project.

## Usage

There are two ways in which you can use this package:

### Console

You can list all your models with its info using an artisan command we provide for you:

```sh
php artisan eloquent-stalker:models
```

You might also want to list all the relationships

```sh
php artisan eloquent-stalker:relationships
```

Optionally, you can pass the name of a model to check its relationships

```sh
php artisan eloquent-stalker:relationships User
```

### Browser

We provide a route (which you can configure in the config file) that will be shown in development mode. By default, the route will be '/eloquent-stalker'.

![alt text](image.png)

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Carlos Arena](https://github.com/C-ArenA)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
