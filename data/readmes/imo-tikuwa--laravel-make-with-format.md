# Automatic format listener after Laravel's make:●● command

[![Latest Version on Packagist](https://img.shields.io/packagist/v/imo-tikuwa/laravel-make-with-format.svg?style=flat-square)](https://packagist.org/packages/imo-tikuwa/laravel-make-with-format)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/imo-tikuwa/laravel-make-with-format/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/imo-tikuwa/laravel-make-with-format/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/imo-tikuwa/laravel-make-with-format/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/imo-tikuwa/laravel-make-with-format/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/imo-tikuwa/laravel-make-with-format.svg?style=flat-square)](https://packagist.org/packages/imo-tikuwa/laravel-make-with-format)

Provides a listener to prevent forgetting to run Laravel Pint and IDE Helper after executing the make:●● command.

## Installation

You can install the package via composer:

```bash
composer require --dev imo-tikuwa/laravel-make-with-format
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="make-with-format-config"
```

### Optional Dependencies

This package will use the following tools **if they are installed** in your project:

- [Laravel Pint](https://github.com/laravel/pint) (for code formatting)
- [IDE Helper Generator for Laravel](https://github.com/barryvdh/laravel-ide-helper) (for improved IDE support)

If you want to take advantage of these features, you can install them manually:

```bash
composer require --dev laravel/pint
composer require --dev barryvdh/laravel-ide-helper
```

For detailed installation and setup instructions, please refer to the documentation of each package:

- Laravel Pint: https://github.com/laravel/pint
- IDE Helper Generator: https://github.com/barryvdh/laravel-ide-helper

## Usage

After executing the make:●● command, Pint and laravel-ide-helper will work.

```bash
$ php artisan make:migration create_examples_table

   INFO  Migration [database/migrations/2025_02_23_072246_create_examples_table.php] created successfully.


Running pint on database/migrations

  ✓...

  ───────────────────────────────────────────────────────────────────── PSR 12
    FIXED   ..................................... 4 files, 1 style issue fixed
  ✓ database/migrations/2025_02_23_072246_create_examples_table.php new_with_…
```

```bash
$ php artisan make:model --test Example

   INFO  Test [tests/Feature/Models/ExampleTest.php] created successfully.

   INFO  Model [app/Models/Example.php] created successfully.


Running ide-helper:models on app/Models
Written new phpDocBlock to /app/Models/Example.php
Written new phpDocBlock to /app/Models/User.php

Running pint on app/Models

  ✓✓

  ───────────────────────────────────────────────────────────────────── PSR 12
    FIXED   .................................... 2 files, 2 style issues fixed
  ✓ app/Models/Example.php declare_strict_types, blank_line_after_opening_tag…
  ✓ app/Models/User.php                      no_trailing_whitespace_in_comment


Running pint on tests/Feature/Models

  ✓

  ───────────────────────────────────────────────────────────────────── PSR 12
    FIXED   ...................................... 1 file, 1 style issue fixed
  ✓ tests/Feature/Models/ExampleTest.php declare_strict_types, blank_line_aft…
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

- [imo-tikuwa](https://github.com/imo-tikuwa)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
