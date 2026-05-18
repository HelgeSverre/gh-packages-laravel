# Laravel Cap.js

A simple package to integrate Cap.js, an hCaptcha-like open source challenge, into your Laravel application.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ashraam/capjs.svg?style=flat-square)](https://packagist.org/packages/ashraam/laravel-capjs)
[![Total Downloads](https://img.shields.io/packagist/dt/ashraam/capjs.svg?style=flat-square)](https://packagist.org/packages/ashraam/laravel-capjs)

This package provides a simple way to integrate [Cap.js](https://capjs.js.org/) into your Laravel application.

## Installation

You can install the package via composer:

```bash
composer require ashraam/laravel-capjs
```

## Configuration

First, you need to publish the configuration file:

```bash
php artisan vendor:publish --provider="Ashraam\\Capjs\\CapjsServiceProvider" --tag="config"
```

This will create a `config/capjs.php` file in your application. You can then add your Cap.js credentials to your `.env` file:

```
CAPJS_HOST=
CAPJS_KEY=
CAPJS_SECRET=
```

## Usage

### Blade Directive

To include the Cap.js script, you can use the `@capjsScript` directive in your Blade template:

```blade
<!DOCTYPE html>
<html>
<head>
    ...
    @capjsScript
</head>
<body>
    ...
</body>
</html>
```

### Facade

You can also get the script tag from the `Capjs` facade:

```php
{!! Capjs::script() !!}
```

### Blade Component

To display the Cap.js widget, you can use the `<x-capjs-widget>` component:

```blade
<form method="POST" action="/register">
    @csrf
    ...
    <x-capjs-widget />
    @error('cap-token') {{ $message }} @enderror
    ...
    <button type="submit">Register</button>
</form>
```

The component also accepts an optional `id` and `locale` attribute:

```blade
<x-capjs-widget id="my-capjs-widget" locale="fr" />
```

#### Events

The component dispatches custom events such as `solve`, `error`, `reset`, and `progress`. You can attach an event listener to the widget to capture these events.

For instance, to get the token when the captcha is solved, you would use the following JavaScript code:

```javascript
const widget = document.querySelector("#my-capjs-widget");
widget.addEventListener("solve", function (e) {
  const token = e.detail.token; // Handle the token as needed
});
```

#### Styling

You can customize the appearance of the widget by overriding the default CSS variables.

```css
cap-widget {
  --cap-background: #fdfdfd;
  --cap-border-color: #dddddd8f;
  --cap-border-radius: 14px;
  --cap-widget-height: 30px;
  --cap-widget-width: 230px;
  --cap-widget-padding: 14px;
  --cap-gap: 15px;
  --cap-color: #212121;
  --cap-checkbox-size: 25px;
  --cap-checkbox-border: 1px solid #aaaaaad1;
  --cap-checkbox-border-radius: 6px;
  --cap-checkbox-background: #fafafa91;
  --cap-checkbox-margin: 2px;
  --cap-font: system, -apple-system, "BlinkMacSystemFont", ".SFNSText-Regular", "San Francisco", "Roboto", "Segoe UI", "Helvetica Neue", "Lucida Grande", "Ubuntu", "arial", sans-serif;
  --cap-spinner-color: #000;
  --cap-spinner-background-color: #eee;
  --cap-spinner-thickness: 5px;
  --cap-checkmark: url("data:image/svg+xml,...");
  --cap-error-cross: url("data:image/svg+xml,...");
  --cap-credits-font-size: 12px;
  --cap-opacity-hover: 0.8;
}
```

### Validation Rule

To validate the Cap.js token, you can use the `capjs` validation rule:

```php
use Illuminate\Http\Request;

public function register(Request $request)
{
    $request->validate([
        ...
        'cap-token' => ['required', 'capjs'],
        ...
    ]);

    ...
}
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

### Security

If you discover any security related issues, please email romain.bertolucci@gmail.com instead of using the issue tracker.

## Credits

-   [Romain BERTOLUCCI](https://github.com/ashraam)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
