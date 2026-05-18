# Laravel Jetstream Livewire Language Switcher

A beautiful and easy-to-use language switcher component for **Laravel** applications using **Jetstream** and **Livewire**. This package provides a dropdown menu with country flags for switching between different application languages.

[![Packagist Version](https://img.shields.io/packagist/v/r0073rr0r/laravel-language-switcher.svg)](https://packagist.org/packages/r0073rr0r/laravel-language-switcher)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)](https://laravel.com)
[![Livewire](https://img.shields.io/badge/Livewire-3.x-pink.svg)](https://livewire.laravel.com)
[![Laravel Jetstream](https://img.shields.io/badge/Jetstream-5.x-blue.svg)](https://jetstream.laravel.com)
[![Total Downloads](https://img.shields.io/packagist/dt/r0073rr0r/laravel-language-switcher.svg)](https://packagist.org/packages/r0073rr0r/laravel-language-switcher)
[![Monthly Downloads](https://img.shields.io/packagist/dm/r0073rr0r/laravel-language-switcher.svg)](https://packagist.org/packages/r0073rr0r/laravel-language-switcher)
[![GitHub Stars](https://img.shields.io/github/stars/r0073rr0r/laravel-language-switcher?style=social)](https://github.com/r0073rr0r/laravel-language-switcher/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/r0073rr0r/laravel-language-switcher)](https://github.com/r0073rr0r/laravel-language-switcher/issues)
[![GitHub Forks](https://img.shields.io/github/forks/r0073rr0r/laravel-language-switcher?style=social)](https://github.com/r0073rr0r/laravel-language-switcher/network)
[![CodeQL](https://github.com/r0073rr0r/laravel-language-switcher/workflows/CodeQL/badge.svg)](https://github.com/r0073rr0r/laravel-language-switcher/actions/workflows/github-code-scanning/codeql)
[![Tests](https://github.com/r0073rr0r/laravel-language-switcher/actions/workflows/tests.yml/badge.svg)](https://github.com/r0073rr0r/laravel-language-switcher/actions/workflows/tests.yml)

## 📑 Table of Contents

- [✨ Features](#-features)
- [📋 Requirements](#-requirements)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🚀 Usage](#-usage)
- [⚙️ How It Works](#️-how-it-works)
- [🎨 Customization](#-customization)
- [💻 Development](#-development)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)
- [📝 License](#-license)
- [🙏 Credits](#-credits)
- [💬 Support](#-support)

## ✨ Features

- 🎨 Beautiful dropdown with country flags
- ⚡ Built with Livewire 3
- 🔧 Easy integration with Laravel Jetstream
- 🌍 Automatic locale detection and persistence
- 🎯 Middleware for automatic locale setting
- 📦 Auto-discovery support
- 🎭 Uses flag-icons for beautiful country flags

## 📋 Requirements

- PHP ^8.2
- **Laravel ^12.0**
- **Livewire ^3.0**
- **Jetstream ^5.0**

## 📦 Installation

Install the package via Composer:
```bash
composer require r0073rr0r/laravel-language-switcher
```

#### Install flag-icons package:
```bash
npm install flag-icons
```
---
### Publish Assets

Publish the package assets
 ```bash
 php artisan vendor:publish --tag=language-switcher
 ```
This will publish to your `public/vendor/language-switcher` directory.

<a href="https://asciinema.org/a/4yZfzItbqpigFITGlCH9mfv9c" target="_blank">
<img src="https://asciinema.org/a/4yZfzItbqpigFITGlCH9mfv9c.svg" alt="Language Switcher Installation" />
</a>

---

Include the CSS file in your `resources/css/app.css` file:
```css
@import "/node_modules/flag-icons/css/flag-icons.min.css";
```
---
#### Build project:
```bash
npm run build
```
---
## ⚙️ Configuration

### 1. Register the Middleware

Add the `SetLocale` middleware to your `bootstrap/app.php`:

```php
use r0073rr0r\LanguageSwitcher\Http\Middleware\SetLocale;

->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        SetLocale::class,
    ]);
})
```

### Configure Available Locales

In your `config/app.php`, make sure you have your supported locales defined:

    'locale' => 'en',
    'fallback_locale' => 'en',

### Add Translation Files

Create translation files for your supported languages in lang/ directory:

    lang/
      en/
      sr/
      de/

### Configuration Options

The package configuration file `config/language-switcher.php` contains the following options:

#### `supported_locales` (array)

List of language codes (ISO 639-1) your application supports. These codes are used to:
- Generate the language dropdown dynamically
- Validate language selection in the LanguageSwitcher component
- Filter available languages in the middleware

**Example:**
```php
'supported_locales' => ['en', 'sr', 'ru', 'de', 'fr'],
```

#### `default_locale` (string)

The default language code that will be used when:
- No language is set in the user's session
- The session contains an unsupported locale
- A user visits the site for the first time

This should match your Laravel app's default locale in `config/app.php`.

**Example:**
```php
'default_locale' => 'en',
```

#### `flags` (array)

Maps each language code to a corresponding country flag code (ISO 3166-1 alpha-2) from the flag-icons library. This is used to display the correct flag icon next to each language option in the dropdown.

**Example:**
```php
'flags' => [
    'en' => 'gb',  // English → Great Britain flag
    'sr' => 'rs',  // Serbian → Serbia flag
    'ru' => 'ru',  // Russian → Russia flag
],
```

#### `names` (array)

Maps each language code to its display name that will be shown in the language switcher dropdown. These names are typically written in the native language. If a language code is not found in this array, the component will fall back to displaying the uppercase locale code.

**Example:**
```php
'names' => [
    'en' => 'English',
    'sr' => 'Srpski',
    'ru' => 'Русский',
],
```

#### `reload_method` (string)

Defines how the application should handle the page after switching the language. This ensures that the new locale is applied correctly across the entire application.

Available options:

- **`'js'`** (default): Uses JavaScript to reload the page (`window.location.reload()`). This is the most reliable method and ensures the locale is applied immediately. Works well in most scenarios and is recommended for most applications.

- **`'redirect'`**: Uses Laravel redirect to navigate back to the previous page or home. This method uses server-side redirect which can be more SEO-friendly and provides better control over the navigation flow. Useful when you want to maintain the URL structure or need server-side processing.

- **`'none'`**: Does not reload or redirect. The locale change will be applied on the next request. Use this if your application handles locale changes without requiring a page reload (e.g., if you're using Livewire's reactive properties or if the middleware properly handles the locale change on subsequent requests).

**Example:**
```php
// Use JavaScript reload (default - most reliable)
'reload_method' => 'js',

// Use server-side redirect
'reload_method' => 'redirect',

// Don't reload - let middleware handle it on next request
'reload_method' => 'none',
```

> **Note:** If you experience issues where the language doesn't change after switching, try using `'js'` (default) or `'redirect'`. If your application already handles locale changes properly without reload, you can set it to `'none'` for a smoother user experience.

## 🚀 Usage

### Add to Jetstream Navigation

Add the language switcher component to your Jetstream navigation menu in navigation-menu.blade.php:

<img src="https://cloud.dbase.in.rs/public.php/dav/files/MfdJGCox6St4ms3/" alt="Language Switcher">

```bladehtml
<!-- Language Switcher -->
<livewire:language-switcher/>
```

### Customize Available Languages

The default supported languages are defined in `config/language-switcher.php`:

- `supported_locales` — list of language codes (e.g., 'en', 'sr', 'de')
- `flags` — maps language code to flag-icons class
- `names` — optional display names for languages
- `reload_method` — how to handle page after language switch: `'redirect'` (default), `'js'`, or `'none'`

You can add new languages by updating these arrays. See the [Configuration Options](#configuration-options) section above for detailed information about each option.

If you update supported languages, make sure to update the `supported_locales` array in `config/app.php`.
And clear config cache:
```bash
php artisan config:clear
php artisan cache:clear
```

## ⚙️ How It Works

1. **Middleware**: The SetLocale middleware automatically sets the application locale based on the session value
2. **Livewire Component**: The LanguageSwitcher component provides the UI for language selection
3. **Session Persistence**: Selected language is stored in the session and persists across requests
4. **Flag Icons**: Uses the flag-icons library to display beautiful country flags

## 🎨 Customization

### Adding More Languages

To add more languages, edit the languages array in the component with the language code and corresponding flag code (ISO 3166-1-alpha-2).

Example flag codes:
- gb - Great Britain (English)
- rs - Serbia (Serbian)
- de - Germany (German)
- fr - France (French)
- es - Spain (Spanish)
- it - Italy (Italian)

## 💻 Development

The package uses Laravel Pint for code formatting:

```bash
./vendor/bin/pint
```

### Running Tests

Install dev dependencies and run the test suite:

```bash
composer install
composer test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔒 Security

If you discover any security-related issues, please email `velimir@majstorov.rs` instead of using the issue tracker.

## 📝 License

This package is open-sourced software licensed under the MIT license.

## 🙏 Credits

- Flag Icons for the beautiful flag icons

## 💬 Support

If you find this package useful, please consider giving it a star on GitHub!