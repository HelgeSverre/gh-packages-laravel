# Laravel Backup Database

[![Latest Release](https://img.shields.io/packagist/v/eXolnet/laravel-backup-database.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-backup-database)
[![Total Downloads](https://img.shields.io/packagist/dt/eXolnet/laravel-backup-database.svg?style=flat-square)](https://packagist.org/packages/eXolnet/laravel-backup-database)
[![Build Status](https://img.shields.io/github/actions/workflow/status/eXolnet/laravel-backup-database/tests.yml?label=tests&style=flat-square)](https://github.com/eXolnet/laravel-backup-database/actions?query=workflow%3Atests)
[![Software License](https://img.shields.io/badge/license-MIT-8469ad.svg?style=flat-square)](LICENSE)

Expend laravel-backup by adding a simple command to backup a database. No configuration required!

## Installation

Require this package with composer:

```bash
composer require exolnet/laravel-backup-database
```

If you don't use package auto-discovery, add the service provider to the ``providers`` array in `config/app.php`:

```php
Exolnet\Backup\BackupServiceProvider::class
```

## Usage

```
Usage:
  backup:database [options] [--] [<filename>]

Arguments:
  filename                       Custom filename to use instead of the generated one

Options:
      --connection[=CONNECTION]  Connection to use instead of the default one
      --path[=PATH]              Path where to dump the database instead of the current directory
  -h, --help                     Display this help message
  -q, --quiet                    Do not output any message
  -V, --version                  Display this application version
      --ansi                     Force ANSI output
      --no-ansi                  Disable ANSI output
  -n, --no-interaction           Do not ask any interactive question
      --env[=ENV]                The environment the command should run under
  -v|vv|vvv, --verbose           Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Help:
  Backup (dump) the database.
```

## Examples

To dump the default database, run:

```bash
php artisan backup:database
```

To dump the default database with a custom filename, run:

```bash
php artisan backup:database my_filename.sql.gz
```

To dump the default database to a custom path, run:

```bash
php artisan backup:database --path=/path/to/the/backup/directory
```

To dump an other database, run:

```bash
php artisan backup:database --connection=sqlite
```

## Testing

To run the phpUnit tests, please use:

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE_OF_CONDUCT.md) for details.

## Security

If you discover any security related issues, please email security@exolnet.com instead of using the issue tracker.

## Credits

- [Patricia Gagnon-Renaud](https://github.com/pgrenaud)
- [Alexandre D'Eschambeault](https://github.com/xel1045)
- [Simon Gaudreau](https://github.com/Gandhi11)
- [All Contributors](../../contributors)

## License

Copyright © [eXolnet](https://www.exolnet.com). All rights reserved.

This code is licensed under the [MIT license](http://choosealicense.com/licenses/mit/).
Please see the [license file](LICENSE) for more information.
