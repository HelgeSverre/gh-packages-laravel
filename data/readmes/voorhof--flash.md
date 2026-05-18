# Flash Message

[![Latest Version on Packagist](https://img.shields.io/packagist/v/voorhof/flash.svg?style=flat-square)](https://packagist.org/packages/voorhof/flash)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/voorhof/flash/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/voorhof/flash/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/voorhof/flash.svg?style=flat-square)](https://packagist.org/packages/voorhof/flash)

A simple, elegant flash messaging package for Laravel applications,
using [Bootstrap alerts](https://getbootstrap.com/docs/5.3/components/alerts/) as the view.

## Installation

You can install the package via composer:

```bash
composer require voorhof/flash
```

The package will automatically register its service provider.  
You can publish the configuration file with: 

```bash
php artisan vendor:publish --provider="Voorhof\Flash\FlashServiceProvider" --tag="flash-config"
```

You can publish the views with:

```bash
php artisan vendor:publish --provider="Voorhof\Flash\FlashServiceProvider" --tag="flash-views"
```

## Usage

```
use Voorhof\Flash\Facades\Flash;

// Flash a success message
Flash::success('Item created successfully!');

// Flash a warning message
Flash::warning('Please review your input.');

// Flash a danger/error message
Flash::danger('An error occurred!');

// Flash an info message
Flash::info('Here is some information.');
```

In your Blade template, include the flash message component:

```
@include('flash::flash')
```

## Credits

- [David Carton](https://github.com/voorhof)
- [All Contributors](https://github.com/voorhof/cms/contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
