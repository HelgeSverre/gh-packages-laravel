# Laravel make:action Command

This Laravel package provides a `php artisan make:action` command to quickly scaffold "Action" classes. This encourages organized and reusable business logic.

## Compatibility

This package is tested and compatible with:

| Laravel | PHP | Filament |
|---------|-----|----------|
| 13.x | 8.4 | 5.x |
| 12.x | 8.3, 8.4 | 5.x |
| 11.x | 8.3, 8.4 | 4.x, 5.x |
| 10.x | 8.3, 8.4 | 4.x |

The package works seamlessly alongside Filament projects without any conflicts.

## Installation

You can install the package via composer:

```bash
composer require webteractive/make-action
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="make-action-config"
```

This is the contents of the published config file:

```php
// config for Webteractive/MakeAction
return [
    'method_name' => 'handle',
];
```

## Usage

To create a new action class, run the `make:action` Artisan command:

```bash
php artisan make:action CreateNewUser
```

This will create a new action class at `app/Actions/CreateNewUser.php`:

```php
<?php

namespace App\Actions;

class CreateNewUser
{
    public function handle()
    {
        // TODO: Implement the action logic.
    }
}
```

You can customize the default method name (`handle`) by changing the `method_name` value in the `config/make-action.php` file:

```php
// config for Webteractive/MakeAction
return [
    'method_name' => 'execute',
];
```

## Laravel Boost Support

This package includes AI guidelines for [Laravel Boost](https://github.com/laravel/boost), providing AI agents with context on how to properly use the `make:action` command.

### Enabling Boost Guidelines

To include this package's guidelines in your AI context:

1. Add to your `boost.json`:
   ```json
   {
       "guidelines": [
           "webteractive/make-action"
       ]
   }
   ```

2. Update Boost:
   ```bash
   php artisan boost:update
   ```

Once enabled, AI coding assistants will:

- Generate correct `make:action` commands
- Create action classes following Laravel conventions
- Provide appropriate examples when working with the action pattern

The guidelines are automatically discovered from `resources/boost/guidelines/core.blade.php` when you opt-in.

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

- [Glen Bangkila](https://github.com/)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
