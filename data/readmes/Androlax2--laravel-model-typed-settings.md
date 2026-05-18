# Laravel Model Typed Settings 

[![Latest Version on Packagist](https://img.shields.io/packagist/v/androlax2/laravel-model-typed-settings.svg?style=flat-square)](https://packagist.org/packages/androlax2/laravel-model-typed-settings)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/androlax2/laravel-model-typed-settings/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/androlax2/laravel-model-typed-settings/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/androlax2/laravel-model-typed-settings/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/androlax2/laravel-model-typed-settings/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/androlax2/laravel-model-typed-settings.svg?style=flat-square)](https://packagist.org/packages/androlax2/laravel-model-typed-settings)

Stop treating your model settings like messy associative arrays. This package allows you to cast JSON columns directly into Type-Safe DTOs with support for nested objects, enums, and automatic type coercion.

## Installation

You can install the package via composer:

```bash
composer require androlax2/laravel-model-typed-settings
```

## Usage

### Define your Settings Class

Create a class that extends `Androlax2\LaravelModelTypedSettings\Settings`. Use standard PHP properties with types and default values.

```php
<?php

namespace App\Settings;

use Androlax2\LaravelModelTypedSettings\Settings;
use Androlax2\LaravelModelTypedSettings\Attributes\AsCollection;

class UserPreferences extends Settings
{
    public string $theme = 'light';
    public int $items_per_page = 15;
    public bool $notifications_enabled = true;

    // Support for Backed Enums
    public UserStatus $status = UserStatus::Active;

    // Support for Collections of Enums
    #[AsCollection(NotificationChannel::class)]
    public array $channels = [NotificationChannel::Email];

    // Support for Nested Settings
    public SecuritySettings $security;
}
```

### Apply to Eloquent Model

Add the settings class to your model's `$casts` array.

```php
<?php

use App\Models\User;
use App\Settings\UserPreferences;

class User extends Model
{
    protected $casts = [
        'preferences' => UserPreferences::class,
    ];
}
```

Add to database the column for preferences : 

```php
<?php

Schema::create('users', function (Blueprint $table) {
    $table->settingColumn('preferences');
});
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

- [Androlax2](https://github.com/Androlax2)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
