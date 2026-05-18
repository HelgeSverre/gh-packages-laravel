# Laravel Theme Switcher

<p align="center">
    A Laravel package for Jetstream and Livewire applications that provides a polished light, dark, and system theme switcher with persistence, package assets, and a Jetstream appearance form.
</p>

<p align="center">
    <a href="https://packagist.org/packages/r0073rr0r/laravel-theme-switcher"><img src="https://img.shields.io/packagist/v/r0073rr0r/laravel-theme-switcher" alt="Packagist Version"></a>
    <a href="https://packagist.org/packages/r0073rr0r/laravel-theme-switcher"><img src="https://img.shields.io/packagist/dt/r0073rr0r/laravel-theme-switcher" alt="Total Downloads"></a>
    <a href="https://packagist.org/packages/r0073rr0r/laravel-theme-switcher"><img src="https://img.shields.io/packagist/php-v/r0073rr0r/laravel-theme-switcher" alt="PHP Version"></a>
    <a href="https://packagist.org/packages/r0073rr0r/laravel-theme-switcher"><img src="https://img.shields.io/packagist/l/r0073rr0r/laravel-theme-switcher" alt="License"></a>
    <a href="https://github.com/r0073rr0r/laravel-theme-switcher/actions/workflows/tests.yml"><img src="https://github.com/r0073rr0r/laravel-theme-switcher/actions/workflows/tests.yml/badge.svg" alt="Tests"></a>
    <a href="https://github.com/r0073rr0r/laravel-theme-switcher/actions/workflows/php.yml"><img src="https://github.com/r0073rr0r/laravel-theme-switcher/workflows/PHP%20Composer/badge.svg" alt="PHP Composer"></a>
    <a href="https://github.com/r0073rr0r/laravel-theme-switcher/stargazers"><img src="https://img.shields.io/github/stars/r0073rr0r/laravel-theme-switcher?style=social" alt="GitHub Stars"></a>
</p>

## ✨ Features

- 🌗 Reusable Livewire theme toggle with `light`, `dark`, and `system` modes
- 👤 Optional persistence through cookies and the authenticated user's `theme_preference`
- 🧩 Jetstream-ready appearance form component for profile settings
- 🎨 Publishable package views, translations, CSS, and JavaScript
- ⚡ Early `<head>` bootstrap script to prevent theme flash before page paint
- 🛠️ Configurable toggle order, animations, tooltip behavior, sizing, and rounding

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Updating](#updating)
- [Setup](#setup)
- [Usage](#usage)
- [Theme Toggle](#theme-toggle)
- [Appearance Form](#appearance-form)
- [Translations](#translations)
- [Customization](#customization)
- [Notes](#notes)
- [License](#license)
- [Contributing](#contributing)

## 📋 Requirements

- PHP 8.2+
- Laravel 12.x
- Livewire 3.x or 4.x
- Jetstream 5.x

## 🚀 Installation

Install the package via Composer:

```bash
composer require r0073rr0r/laravel-theme-switcher
```

Publish the package config:

```bash
php artisan vendor:publish --tag=theme-switcher
```

Publish the package views if you want to override them:

```bash
php artisan vendor:publish --tag=theme-switcher-views
```

Publish the package translations if you want to customize the text:

```bash
php artisan vendor:publish --tag=theme-switcher-translations
```

Publish the package CSS:

```bash
php artisan vendor:publish --tag=theme-switcher-css
```

Publish the package JavaScript:

```bash
php artisan vendor:publish --tag=theme-switcher-assets
```

Run the migration so the package can persist the user's `theme_preference` value on the `users` table:

```bash
php artisan migrate
```

## 🔄 Updating

When updating the package, republish the resources you actually use so your application gets the latest views, translations, and frontend files:

```bash
composer update r0073rr0r/laravel-theme-switcher
php artisan vendor:publish --tag=theme-switcher-views --force
php artisan vendor:publish --tag=theme-switcher-translations --force
php artisan vendor:publish --tag=theme-switcher-css --force
php artisan vendor:publish --tag=theme-switcher-assets --force
```

If you have customized any published files, review the changes before overwriting them.

## ⚙️ Setup

### 1. Import the package CSS

Import the published stylesheet into your application's main stylesheet, for example in `resources/css/app.css`:

```css
@import './vendor/theme-switcher.css';
```

If your application uses the package views directly, Tailwind also needs to scan them so utility classes such as `h-10`, `w-10`, and `rounded-full` are generated.

For Tailwind CSS v4, add this to `resources/css/app.css`:

```css
@source "../../vendor/r0073rr0r/laravel-theme-switcher/resources/views/**/*.blade.php";
```

If you published the package views instead, point Tailwind to your published copies:

```css
@source "../views/vendor/theme-switcher/**/*.blade.php";
```

For Tailwind CSS v3, add the same paths to the `content` array in `tailwind.config.js`.

### 2. Import the package JavaScript

Import the published JavaScript into your application's main JS entry file, for example in `resources/js/app.js`:

```js
import './vendor/theme-switcher';
```

The package JavaScript expects a global theme manager at `window.masonTheme` with methods compatible with:

```js
window.masonTheme.getResolvedTheme()
window.masonTheme.applyPreference(preference, { persist: true })
```

This keeps the Livewire component state synchronized with the browser theme state.

### 3. Add the startup script to your layout `<head>`

To apply the theme before the page paints, add the package head component inside your main layout `<head>`, for example in `resources/views/layouts/app.blade.php`:

```blade
<x-theme-switcher-head />
```

This is the recommended integration point because it renders the inline startup script with the current server-side preference and updates the `dark` class before the UI flashes.

If you prefer a plain include instead of a Blade component, you can use:

```blade
@include('theme-switcher::components.head')
```

## 🧠 Configuration

After publishing the package config, you can control the switcher's default behavior without editing package files:

```php
return [
    'default_preference' => 'system',
    'allowed_preferences' => ['light', 'dark', 'system'],
    'cycle_order' => ['light', 'dark', 'system'],
    'animations' => [
        'enabled' => true,
        'duration' => 300,
        'icon_transition' => true,
        'hover_effects' => true,
        'respect_reduced_motion' => true,
    ],
    'persistence' => [
        'cookie_enabled' => true,
        'cookie_name_preference' => 'theme_preference',
        'cookie_name_theme' => 'theme',
        'cookie_minutes' => 60 * 24 * 365,
        'database_enabled' => true,
    ],
    'ui' => [
        'show_system_option' => true,
        'button_size' => 'md',
        'rounded' => 'full',
        'show_tooltip' => true,
    ],
    'events' => [
        'dispatch_theme_changed' => true,
        'dispatch_preference_updated' => true,
    ],
];
```

What these options are for:

- `default_preference`: fallback preference when no authenticated or cookie state exists.
- `allowed_preferences`: restrict the package to `light`, `dark`, or `system`.
- `cycle_order`: controls the order used by the header toggle button.
- `animations.*`: enables or disables hover and icon transitions, with reduced-motion support.
- `persistence.*`: decides whether the package writes cookies, updates the authenticated user, or both.
- `ui.*`: controls whether `system` is shown, the button size, shape, and tooltip behavior.
- `events.*`: lets you disable the package browser events if you want to manage sync manually.

Examples:

- `['light', 'dark']` removes the system option from the toggle and the profile appearance form.
- Setting `animations.enabled` to `false` renders the same UI without motion transitions.
- Setting `persistence.database_enabled` to `false` keeps the switcher cookie-based only.

## 🧪 Usage

### Theme Toggle

Render the Livewire component wherever you want the theme toggle button:

```blade
<livewire:theme-switcher />
```

Or:

```blade
@livewire('theme-switcher')
```

The component:

- Reads the current theme preference from the authenticated user when available
- Falls back to cookies when no authenticated preference exists
- Cycles through the preferences defined in `theme-switcher.cycle_order`
- Persists the selected preference according to the `persistence` config
- Updates the authenticated user's `theme_preference` column when database persistence is enabled

### Appearance Form

The package also registers a Livewire component alias for Jetstream profile settings:

```blade
@livewire('profile.update-appearance-form')
```

If you want to show it on the default Jetstream profile page, open:

```text
resources/views/profile/show.blade.php
```

Then add this block near the top of the main content area, for example after the profile information form:

```blade
<div class="mt-10 sm:mt-0">
    @livewire('profile.update-appearance-form')
</div>

<x-section-border />
```

If you prefer to reference the class directly, you can also use:

```blade
@livewire(\r0073rr0r\ThemeSwitcher\Livewire\Profile\UpdateAppearanceForm::class)
```

The form view rendered by that component comes from the package:

```text
resources/views/profile/update-appearance-form.blade.php
```

If you publish the package views, you can override that file and adapt it to your own account settings flow.

## 🌍 Translations

The package loads its own translations automatically through the `theme-switcher` namespace, so publishing translations is optional.

Example keys:

```php
__('theme-switcher::theme-switcher.appearance')
__('theme-switcher::theme-switcher.save')
```

How translation fallback works:

- If the application does not publish translations, Laravel uses the package translation files directly
- If translations are published, Laravel will prefer `lang/vendor/theme-switcher`
- If the current locale does not exist, Laravel will try the application's `fallback_locale`

This package already includes:

- `resources/lang/en/theme-switcher.php`
- `resources/lang/sr/theme-switcher.php`

That means a typical application with `fallback_locale=en` will still show English text even when the active locale has no dedicated theme-switcher translation yet.

## 🎨 Customization

After publishing, you can customize these package resources:

- Views: `resources/views/vendor/theme-switcher`
- Translations: `lang/vendor/theme-switcher`
- CSS: `resources/css/vendor/theme-switcher.css`
- JavaScript: `resources/js/vendor/theme-switcher.js`

The startup head script is provided by the package view component:

- Component: `theme-switcher::components.head`
- Include/partial: `theme-switcher::components.head`

## 📝 Notes

- The package CSS is intended to be included in the consumer application's build pipeline
- The package JavaScript is intended to be imported into the consumer application's JS entry file
- The startup head script should be rendered from Blade, not bundled as a plain JavaScript file, because it depends on server-side preference state
- The package no longer publishes unrelated third-party assets
- The authenticated user model is expected to support a `theme_preference` column if you want per-user persistence
- The service provider registers both `theme-switcher` and `profile.update-appearance-form` Livewire aliases
- When `animations.respect_reduced_motion` is enabled, motion utility classes are reduced for users who prefer less animation

## ✅ Testing

The package test suite is written with Pest and covers configuration helpers, Livewire components, head bootstrap rendering, and persistence behavior.

Run the tests locally with:

```bash
php vendor/bin/pest
```

## 📄 License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## 🤝 Contributing

Pull requests are welcome. For larger changes, open an issue first so the scope is clear before implementation.
