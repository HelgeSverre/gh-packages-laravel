# Core Package

Core package for Laravel projects providing module support, helpers, and license verification. This package is developed for use in Devanox Private Limited projects.

## Installation

To install the package, use composer:

```bash
composer require devanox/core
```


## Configuration

Publish the configuration file using the following command:

```bash
php artisan vendor:publish --provider="Devanox\Core\Providers\CoreServiceProvider"
```

This will create a `core.php` configuration file in the `config` directory of your Laravel project.
