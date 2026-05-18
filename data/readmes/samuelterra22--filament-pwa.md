# Filament PWA

[![Latest Version on Packagist](https://img.shields.io/packagist/v/samuelterra22/filament-pwa.svg?style=flat-square)](https://packagist.org/packages/samuelterra22/filament-pwa)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/samuelterra22/filament-pwa/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/samuelterra22/filament-pwa/actions?query=workflow%3Atests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/samuelterra22/filament-pwa.svg?style=flat-square)](https://packagist.org/packages/samuelterra22/filament-pwa)

Turn your Filament panel into an installable Progressive Web App. Manifest, service worker, offline page, icons, and splash screens — all configurable from the admin panel.

## Installation

```bash
composer require samuelterra22/filament-pwa
```

```bash
php artisan filament-pwa:install
```

```php
use SamuelTerra22\FilamentPwa\FilamentPwaPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugin(FilamentPwaPlugin::make());
}
```

Done. Your panel is now a PWA.

## Features

| Feature | Details |
|---------|---------|
| Web App Manifest | Dynamic `manifest.json` from database settings |
| Service Worker | Network-first navigation, cache fallback, offline support |
| Offline Page | Branded fallback when users lose connectivity |
| Offline Indicator | Real-time banner when connection is lost/restored |
| Install Prompt | Custom "Add to Home Screen" banner with dismiss & 7-day snooze |
| Update Notification | Detects new service worker versions, one-click refresh |
| Icons | 8 sizes (72x72 to 512x512) with built-in defaults |
| Maskable Icons | Configurable icon purpose (any, maskable, any maskable) |
| Splash Screens | 10 sizes covering iPhone, iPad, and Android |
| App Screenshots | Upload screenshots for richer install experience |
| App Shortcuts | Quick-action shortcuts with custom icons |
| Settings Page | Tabbed UI (General, Appearance, Icons, Splash, Shortcuts, Advanced, Screenshots) |
| Advanced Manifest | Description, scope, language, text direction, app ID, categories, display override |
| Dark Mode | Inherits Filament panel theme automatically |
| Multilingual | 49 languages included |
| iOS / Android / Windows | Full meta tag support for all platforms |

## Requirements

- PHP 8.1+
- Laravel 11 or 12
- Filament 4.x

## Usage

After installation, go to **Settings > PWA** in your Filament panel to configure:

- App name, short name, start URL
- Theme color, background color, status bar color
- Display mode (standalone, fullscreen, minimal-ui, browser)
- Orientation (any, portrait, landscape)
- Upload custom icons and splash screens (with maskable icon support)
- Add app shortcuts
- App description, scope, language, text direction, app ID
- Categories and display override fallback chain
- Upload screenshots for richer install UX (narrow/wide form factors)

All changes take effect immediately — no deploy needed.

### Install Prompt

A themed "Add to Home Screen" banner appears automatically when the browser fires the `beforeinstallprompt` event. Users can dismiss it (snoozed for 7 days) or install the app with one tap. The banner uses your configured theme color and app icon.

### Offline Indicator

A slim banner appears at the top of the page when the user loses connectivity, and briefly shows "Back online" when the connection is restored.

### Update Notification

When a new service worker is detected, a banner prompts the user to refresh. Clicking the button triggers `skipWaiting` on the new worker and reloads the page seamlessly.

## Configuration

### Disable the settings page

```php
FilamentPwaPlugin::make()
    ->settingsPage(false)
```

### Toggle PWA features

```php
FilamentPwaPlugin::make()
    ->installPrompt(false)       // Disable the "Add to Home Screen" banner
    ->offlineIndicator(false)    // Disable the offline/online status banner
    ->updateNotification(false)  // Disable the "New version available" banner
```

All three features are **enabled by default**.

### Customize middleware

```bash
php artisan vendor:publish --tag="filament-pwa-config"
```

```php
// config/filament-pwa.php
return [
    'middlewares' => ['web'],
];
```

### Customize views or translations

```bash
php artisan vendor:publish --tag="filament-pwa-views"
php artisan vendor:publish --tag="filament-pwa-translations"
```

### Supported languages (49)

am, ar, az, bn, ca, ckb, cs, da, de, en, es, eu, fa, fi, fr, he, hr, hu, hy, id, it, ja, ka, km, ko, ku, lt, lus, mk, ms, nb, ne, nl, pl, pt, pt_BR, ro, ru, sk, sr_Cyrl, sr_Latn, sv, tr, uk, uz, vi, zh_CN, zh_HK, zh_TW

## Testing

```bash
composer test
```

Or with Docker (no PHP required):

```bash
docker compose run --rm app composer install
docker compose run --rm app vendor/bin/pest
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Samuel Terra](https://github.com/samuelterra22)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
