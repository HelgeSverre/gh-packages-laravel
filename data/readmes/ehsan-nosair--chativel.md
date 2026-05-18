# ChatiVel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ehsan-nosair/chativel.svg?style=flat-square)](https://packagist.org/packages/ehsan-nosair/chativel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ehsan-nosair/chativel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ehsan-nosair/chativel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/ehsan-nosair/chativel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/ehsan-nosair/chativel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ehsan-nosair/chativel.svg?style=flat-square)](https://packagist.org/packages/ehsan-nosair/chativel)

real-time chat system for laravel & filament. 

- support multi gurad
- support rtl
- languages (en, ar)
- using laravel broadcasting so you can use (reverb, pusher) 


> [!IMPORTANT]
> the package is still in development stage

## Installation

You can install the package via composer:

```bash
composer require ehsan-nosair/chativel
```

Run this command to install the package, it will publish config file and migrations 

```bash
php artisan chativel:install
```

### Following steps just if you want to add the chat page to filament panel

Run this command to copy assets to public folder

```bash
php artisan filament:assets
```

You need to use 'filament custom theme' [create custom theme](https://filamentphp.com/docs/3.x/panels/themes#creating-a-custom-theme).
Then add following line to your theme `tailwind.config.js` file.

```js
content: [
    ...
    './vendor/ehsan-nosair/chativel/resources/views/**/**/*.blade.php',
    ...
]
```

> this package use laravel broadcasting so you need to install it. use following command

```bash
php artisan install:broadcasting
```

then if you want to use it in a filament panel then you need to enable echo in `config/filament` like following for `reverb`
```php
// ...
 
'echo' => [
    'broadcaster' => 'reverb',
    'key' => env('VITE_REVERB_APP_KEY'),
    'cluster' => env('VITE_REVERB_APP_CLUSTER'),
    'wsHost' => env('VITE_REVERB_HOST'),
    'wsPort' => env('VITE_REVERB_PORT'),
    'wssPort' => env('VITE_REVERB_PORT'),
    'authEndpoint' => '/broadcasting/auth',
    'disableStats' => true,
    'encrypted' => true,
    'forceTLS' => false,
],
 
// ...
```

then start reverb server:
```bash
php artisan reverb:start
```

## Usage

First: you need to use `Chatable` trait in your models
```php
<?php

use EhsanNosair\Chativel\Traits\Chatable;

class User extends Authenticatable
{
    use Chatable;
}
```
> [!NOTE]
> you can customize model searchable columns & display column by overriting searchableColumns() & getDisplayColumnAttribute() methods

Second: you need to add your chatable models to chatables array in `config/chativel`
```php
    <?php
    // ...
    'chatables' => [
        \App\Models\User::class,
    ],
    // ...
```

Final step: use plusing in your filament panel provider
```php
<?php

use EhsanNosair\Chativel\ChativelPlugin;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            //...
            ->plugins([
                ChativelPlugin::make()
            ]);
    }
}

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

- [ehsan nosair](https://github.com/ehsan-nosair)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
