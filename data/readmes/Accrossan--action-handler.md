# Accrossan Action Handler

Laravel action handler package scaffold.

## Requirements

- PHP 8.3+
- Laravel 11 or 12

## Install

```bash
composer require accrossan/action-handler
```

## Configuration

The package registers `config/action-handler.php`. You can publish it in a Laravel app:

```bash
php artisan vendor:publish --tag=action-handler-config
```

## Development

Install dependencies:

```bash
composer install
```

Run tests:

```bash
composer test
```

## Package Structure

- `config/` package config files
- `src/` package source code
- `tests/` package tests (Orchestra Testbench)
