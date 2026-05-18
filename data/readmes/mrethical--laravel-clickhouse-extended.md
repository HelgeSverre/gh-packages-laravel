# Laravel Clickhouse Extended

[![Latest Version on Packagist](https://img.shields.io/packagist/v/mrethical/laravel-clickhouse-extended.svg?style=flat-square)](https://packagist.org/packages/mrethical/laravel-clickhouse-extended)
[![Total Downloads](https://img.shields.io/packagist/dt/mrethical/laravel-clickhouse-extended.svg?style=flat-square)](https://packagist.org/packages/mrethical/laravel-clickhouse-extended)

Extends [`cybercog/laravel-clickhouse`](https://github.com/cybercog/laravel-clickhouse) with the Laravel 12.x DB commands it doesn't ship.

Requires PHP 8.3+ and Laravel 12 or 13.

## Installation

```bash
composer require mrethical/laravel-clickhouse-extended
```

## Commands

- `clickhouse:migrate`
- `clickhouse:migrate-fresh`
- `clickhouse:wipe`
- `clickhouse:schema-dump`

## Testing

`Mrethical\LaravelClickhouseExtended\Testing\ClickhouseTruncation` — Clickhouse equivalent of Laravel's `DatabaseTruncation` trait, with parallel-testing support.

```php
use Mrethical\LaravelClickhouseExtended\Testing\ClickhouseTruncation;

uses(TestCase::class, ClickhouseTruncation::class)->in('Feature');
```

```bash
composer test
```

## License

MIT — see [LICENSE.md](LICENSE.md).
