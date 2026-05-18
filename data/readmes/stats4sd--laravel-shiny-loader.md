# Laravel Shiny Loader

[![Latest Version on Packagist](https://img.shields.io/packagist/v/stats4sd/laravel-shiny-loader.svg?style=flat-square)](https://packagist.org/packages/stats4sd/laravel-shiny-loader)
[![Total Downloads](https://img.shields.io/packagist/dt/stats4sd/laravel-shiny-loader.svg?style=flat-square)](https://packagist.org/packages/stats4sd/laravel-shiny-loader)

A Laravel package that lets you embed Shiny apps into your Laravel application with iFrames.

...But surely that doesn't need a package? You're right - you can just use an iFrame and point it at your Shiny app (as long as the app is publicly accessible).

This package does more than that - it provides a way for Laravel to communicate with the Shiny app to:

-   pass initialisation data into the app
-   ensure that the current user is authenticated before loading the app.

## How does it work?

TODO: Update and bring over documentation from : https://github.com/stats4sd/shiny-laravel-auth-example

## Installation

You can install the package via composer:

```bash
composer require stats4sd/laravel-shiny-loader
```

Add the following properties to your .env file:

```dotenv
## Path to the directory where shiny apps are served from. For example, if you have shiny apps in /srv/shiny-server/app1 and /srv/shiny-server/app2, set this to /srv/shiny-server
SHINY_APP_PATH="/path/to/shiny/app/container"

## URL of the Shiny app. The Shiny app should be available at this URL, as it will be embedded into an iframe within one of your Laravel app pages
SHINY_APP_URL="http://url-of-shiny-app.com"

## A secret key that both the Laravel app and the Shiny app know. This is used to authenticate requests from Laravel to the Shiny app
## This can be literally any string; the only requirement is that it is also included in the Shiny app's configuration
SHINY_AUTH_KEY="change-me"

```

> [!NOTE]
> The shiny app needs to be available at the given url independantly of your Laravel app. This doesn't mean users can actually reach the app at this url; we recommend that you use some approach to prevent users just going directly to this url. The most secure approach is to develop your Shiny app to require POST data from the Laravel app before rendering sensitive content.

TODO: tidy up R Shiny side of this interaction and share documentation

## Use

To enable authentication, you need to set up a route in your Laravel app.

This package provides a Route Macro to make this easy. In your main `routes/web.php` (or where-ever you register your routes), add the following:

```php
use Illuminate\Support\Facades\Route;

Route::shiny()
```

If you want to add extra middleware to the route (for example, to ensure the user is authenticated, or has a specific role), you can do so by wrapping the `Route::shiny()` call in a middleware group. E.g:

```php
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:admin'])->group(function () {
    Route::shiny();
});
```

This will ensure that, even if the user could somehow get to the page that renders the Shiny app, the app will not receive the POST request to confirm the user is authenticated unless your middleware is passed.

The main way to use the package is by adding the ShinyIframe component to your page. It requires a `$shinyAppUrl` - the url of the Shiny app you want to embed. You may optionally add `$postData` - an array of data to pass to the Shiny app when it loads.

```bladehtml
    <x-shiny-loader:shiny-iframe
        :shiny-app-url="$shinyAppUrl"
        :post-data="['foo' => 'bar']"
        />
```

You can use the `$postData` to pass any data you want from Laravel to the Shiny app. For example:

-   The current user's ID or email address;
-   The ID of a resource the user is viewing in Laravel, so the Shiny app can load data related to that resource;
-   Any other arbitrary data you want to pass to the Shiny app.

TODO: add refs to documentation on how to setup the Shiny app to receive the postData.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Dave Mills](https://github.com/dave-mills)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
