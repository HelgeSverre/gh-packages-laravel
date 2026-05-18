# Laravel Password Expiry

<br>
<p align="center"><img src="./repo/banner.png" /></p>
<br>
    
<p align="center">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/beliven-it/laravel-password-expiry.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-password-expiry)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-password-expiry/run-tests.yml?branch=main&label=tests&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-password-expiry/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-password-expiry/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-password-expiry/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/beliven-it/laravel-password-expiry.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-password-expiry)

</p>

A simple and customizable package that adds password expiration functionality to your Laravel applications, enhancing user security with regular password rotation

## Installation

You can install the package via composer:

```bash
composer require beliven-it/laravel-password-expiry
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="password-expiry-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="password-expiry-config"
```

This is the contents of the published config file:

```php
<?php
// config for Beliven/PasswordExpiry
return [
    'days_to_notify_expiration' => (int) env('DAYS_TO_NOTIFY_EXPIRATION', 7),
    'days_to_expire'            => (int) env('DAYS_TO_EXPIRE', 90),
];
```

The `days_to_expire` key is the number of days after which the password will expire.

The `days_to_notify_expiration` key is the number of days before the password expires that the user will be notified.

> **NOTE:** 
> The package not provide any notification. 
> You can create your own notification and use the `Beliven\PasswordExpiry\Events\PasswordExpired` and `Beliven\PasswordExpiry\Events\PasswordExpiring` events.

## Usage

### Trait

The library allow to apply a trait in your own models.

Let's try to use in the `User` model:

```php
<?php

namespace App\Models;

use Beliven\PasswordExpiry\Traits\HasPasswordExpiration;

class User extends Authenticatable
{
    use HasPasswordExpiration;
    // ... other code
}
```

Now, when you create / update a user password, a new record will be created in the `model_password_changes` table.

```php
<?php

$user->password = $password_from_request;
$user->save();

// This action create a new record in the model_password_changes table
```

You can also obtain the password expiration date using the `password_expires_at` attribute.

```php
<?php

$user->password_expires_at;

```

The trait also provides a method to attempt to clear the password if expired.

```php
<?php

$user->tryClearPassword();

```

If the user doesn't have a password expired nothing will happen.

### Commands

The package provides a command to check for expiring and expired passwords.

```bash

php artisan password-expiry:check

```

This command is useful to be scheduled to run daily.

```php
<?php

$schedule->command('password-expiry:check')->daily();

```

### Events

The package provides the following events:

- `Beliven\PasswordExpiry\Events\PasswordExpired`: This event is fired when a password is expired.
- `Beliven\PasswordExpiry\Events\PasswordExpiring`: This event is fired when a password is expiring.

These events will be triggered when the `password-expiry:check` command is executed or via the facade:

```php
<?php

use Beliven\PasswordExpiry\Facades\PasswordExpiry;

PasswordExpiry::checkPasswords();
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/beliven-it/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](https://github.com/beliven-it/.github/blob/main/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Fabrizio Gortani](https://github.com/beliven-it)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
