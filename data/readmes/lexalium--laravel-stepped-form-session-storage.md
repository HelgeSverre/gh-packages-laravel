# Laravel Stepped Form Session Storage

[![PHPUnit, PHPCS, PHPStan Tests](https://github.com/lexalium/laravel-stepped-form-session-storage/actions/workflows/laravel-tests.yml/badge.svg)](https://github.com/lexalium/laravel-stepped-form-session-storage/actions/workflows/laravel-tests.yml)

The package uses session as data and key storage for [Laravel Stepped Form](https://github.com/lexalium/laravel-stepped-form).

## Requirements

**PHP:** >=8.2

**Laravel:** ^11.0 || ^12.0

## Installation

Via Composer

```
composer require lexal/laravel-stepped-form-session-storage
```

## Usage

Configure stepped forms to use session as storage:

```php
/// config/stepped-form.php

return [
    ...
    'forms' => [
        'customer' => [
            ...
            'storage' => \Lexal\LaravelSteppedFormSessionStorage\SessionStorage::class,
            'session_key_storage' => \Lexal\LaravelSteppedFormSessionStorage\SessionSessionKeyStorage::class,
        ],
    ],
    ...
];
```

Read more about [Laravel Stepped Form](https://github.com/lexalium/laravel-stepped-form#usage).

## License

Laravel Session Storage is licensed under the MIT License. See [LICENSE](LICENSE) for the full license text.
