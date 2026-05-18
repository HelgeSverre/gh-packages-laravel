# Lingua

[![Tests](https://github.com/tooinfinity/lingua/actions/workflows/tests.yml/badge.svg)](https://github.com/tooinfinity/lingua/actions/workflows/tests.yml)
[![Formats](https://github.com/tooinfinity/lingua/actions/workflows/formats.yml/badge.svg)](https://github.com/tooinfinity/lingua/actions/workflows/formats.yml)
[![PHP Version](https://img.shields.io/packagist/php-v/tooinfinity/lingua)](https://packagist.org/packages/tooinfinity/lingua)
[![Laravel Version](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-red.svg)](https://laravel.com)
[![Latest Stable Version](https://img.shields.io/packagist/v/tooinfinity/lingua)](https://packagist.org/packages/tooinfinity/lingua)
[![License](https://img.shields.io/packagist/l/tooinfinity/lingua)](LICENSE.md)

> ⚠️ **Under Development**: This package is currently under active development and is not ready for production use.

Share Laravel translations with your Inertia.js + React frontend.

## Quick Start

### 1. Install

```bash
composer require tooinfinity/lingua
php artisan lingua:install
```

This installs the Laravel package, publishes the config, and installs the React package (`@tooinfinity/lingua-react`).

### 2. Configure Locales

Edit `config/lingua.php`:

```php
'locales' => ['en', 'fr', 'es'],
```

### 3. Middleware

**The middleware is auto-registered to the `web` group by default.** No action needed for most apps.

To disable auto-registration and add manually:

```php
// config/lingua.php
'middleware' => [
    'auto_register' => false,
],

// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \TooInfinity\Lingua\Http\Middleware\LinguaMiddleware::class,
    ]);
})
```

### 4. Create Translations

```
lang/
├── en/
│   └── messages.php
└── fr/
    └── messages.php
```

```php
// lang/en/messages.php
return [
    'welcome' => 'Welcome!',
    'greeting' => 'Hello, :name!',
];

// lang/fr/messages.php
return [
    'welcome' => 'Bienvenue!',
    'greeting' => 'Bonjour, :name!',
];
```

### 5. Use in React

```tsx
import { useTranslations } from '@tooinfinity/lingua-react';

function Welcome() {
    const { __, locale, locales } = useTranslations();

    return (
        <div>
            <h1>{__('messages.welcome')}</h1>
            <p>{__('messages.greeting', { name: 'John' })}</p>
            <p>Current: {locale}</p>
        </div>
    );
}
```

## Locale Switching

```tsx
import { router } from '@inertiajs/react';
import { useTranslations } from '@tooinfinity/lingua-react';

function LocaleSwitcher() {
    const { locale, locales } = useTranslations();

    const switchLocale = (newLocale: string) => {
        router.post('/locale', { locale: newLocale });
    };

    return (
        <div>
            {locales.map((loc) => (
                <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    disabled={loc === locale}
                >
                    {loc.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
```

## Translation Groups (Optional)

Load only the translations needed for a specific request by passing group names to the middleware.
When no groups are provided, Lingua shares all translations.

```php
Route::middleware(['web', 'lingua:common,validation'])->get('/dashboard', function () {
    // ...
});
```

You can also load specific groups manually via `Lingua::translationsFor(['common', 'validation'])`.

## API Reference

### `useTranslations()` Hook

```tsx
const { __, locale, locales, direction, isRtl } = useTranslations();

__('messages.welcome')                    // "Welcome!"
__('messages.greeting', { name: 'John' }) // "Hello, John!"
```

| Property | Type | Description |
|----------|------|-------------|
| `__` | `function` | Translation function |
| `locale` | `string` | Current locale |
| `locales` | `string[]` | Supported locales |
| `direction` | `'ltr' \| 'rtl'` | Text direction |
| `isRtl` | `boolean` | Is RTL locale |

### Facade

```php
use TooInfinity\Lingua\Facades\Lingua;

Lingua::getLocale();           // Get current locale
Lingua::setLocale('fr');       // Set locale (optionally persists cookie)
Lingua::supportedLocales();    // Get supported locales
Lingua::translations();        // Get all translations (missing keys fall back to default locale)
```

### Fallback Locale Behavior

When a translation key is missing in the current locale, Lingua automatically fills it from the default locale.
This applies to:
- PHP translation groups loaded via `Lingua::translationGroup()` and `Lingua::translations()`
- JSON translations loaded via `Lingua::translations()` when `translation_driver` is `json`

If the current locale already matches the default locale, no fallback merge occurs.

```php
// config/lingua.php
'default' => 'en',
```

```php
// lang/en/auth.php
return [
    'login' => 'Login',
    'logout' => 'Logout',
];

// lang/fr/auth.php
return [
    'login' => 'Connexion',
];

Lingua::setLocale('fr');

// 'logout' comes from the default locale
Lingua::translationGroup('auth');
// ['login' => 'Connexion', 'logout' => 'Logout']
```

### Routes

| Method | URI | Description |
|--------|-----|-------------|
| POST | `/locale` | Switch locale |

> **Note:** The route prefix can be configured via `config('lingua.routes.prefix')`.

## Translation File Formats

Lingua supports both PHP and JSON translation files. Configure the driver in `config/lingua.php`:

```php
'translation_driver' => 'php', // or 'json'
```

### PHP Translations (Default)

PHP translations are organized in groups (files) under `lang/{locale}/`:

```
lang/
├── en/
│   ├── messages.php
│   └── validation.php
└── fr/
    ├── messages.php
    └── validation.php
```

```php
// lang/en/messages.php
return [
    'welcome' => 'Welcome!',
    'greeting' => 'Hello, :name!',
];
```

**Shared to React as:**

```json
{
  "messages": {
    "welcome": "Welcome!",
    "greeting": "Hello, :name!"
  },
  "validation": { ... }
}
```

Access in React: `__('messages.welcome')`

### JSON Translations

JSON translations use a flat key-value structure in `lang/{locale}.json`:

```
lang/
├── en.json
└── fr.json
```

```json
// lang/en.json
{
  "Welcome!": "Welcome!",
  "Hello, :name!": "Hello, :name!",
  "auth.login": "Login",
  "auth.logout": "Logout"
}
```

**Shared to React as-is (flat structure):**

```json
{
  "Welcome!": "Welcome!",
  "Hello, :name!": "Hello, :name!",
  "auth.login": "Login",
  "auth.logout": "Logout"
}
```

Access in React: `__('Welcome!')` or `__('auth.login')`

> **Tip:** JSON translations are ideal for simple apps or when using Laravel's `__()` helper with literal string keys.

## Advanced

### Custom Controller

```php
// config/lingua.php
'controller' => \App\Http\Controllers\LocaleController::class,
```

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use TooInfinity\Lingua\Lingua;

class LocaleController
{
    public function __invoke(Request $request, Lingua $lingua)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in($lingua->supportedLocales())],
        ]);

        $lingua->setLocale($validated['locale']);

        return redirect()->route('dashboard');
    }
}
```

## License

MIT License. See [LICENSE.md](LICENSE.md).
