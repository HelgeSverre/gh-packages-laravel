# Monitor the health of a Laravel application develop by iVirtual.

A Laravel package to check that the local and production environment variables are correctly working for all Laravel developments by iVirtual.

## Installation

Install the package via composer:

Add the following to your composer.json file.

```bash
composer config repositories.ivirtual '{"type": "vcs", "url": "https://github.com/ivirtual-agency/laravel-development"}' --file composer.json
```

```bash
composer require ivirtual/laravel-development
```

Run the installation command:

```bash
php artisan ivirtual:install
```

## Usage

Add the default schedule in the `routes/console.php` file.
```php
    use Illuminate\Support\Facades\Schedule;
    use iVirtual\LaravelDevelopment\Facades\LaravelDevelopment;

    Schedule::command('ivirtual:generate-sitemap')->daily();
    LaravelDevelopment::schedule();
```

Replace the laravel nova service provider with the following.
```php

use Laravel\Nova\Nova;
use iVirtual\LaravelDevelopment\NovaServiceProvider as BaseServiceProvider;

class NovaServiceProvider extends BaseServiceProvider
{
    ...
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Francisco Kraefft](https://github.com/fkraefft)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
