<div align="center">
  <img src="./logo/logo.svg" width="355px" alt="Laravel Localized Routes">
  <p>Laravel Package for managing localized routes in Laravel applications.</p>
</div>

## 📖 Requirements
* Laravel 7.0 or higher
* [Composer](https://getcomposer.org) is required for installation

## 📦 Installing
Install the library using Composer:

```shell
$ composer require richarddobron/laravel-localized-routes
```

## ⚡️ Quick Start

### 1. Publish the configuration

```shell
$ php artisan vendor:publish --provider="richarddobron\LocalizedRoutes\LocalizedRouteServiceProvider" --tag="config"
```

This will create `config/localized-routes.php`.

### 2. Configure supported locales

```php
<?php

return [
    'prefix' => true,
    'locales' => [
        'de',
        'it',
        // ...
    ],
    'route_key' => 'locale',
    'route_locale' => 'en',
    'redirect_code' => 302,
];
```

### 3. Add routes. Example below shows how translations work.

### Routes that get translated

Create a translation file like `routes/lang/de/routes.php`:

```php
<?php

return [
    'example' => 'beispiel',
];
```

Then in `routes/web.php`:

```php
Route::localeGroup([], function () {
    Route::get('/example', function () {
        return 'Hello, World!';
    });
});
```

This makes these URLs:
- `/example` (default)
- `/de/beispiel`
- `/it/example`

### Routes with parameters

You can give different paths per language:

```php
Route::get('/book/{sku}', function (string $sku) {
    return 'Book details ' . $sku;
})->name('book')->locale([
    'de' => 'buch/{sku}',
    'it',
]);
```

This makes these URLs:
- `/book/{sku}` (default)
- `/de/buch/{sku}`
- `/it/book/{sku}`

## ⚙️ Configuration Options

You can customize the library with the following configuration options.

| Option          | Description                                                           | Default  |
|-----------------|-----------------------------------------------------------------------|----------|
| `prefix`        | Automatically prepends locale codes (`/de`, `/it`, etc.) to routes.   | `true`   |
| `locales`       | List of supported locales.                                            | `[]`     |
| `route_key`     | The route parameter key used for locale identification.               | `locale` |
| `route_locale`  | Locale used for default routes.                                       | `en`     |
| `redirect_code` | HTTP status code used for redirecting to the correct localized route. | `302`    |

## 🧪 Testing

```shell
$ composer tests
```

## 🤝 Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
