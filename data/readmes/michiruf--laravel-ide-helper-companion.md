# Laravel IDE Helper Companion

[![Run Tests](https://github.com/michiruf/laravel-ide-helper-companion/actions/workflows/run-tests.yml/badge.svg)](https://github.com/michiruf/laravel-ide-helper-companion/actions/workflows/run-tests.yml)

This is a zero configuration package around [barryvdh / laravel-ide-helper](https://github.com/barryvdh/laravel-ide-helper).
Which aims to integrate easily with PHPStorm.

## Installation

```shell
composer require --dev michiruf/laravel-ide-helper-companion
```
   
## Usage

Commands:
```shell
php artisan ide-helper-companion {--throttle=0}
php artisan ide-helper-companion:annotate {--D|dir=} {--throttle=0} {--pint}
php artisan ide-helper-companion:generate {--throttle=0}
```

Command for a file watcher:
```shell
php artisan ide-helper-companion --throttle=10
```
will execute the command only every 10 seconds, and also will retry the current execution after 10 seconds.
Append `--pint` automatically run pint after annotation and so to ensure pint is not permanently conflicting with the
generated code.

### Example file watcher for WSL and laravel sail

![Example file watcher](doc/file-watcher.png)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
