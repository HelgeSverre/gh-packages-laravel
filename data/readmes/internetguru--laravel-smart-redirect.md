# Laravel Smart Redirect

A configurable Laravel 11 middleware package that handles URL redirection based on defined routes and uses Levenshtein distance to find the closest matching route for 404 errors.

## Features

- Redirect URLs based on predefined rules
- Automatically find the closest matching route using Levenshtein distance
- Easily configurable parameters for route combinations

## Installation

1. Require the package via Composer:

    ```bash
    composer require internetguru/laravel-smart-redirect
    ```

2. Publish the configuration file:

    ```bash
    php artisan vendor:publish --provider="Internetguru\\SmartRedirect\\SmartRedirectServiceProvider" --tag="config"
    ```

3. Register the service provider (if not auto-discovered) in `config/app.php`:

    ```php
    'providers' => [
        // Other Service Providers
        Internetguru\SmartRedirect\SmartRedirectServiceProvider::class,
    ],
    ```

## Configuration

After publishing the configuration file, you can configure your redirects and parameters in `config/smart-redirect.php`.

```php
return [
    'redirects' => [
        // '/old-path' => '/new-path',
    ],
    'params' => [
        // 'locale' => ['en', 'cs'],
        // 'location' => ['racineves', 'kralupy'],
    ],
];
```

## Usage

To always use the middleware, add it to `app/Http/Kernel.php`:

```php
protected $middlewareGroups = [
    'web' => [
        // Other Middleware
        \Internetguru\SmartRedirect\Middleware\Redirect::class,
    ],
];
```

You can also use the middleware only for some of the routes. Register the middleware in `app/Http/Kernel.php`:

```php
protected $routeMiddleware = [
    'smart-redirect' => \Internetguru\SmartRedirect\Middleware\Redirect::class,
];
```
And then use it in your routes, e.g. in `routes/web.php`:

```php
Route::get('/old-path', function () {
    return 'This is the old path.';
})->middleware('smart-redirect');
```

## Example

Let's say you have a website with the following routes:

- `/`
- `/about`
- `/contact`
- `/services`
- `/services/web-development`
- `/services/mobile-development`
- `/services/seo`

And you want to redirect the following URLs:

- `/web-dev` to `/services/web-development`
- `/mobile-dev` to `/services/mobile-development`
- `/seo` to `/services/seo`

You can define the redirects in `config/smart-redirect.php`:

```php
'redirects' => [
    '/web-dev' => '/services/web-development',
    '/mobile-dev' => '/services/mobile-development',
    '/seo' => '/services/seo',
],
```

Now, when you visit `/web-dev`, you will be redirected to `/services/web-development`.

If you visit a non-existing URL, e.g. `/web`, the middleware will automatically find the closest matching route and redirect you to the correct one.

## License & Commercial Terms

### License

Copyright © 2026 **Internet Guru**

This software is licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](http://creativecommons.org/licenses/by-nc-sa/4.0/) license.

> **Disclaimer:** This software is provided "as is", without warranty of any kind, express or implied. In no event shall the authors or copyright holders be liable for any claim, damages or other liability.

### Commercial Use

The standard CC BY-NC-SA license prohibits commercial use. If you wish to use this software in a commercial environment or product, we offer **flexible commercial licenses** tailored to:

* Your company size.
* The nature of your project.
* Your specific integration needs.

**Note:** In many instances (especially for startups or small-scale tools), this may result in no fees being charged at all. Please contact us to obtain written permission or a commercial agreement.

**Contact for Licensing:** [info@internetguru.io](mailto:info@internetguru.io)

### Professional Services

Are you looking to get the most out of this project? We are available for:

* **Custom Development:** Tailoring the software to your specific requirements.
* **Integration & Support:** Helping your team implement and maintain the solution.
* **Training & Workshops:** Seminars and hands-on workshops for your developers.

Reach out to us at [info@internetguru.io](mailto:info@internetguru.io) — we are more than happy to assist you!
