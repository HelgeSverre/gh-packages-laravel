# Laravel Xentral Orders Parser

## Requirements

- Laravel 11 or higher
- PHP 8.2 or higher
- ext-simplexml enabled

## Setup

This package is available on [Packagist](https://packagist.org/packages/drei-d/laravel-xentral-orders-parser) via [Composer](https://getcomposer.org) and can be installed with the following command:

```shell
composer require drei-d/laravel-xentral-orders-parser
```

## Usage

Once installed, you can parse a file using the `OrderParserService`:

```php
$orderDto = app(\DREID\LaravelXentralOrdersParser\Services\OrderParserService::class)->parseFromDisk(
    '<disk>',
    '<filepath>'
);
```

You can also just parse the xml content without reading it from a file beforehand:

```php
$orderDto = app(\DREID\LaravelXentralOrdersParser\Services\OrderParserService::class)->parse('<xml>');
```

That's already it. You're good to go.
<br>Enjoy!
