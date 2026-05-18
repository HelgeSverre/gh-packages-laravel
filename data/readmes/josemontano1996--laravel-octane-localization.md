# Laravel Octane Localization

[![GitHub Tests Action Status](https://github.com/josemontano1996/laravel-octane-localization/actions/workflows/run-tests.yml/badge.svg)](https://github.com/josemontano1996/laravel-octane-localization/actions)

A state-aware, high-performance localization package for Laravel, meticulously designed for **Laravel Octane** (also compatible with traditional FPM). 

In long-lived worker environments like Octane, managing request state is tricky. This package solves the "leaking locale" problem by using scoped container bindings and explicit lifecycle resets, ensuring every request gets its own correctly detected and isolated localization state.

## The Problem with Octane

Traditional localization packages often rely on Singletons or global application state to remember the requested language. In **Laravel Octane**, the application boots once and stays in memory. If a user requests a page in Spanish (`/es`), a Singleton remembering "Spanish" would cause the next user to see the homepage in Spanish because the state **leaked**.

This package prevents state leakage by combining **scoped container bindings** and **worker listeners**:
- **Stateful** components (like the detected Locale or current Request Context) are bound using Scoped bindings, giving each worker request a fresh, isolated state.
- **Explicit Resets**: Instead of relying on middleware termination (which can be bypassed during redirects or crashes), we hook directly into Octane's internal events to scrub the environment.

## Key Features

- 🏎️ **Octane Ready**: Zero state-leakage between requests.
- 🛠️ **Extensible Drivers**: Detect locale from URL, Session, Cookies, or Browser headers.
- 🌊 **Livewire Support**: Seamlessly syncs localization for Livewire components.
- 📂 **Queue Support**: Re-hydrates localization context in queued jobs via a simple interface.
- 🚀 **SEO Ready**: Generates `hreflang` alternate links with a single directive.

---

## Installation & Critical Setup

### 1. Install via Composer
```bash
composer require josemontano1996/laravel-octane-localization
```

### 2. Register the Octane Listener (Required)
To ensure that static states (like Number, Carbon, and URL::defaults) are scrubbed between requests, you must register the `ResetLocalizationStateListener` listener in your `config/octane.php`.

```php
// config/octane.php

'listeners' => [
    RequestReceived::class => [
        ...Octane::prepareApplicationForNextOperation(),
        ...Octane::prepareApplicationForNextRequest(),
        \Josemontano1996\LaravelOctaneLocalization\Listeners\ResetLocalizationStateListener::class,
    ],
],
```

### 3. Setup Queue Worker Reset
Queue workers are also long-lived processes and are handled automatically by the package.
Unlike Octane, which requires manual listener registration, this package hooks into the Laravel Queue lifecycle and resets the localization state before each job starts.

This happens automatically via the package service provider, so your worker always begins with a clean default locale. That means even non-localized queued jobs do not leak locale state from a previous execution.

## Configuration
Publish the config file:

```bash
php artisan vendor:publish --tag="octane-localization"
```

The `config/octane-localization.php` file allows you to define your default locale, supported locales, and the order of drivers used for detection.

```php
return [
    'default_locale' => 'en',
    'parameter_key' => 'locale',
    'supported_locales' => ['en', 'es', 'fr'],
    
    'drivers' => [
        \Josemontano1996\LaravelOctaneLocalization\Drivers\UrlDriver::class,
        \Josemontano1996\LaravelOctaneLocalization\Drivers\SessionDriver::class,
        \Josemontano1996\LaravelOctaneLocalization\Drivers\RequestPreferredLocaleDriver::class,
    ],
];
```

- `default_locale` - the locale used when no supported locale is detected and the locale restored by Octane/queue resets.
- `parameter_key` - the locale key used both for localized URL routes and for session/cookie storage drivers.

## Usage

### Route Macros
The package provides two macros to handle localization. 

1. localizedWithPrefix
Use this for URL-based localization (e.g., [example.com/en/dashboard](https://example.com/en/dashboard)). It automatically adds the {locale} prefix and applies a whereIn constraint based on your supported locales. This macro applies the  LocalizationMiddleware to the group.

```php
Route::localizedWithPrefix(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    });
});
```

2. localizedWithoutPrefix
Use this if you want to detect the locale via Session, Cookies, or Browser Headers without changing the URL structure (e.g., [example.com/dashboard](https://example.com/dashboard)). This macro applies the  LocalizationMiddlewareWithoutRedirect to the group.


This is ideal for internal dashboards or applications where a clean URL is preferred over SEO-friendly language segments.

```php
Route::localizedWithoutPrefix(function () {
    Route::get('/profile', function () {
        return view('profile');
    });
});
```

### Blade Directives

| Directive | Description |
|-----------|-------------|
| `@currentLocale` | Outputs the current application locale |
| `@isLocale('en')` | Conditional block for specific languages |
| `@supportedLocales` | Iterates over all supported locales |
| `@localizedUrl('es')` | Returns the current URL switched to another locale |
| `@alternateLinks` | Generates SEO hreflang tags for the `<head>` |

## The Localization Lifecycle
The `LocalizationManager` manages the environment through three main phases:
- `detect(Request $request)`: Runs your configured drivers to find the target locale.
- `syncWithApplication()`: Pushes the locale to `App::setLocale()`, `URL::defaults()`, Carbon, and Number.
- `reset()`: Triggered by Octane and Queue listeners. It flushes the state back to the system default, ensuring zero state leakage for the next worker task.

## Advanced Features

### Queue Worker Reset
Queue workers are long-lived processes and can reuse the same worker instance for multiple jobs. This package automatically resets the localization state before each queued job starts by listening to Laravel's `JobProcessing` event.

That means:
- every queued job begins in the default locale,
- no locale state is carried over from a previous job,
- you do not need to register an additional queue listener manually.

### Localized Jobs (Persistence)
If you want a specific job to run in the original locale of the user who triggered it (for example, sending a French invoice), use the `LocalizationAwareJob` interface together with the `LocalizedJob` trait and `LocalizationQueueMiddleware`.

The interface is available at:
`Josemontano1996\LaravelOctaneLocalization\Contracts\Support\LocalizationAwareJob`

The trait is available at:
`Josemontano1996\LaravelOctaneLocalization\Traits\LocalizedJob`

Use them like this:

```php
use Josemontano1996\LaravelOctaneLocalization\Contracts\Support\LocalizationAwareJob;
use Josemontano1996\LaravelOctaneLocalization\Queue\LocalizationQueueMiddleware;
use Josemontano1996\LaravelOctaneLocalization\Traits\LocalizedJob;

class SendInvoice implements ShouldQueue, LocalizationAwareJob
{
    use LocalizedJob;

    public function middleware(): array
    {
        return [new LocalizationQueueMiddleware()];
    }
}
```

### How it works
`LocalizationQueueMiddleware` wraps the queued job execution and performs:
- `restoreLocalization()` before the job runs, restoring the locale saved in Laravel 11 Context,
- the job handler execution,
- `resetLocalization()` in a `finally` block so the worker returns to a clean state.

### Custom LocalizationAwareJob Support
If you want to implement the interface manually instead of using the trait, your job class must define both methods and call the same manager/context services internally.

```php
use Josemontano1996\LaravelOctaneLocalization\Contracts\Support\LocalizationAwareJob;
use Josemontano1996\LaravelOctaneLocalization\Contracts\LocalizationContextInterface;
use Josemontano1996\LaravelOctaneLocalization\Contracts\LocalizationManagerInterface;

class SendInvoice implements ShouldQueue, LocalizationAwareJob
{
    public function restoreLocalization(): void
    {
        $context = app(LocalizationContextInterface::class);
        $manager = app(LocalizationManagerInterface::class);

        if ($locale = $context->get()) {
            $manager->setLocale($locale);
            $manager->syncWithApplication();
        }
    }

    public function resetLocalization(): void
    {
        app(LocalizationManagerInterface::class)->reset();
    }
}
```

## License
The MIT License (MIT). Please see License File for more information.