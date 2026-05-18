# Laravel package fixing SQLite Schema grammar

[![Latest Version on Packagist](https://img.shields.io/packagist/v/Max13/laravel-sqfix.svg?style=flat-square)](https://packagist.org/packages/Max13/laravel-sqfix)
[![GitHub Tests Action Status](https://img.shields.io/github/workflow/status/Max13/laravel-sqfix/run-tests?label=tests)](https://github.com/Max13/laravel-sqfix/actions?query=workflow%3ATests+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/Max13/laravel-sqfix.svg?style=flat-square)](https://packagist.org/packages/Max13/laravel-sqfix)

[`SQLite`](https://sqlite.org/) has many quirks, some of them are bugs and stayed like this because of legacy code, bugs that became features, etc… See the complete list on their website:

- [`ROWID`](https://sqlite.org/lang_createtable.html#rowid)s: Every table (except explicitely created `WITHOUT ROWID`) have a 64-bit signed integer column named `rowid`. This column has the same attributes expected for a `PRIMARY KEY` (starts at `1`, is an `INTEGER`, is `UNIQUE` across the table, and is usually incremented by `1` on every insert), and can reuse (in certain condition) previously deleted `rowid`s. Only the exact type (case insensitive) `INTEGER PRIMARY KEY` will make a column an alias of `rowid`. Which is recommended in most cases.
- [`AUTOINCREMENT`](https://sqlite.org/autoinc.html): When this keyword is used, it will use a different algorithm for `rowid`, briefly, an `AUTOINCREMENT` will make `SQLite` create an table used to track the increments (`sqlite_sequence`), `rowid`s are guaranteed to be increasing and never reused. _The AUTOINCREMENT keyword imposes extra CPU, memory, disk space, and disk I/O overhead and should be avoided if not strictly needed. It is usually not needed._

This package replaces the default optimized behavior advised by `SQLite` and will have no effect on other drivers. `Laravel`’s ids are automatically created as aliases of `rowid`, and the `->trueSyntax()` modifier will use the "unfixed" SQL grammar.

## Installation

You can install the package via composer:

```bash
composer require max13/laravel-sqfix
```

That’s it!

## Compatibility list

| Laravel         | Package version |
|-----------------|-----------------|
| 7, 8, 9, 10, 11 | `^v1.3.2`       |
| 12, 13          | `^v1.4`         |


## Usage

```php
Schema::create('jobs', function (Blueprint $table) {
    $table->bigIncrements('id');
    // …
});
```

The normal behavior of `Laravel` is to define the table `jobs` with the following statement:

```sql
create table "jobs" ("id" integer not null primary key autoincrement)
```

Which will both create a column named `id` distinct from `rowid` with the same properties. Double the work.

This package is making `Laravel` produce the following table:

```sql
create table "jobs" ("id" integer primary key)
```

Optimisation max.

## Testing

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Credits

- [Adnan RIHAN](https://github.com/Max13)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
