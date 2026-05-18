# midnite81/core

[![Latest Stable Version](https://poser.pugx.org/midnite81/core/version)](https://packagist.org/packages/midnite81/core) [![Total Downloads](https://poser.pugx.org/midnite81/core/downloads)](https://packagist.org/packages/midnite81/core) [![Latest Unstable Version](https://poser.pugx.org/midnite81/core/v/unstable)](https://packagist.org/packages/midnite81/core) [![License](https://poser.pugx.org/midnite81/core/license.svg)](https://packagist.org/packages/midnite81/core)

This is a package for core activity within laravel projects. This is a work in progress and as such documentation is 
considered a work in progress and not necessarily as up-to-date as the author would like.

This package contains;

- [Base Action](docs/BaseAction.md)
- [Base Repository](docs/BaseRepository.md)
- [Artisan Commands](docs/Commands.md)
- [Attributes](docs/Attributes.md)
- Converters
    - [Time Conversion](docs/Converters/TimeConvertion.md)
- [Eloquent Helpers](docs/EloquentHelpers.md)
- [Entities, Requests and Responses](docs/Entities_Requests_Responses.md)
- [Exceptions](docs/Exceptions.md)
- [Helper Functions](docs/HelperFunctions.md)
  - [first](docs/HelperFunctions.md#first-value)
  - [uuid](docs/HelperFunctions.md#uuid)
- [Helper Classes](docs/HelperClasses.md)
  - [Arrays](docs/HelperClasses/Arrays.md)
  - [Attempts](docs/HelperClasses/Attempt.md)
  - [ClassRetriever](docs/HelperClasses.md)
  - [HtmlLinks](docs/HelperClasses/HtmlLinks.md)
  - [Matches](docs/HelperClasses/Matches.md)
  - [Strings](docs/HelperClasses.md)
  - [UserAgent](docs/HelperClasses/UserAgent.md)
- [Middleware](docs/Middleware.md)
  - [NoCache](docs/Middleware/NoCache.md)
  - [LogControllerAndMethod](docs/Middleware/LogControllerAndMethod.md)
- [Uuid Generator](docs/UuidGenerator.md)
- Traits
  - [Setters and Getters](docs/Traits/SettersAndGetters.md)
- Transformers
  - [FileLimiter](docs/Transformers/FileLimiter.md)
  - [HumanReadableNumber](docs/Transformers/HumanReadableNumber.md)
- Validation
  - [ValidationHandler](docs/Handlers/ValidationHandler.md)
  - [ValidationExceptionBuilder](docs/Validation/ValidationExceptionBuilder.md))

## Attribute Highlights

For full attribute usage and examples, see [Attributes](docs/Attributes.md).

- `#[TrimString]` trims a mapped string value for a single property before property handlers and type handlers run.
- `#[TrimStrings]` applies the same trimming behaviour to all mapped string properties on a class.

## Installation

This package requires PHP 8.1+ and has a Laravel Service Provider, which is auto-registered.

To install through composer include the package in your composer.json.
```composer
"midnite81/core": "^2.0"
```

Run composer install or composer update to download the dependencies, or you can run;

```bash
composer require midnite81/core
```

### Service Providers

By default, `Midnite81\Core\CoreServiceProvider` is automatically registered by laravel, unless you've actively turned
off auto registration in your application. Midnite81\Core ships with an additional service provider to enable the 
[Commands](docs/Commands.md) which come with this package. To install this (or both if needed), you need to add them 
to your `config/app.php`

```php
'providers' => [
//  ...
    \Midnite81\Core\CoreServiceProvider::class, // this is auto installed
    \Midnite81\Core\CoreCommandServiceProvider::class
//  ...
]
```

### Configuration files

You may wish to publish the configuration file if you're planning on using the 
[FireScriptCommand](docs/Commands/FireScriptsCommand.md) or 
[QuickFireScriptCommand](docs/Commands/QuickFireScriptsCommand.md)

```bash
php artisan vendor:publish --provider="Midnite81\Core\CoreServiceProvider"
```

### You're all set!

You're now all set to use midnite81/core. If you have any suggestions please me know or log any issues in the 
[issue section](https://github.com/midnite81/core/issues). 
