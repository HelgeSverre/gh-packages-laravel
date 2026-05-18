# Laravel Simple OTP

[![Latest Version on Packagist](https://img.shields.io/packagist/v/adevesa/laravel-simple-otp.svg?style=flat-square)](https://packagist.org/packages/adevesa/laravel-simple-otp)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/adevesa/laravel-simple-otp/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/adevesa/laravel-simple-otp/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/adevesa/laravel-simple-otp/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/adevesa/laravel-simple-otp/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/adevesa/laravel-simple-otp.svg?style=flat-square)](https://packagist.org/packages/adevesa/laravel-simple-otp)

This package is a simple OTP generator for Laravel. You can use it to generate OTPs and validate them.

## Installation

You can install the package via composer:

```bash
composer require adevesa/laravel-simple-otp
```

You can publish and run the migrations and publish the config file with:

```bash
php artisan vendor:publish --provider="adevesa\SimpleOTP\SimpleOTPServiceProvider"
php artisan migrate
```

This is the contents of the published config file:

```php
return [
    'otp_length' => env('SIMPLE_OTP_LENGTH', 6),
    'otp_format' => env('SIMPLE_OTP_FORMAT', 'alpha_numeric'),
    'otp_expiration_minutes' => env('SIMPLE_OTP_EXPIRATION_MINUTES', 5),
    'otp_max_attempts' => env('SIMPLE_OTP_MAX_ATTEMPTS', 3),
    'otp_throw_exceptions' => env('SIMPLE_OTP_THROW_EXCEPTIONS', true),
];
```

With the `otp_throw_exceptions` option you can control if the package should throw exceptions or return `false` when an OTP is not valid.

## Usage

```php
$simpleOTP = new adevesa\SimpleOTP();
$code = $simpleOTP->create('a_email@example.com');
$simpleOTP->verify('a_email@example.com', "ASD123");
```

Or also

```php
$code = \adevesa\SimpleOTP\Facades\SimpleOTP::create('+5491123456789')->code;
$isValid = \adevesa\SimpleOTP\Facades\SimpleOTP::verify('+5491123456789', $code);
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

If you discover any security-related issues, please email adevesa95@outlook.com instead of using the issue tracker.

## Credits

- [Devesa Agustín](https://github.com/adevesa)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
