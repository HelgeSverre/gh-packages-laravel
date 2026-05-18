# Laravel DB URL Replacer

[![Tests](https://github.com/RenderbitTechnologies/laravel-db-url-replacer/actions/workflows/run-tests.yml/badge.svg)](https://github.com/RenderbitTechnologies/laravel-db-url-replacer/actions/workflows/run-tests.yml)
[![Latest Version on Packagist](https://img.shields.io/packagist/v/renderbit/laravel-db-url-replacer.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-db-url-replacer)
[![PHP Version](https://img.shields.io/packagist/php-v/renderbit/laravel-db-url-replacer.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-db-url-replacer)
[![License](https://img.shields.io/packagist/l/renderbit/laravel-db-url-replacer.svg?style=flat-square)](https://packagist.org/packages/renderbit/laravel-db-url-replacer)

A Laravel Artisan command to search and replace URLs across your database tables. Supports:

- Targeting all `TEXT` columns in all tables by default
- Limiting to specific tables or columns using options
- Validates URLs, table and column existence
- Dry run mode to preview changes
- Summary output with affected rows per table

## Installation

```bash
composer require --dev renderbit/laravel-db-url-replacer
```

## Usage

```bash
php artisan db:replace-url "http://old.url" "https://new.url"
```

### Options:
- `--tables=table1,table2`	Limit to specific tables
- `--columns=col1,col2`	Limit to specific columns
- `--dry-run`			Only show potential changes

## Running Tests

To run the test suite locally:

```bash
composer install
vendor/bin/phpunit
```

Tests are also automatically run via GitHub Actions on push and pull requests.

## License
MIT
