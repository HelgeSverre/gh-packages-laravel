# Separate session for each browser tab.

With this package, you can have a separate session for each browser tab. This is e.g. useful if you want to have a different tenant for each tab. This package utilizes a query parameter to identify the tab and stores all data in an array within the default session.

## Installation

You can install the package via composer:

```bash
composer require mintellity/laravel-tabbed-session
```

Add the middleware to your `app/Http/Kernel.php` file. Beware that the middleware must be added after the `StartSession` middleware and must be added before all other middlewares that should use the tabbed session:

```php
protected $middleware = [
    // ...
    \Mintellity\LaravelTabbedSession\Http\Middleware\TabbedSessionMiddleware::class,
];
```

Add the JS script to e.g. your `resources/js/app.js` file:

```js
require('../../vendor/mintellity/laravel-tabbed-session/resources/js/tabbedSession');
```

The default query parameter name is `tabId`. You can change this by editing your environment file and adding the following line. Take care that the parameter name is unique and does not conflict with other parameters in your routes. If you change the parameter name, you also have to change the name in the JS script:

```env
BROWSER_TAB_URL_PARAMETER_NAME=browserTabId
```

```js
require('../../vendor/mintellity/laravel-tabbed-session/resources/js/tabbedSession')('browserTabId');
```

## Usage

To access the tabbed session, you can use the `browsserTab()->session()` helper function:

```php
browserTab()->session()->put('foo', 'bar');
browserTab()->session()->get('foo'); // bar
```

## Disable for some paths

You can disable the TabbedSession entirely for specific paths.
Include the paths in `$exclude` in the config. Regex-patterns matching against the path are also possible:

```php
return [
    'exclude' => [
        'admin/*', // Will disable middleware for all paths matching this pattern, e.g. admin/user/create
    ]
]
```

Beware: The helper function `browserTab()` will throw an exception if used on a disabled path.

## Frontend "Session"

This is an optional feature that lets you store some data per tab in a cookie. The cookie can also be accessed from the frontend.

> :warning: **This is not a secure way to store data!** The data is not encrypted and can be manipulated by the user. Use this feature only for data that is not security relevant.

### Installation

Add the cookie to the list of unencrypted cookies in `App\Http\Middleware\EncryptCookies`:

```php
$this->disableFor(config('tabbed-session.frontend-cookie-name'));
```

The cookie name can be changed by editing your environment file and adding the following line:

```env
FRONTEND_TAB_SESSION_COOKIE_NAME=frontend_tab_session
```

And add the script to your `resources/js/app.js` file:

```js
require('../../vendor/mintellity/laravel-tabbed-session/resources/js/frontendTabSession')('frontend_tab_session');
```

### Usage

In the frontend with JS:

```js
window.tabSessionStorage.set('foo', 'bar');
window.tabSessionStorage.get('foo'); // bar
```

From the backend:

```php
browserTab()->frontendSession()->set('foo', 'bar');
browserTab()->frontendSession()->get('foo'); // bar
```

[See an example for implementing storing and setting the active Bootstrap nav/tab](./examples/Active%20Bootstrap%20Tab.md)

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Mintellity GmbH](https://github.com/mintellity)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
