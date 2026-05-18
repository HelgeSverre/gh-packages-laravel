# laravel bug reporting tool

[![Latest Version on Packagist](https://img.shields.io/packagist/v/appslanka/laravel-bug-fix.svg?style=flat-square)](https://packagist.org/packages/appslanka/laravel-bug-fix)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/appslanka/laravel-bug-fix/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/appslanka/laravel-bug-fix/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/appslanka/laravel-bug-fix/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/appslanka/laravel-bug-fix/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/appslanka/laravel-bug-fix.svg?style=flat-square)](https://packagist.org/packages/appslanka/laravel-bug-fix)

This is where your description should go. Limit it to a paragraph or two. Consider adding a small example.

## Support us 
<!-- 
[<img src="https://github-ads.s3.eu-central-1.amazonaws.com/laravel-bug-fix.jpg?t=1" width="419px" />](https://spatie.be/github-ad-click/laravel-bug-fix)

We invest a lot of resources into creating [best in class open source packages](https://spatie.be/open-source). You can support us by [buying one of our paid products](https://spatie.be/open-source/support-us).

We highly appreciate you sending us a postcard from your hometown, mentioning which of our package(s) you are using. You'll find our address on [our contact page](https://spatie.be/about-us). We publish all received postcards on [our virtual postcard wall](https://spatie.be/open-source/postcards). -->

## Installation

You can install the package via composer:

```bash
composer require appslanka/laravel-bug-fix
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="bug-fix-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="bug-fix-config"
```

This is the contents of the published config file:

```php
<?php

/**
 * Configuration for Appslanka/LaravelBugFix package
 */
return [
    /**
     * API endpoint URL where error reports will be sent.
     * Defaults to 'https://laravelbugfix.com/api/reports' if not provided in environment.
     */
    'api_url' => env('LBF_API_URL', 'https://laravelbugfix.com/api/reports'),

    /**
     * API key used for authentication when sending error reports.
     * Defaults to 'your-api-key' if not provided in environment.
     */
    'api_key' => env('LBF_API_KEY', 'your-api-key'),

    /**
     * Flag indicating whether to include detailed request information in error reports.
     * Set to true to include request details; false to exclude.
     */
    'include_request_details' => true,

    /**
     * Flag indicating whether to include cookies details in error reports.
     * Set to true to include server details; false to exclude.
     */
    'include_cookies' => false,

     /**
     * Flag indicating whether to include sessions details in error reports.
     * Set to true to include server details; false to exclude.
     */
    'include_sessions' => false,

    /**
     * Field name used to identify the authenticated user in error reports.
     * Default identifier field is 'id'. Customize as per application's user identifier field.
     */
    'exception_user_identifier_field' => 'id',

    /**
     * List of fields that should be masked (replaced with asterisks) in error reports.
     * Protects sensitive information such as passwords, credit card numbers, etc.
     */
    'masked_fields' => [
        'password',
        'credit_card_number',
        'social_security_number',
        'email',
        'phone_number',
        'date',
        'api_key',
        'token',
        'authorization',
        'auth',
        'verification',
        'credit_card',
        'cardToken',
        'cvv',
        'iban',
        'name',
        'email',
    ],
];
```



## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Appslanka](https://github.com/appslanka)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
