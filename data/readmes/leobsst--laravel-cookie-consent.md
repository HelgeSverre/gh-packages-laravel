<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
  <a href="https://packagist.org/packages/leobsst/laravel-cookie-consent"><img src="https://img.shields.io/packagist/v/leobsst/laravel-cookie-consent.svg?style=flat-square" alt="Version"></a>
  <a href="https://laravel.com"><img src="https://img.shields.io/badge/Laravel-V11.9%20|%20V12.x%20|%2013.x-FF2D20?logo=laravel" alt="Laravel"></a>
  <a href="https://www.php.net"><img src="https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php" alt="PHP"></a>
</p>

<p align="center">
  <a href="https://packagist.org/packages/leobsst/laravel-cookie-consent"><img src="https://img.shields.io/packagist/dt/leobsst/laravel-cookie-consent.svg?style=flat-square" alt="Downloads"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"></a>
</p>

<h1 style="text-align: center;">Laravel Cookie Consent</h1>

A lightweight Laravel package for handling cookie consent with Google Tag Manager integration. No Livewire required — the banner is a pure Blade component with vanilla JavaScript, making it usable in any Laravel project.

## Features

- Zero Livewire dependency — pure Blade component + vanilla JS
- Simple binary consent system (Accept/Refuse)
- Automatic Google Tag Manager integration with Consent Mode v2
- Cookie set client-side (non-HttpOnly, readable by JS)
- Persistent user preferences stored in cookies (1 year by default)
- Tailwind CSS styling with customizable accent color
- Dark mode support
- Multi-language support (EN, FR, IT, ES, DE)

## Requirements

- PHP 8.2 or higher
- Laravel 11.9 or 12.x or 13.x
- Tailwind CSS or higher

## Installation

### Step 1: Install the Package

```bash
composer require leobsst/laravel-cookie-consent
```

### Step 2: Publish Assets (Required)

```bash
php artisan vendor:publish --tag=cookie-consent-assets
```

This publishes `public/vendor/cookie-consent/cookie-consent.js`, the JavaScript file that handles cookie writing and Google Tag Manager consent updates.

### Step 3: Publish Config File (Recommended)

```bash
php artisan vendor:publish --tag=cookie-consent-config
```

This creates `config/cookie-consent.php` where you can customize:

- **GOOGLE_TAG_MANAGER_ID**: Your GTM container ID (e.g. `GTM-XXXXXXX`)
- **LEARN_MORE_LINK**: URL or route name for the "Learn more" link (default: `/privacy-policy`)
- **CONSENT_BANNER_VIEW**: Override the banner view
- **ACCENT_COLOR**: Button and link color (default: `#3490dc`)
- **duration**: Cookie lifetime in minutes (default: 1 year)
- **same_site**: SameSite cookie attribute (default: `Lax`)

### Alternative: Use the Install Command

```bash
php artisan cookie-consent:install
```

This will publish the config file and assets, then ask you to star the repository on GitHub.

## Configuration

### Tailwind CSS Integration

> [!IMPORTANT]
>
> Add the following to your `app.css` so Tailwind processes the banner's utility classes:

```css
@source '../../../../vendor/leobsst/laravel-cookie-consent/resources/views/**/*.blade.php';
```

## Usage

### Basic Usage

1. **Add your Google Tag Manager ID to `.env`:**

```env
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
```

2. **Add the scripts directive and the banner component to your layout:**

```blade
<!DOCTYPE html>
<html>
<head>
    <!-- Google Tag Manager with Consent Mode v2 -->
    @cookieConsentScripts
</head>
<body>
    <!-- Your content -->

    <!-- Cookie Consent Banner -->
    <x-cookie-consent::cookie-banner />
</body>
</html>
```

The banner automatically appears for users who have not yet set their cookie preferences.

### Complete Example

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    {{-- Google Tag Manager with Consent Mode --}}
    @cookieConsentScripts
</head>
<body>
    <div id="app">
        {{ $slot }}
    </div>

    {{-- Cookie Consent Banner --}}
    <x-cookie-consent::cookie-banner />
</body>
</html>
```

### How It Works

1. `@cookieConsentScripts` (or `<x-cookie-consent::scripts />`) injects the GTM snippet with `gtag('consent', 'default', ...)`. The initial state depends on the `cookie_consent` cookie already being set (e.g. returning visitors).

2. `<x-cookie-consent::cookie-banner />` renders the banner only when GTM is configured **and** the user has not yet made a choice. It also injects a small `window.CookieConsent` config object (cookie name, duration, SameSite, secure flag) and the banner's JavaScript inline.

3. When the user clicks Accept or Refuse, the bundled `cookie-consent.js` script:
   - Writes the `cookie_consent` cookie directly in the browser (non-HttpOnly so it remains readable by JS on subsequent page loads)
   - Calls `gtag('consent', 'update', ...)` to update consent in the current GTM session
   - Hides the banner instantly without a page reload

### Checking User Consent

The `HandleCookieConsent` middleware shares `$cookieConsentStatus` with all views:

```php
// In a Blade view
@if($cookieConsentStatus === 'full')
    {{-- User has accepted all cookies --}}
@endif
```

You can also read the cookie directly via the `$_COOKIE` superglobal:

```php
$consent = $_COOKIE['cookie_consent'] ?? null;
// 'full'  — accepted
// 'none'  — refused
// null    — not yet set
```

> [!NOTE]
> Do **not** use `request()->cookie('cookie_consent')` — Laravel's `EncryptCookies` middleware will try to decrypt the value and return `null`, because the cookie is written as plain text by the browser-side JavaScript. Reading it via `$_COOKIE` bypasses decryption and returns the raw value correctly.

### Customizing the Banner

Publish the views to modify them:

```bash
php artisan vendor:publish --tag=cookie-consent-views
```

This copies the views to `resources/views/vendor/cookie-consent/`. You can also point to a completely custom view via the config:

```php
// config/cookie-consent.php
'CONSENT_BANNER_VIEW' => 'my-theme.cookie-banner',
```

Your custom view receives these variables from `CookieBanner`:

| Variable | Type | Description |
|---|---|---|
| `$loadScript` | `bool` | Whether GTM is configured |
| `$learnMoreLink` | `?string` | Resolved URL for the "Learn more" link |
| `$accentColor` | `?string` | CSS color value |
| `$cookieDuration` | `int` | Cookie lifetime in **seconds** |
| `$sameSite` | `string` | SameSite attribute value |

### Translations

The banner uses the locale set in `config('app.locale')`. Available languages: English (`en`), French (`fr`), Italian (`it`), Spanish (`es`), German (`de`).

To publish and customize translation files:

```bash
php artisan vendor:publish --tag=cookie-consent-lang
```

Files are published to `resources/lang/vendor/cookie-consent/`.

**Translation keys:**

| Key | Default (EN) |
|---|---|
| `cookie-consent::translations.description` | Our website uses cookies... |
| `cookie-consent::translations.question` | Do you accept the use of these cookies? |
| `cookie-consent::translations.learn_more` | Learn more |
| `cookie-consent::translations.accept` | Accept |
| `cookie-consent::translations.refuse` | Deny |

## Google Tag Manager Consent Mode

The package implements Google Consent Mode v2.

**Default state (user has not yet decided):**
```javascript
{
  'functional_storage': 'granted',
  'security_storage': 'granted',
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
}
```

**When user accepts:**
```javascript
{
  'functional_storage': 'granted',
  'security_storage': 'granted',
  'analytics_storage': 'granted',
  'ad_storage': 'granted',
  'ad_user_data': 'granted',
  'ad_personalization': 'granted'
}
```

**When user refuses:**
```javascript
{
  'functional_storage': 'granted',
  'security_storage': 'granted',
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied'
}
```

> **Note:** On a first-time accept, if `gtag` is not yet loaded (GTM script hasn't initialized), the page will reload once so that GTM boots with the correct consent state.

## Advanced Configuration

### Environment Variables

```env
# Required for Google Tag Manager integration
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX

# Optional
COOKIE_LEARN_MORE_LINK=/privacy-policy
COOKIE_CONSENT_BANNER_VIEW=cookie-consent::components.cookie-banner
COOKIE_CONSENT_ACCENT_COLOR=#3490dc
```

### Resetting a User's Consent

```php
use Illuminate\Support\Facades\Cookie;

Cookie::queue(Cookie::forget('cookie_consent'));
```

## FAQ

### Does this package require Livewire?

No. As of v2, Livewire is not required. The banner is a Blade component and all consent logic runs in vanilla JavaScript.

### Can I use this without Google Tag Manager?

Yes. Simply don't set `GOOGLE_TAG_MANAGER_ID`. The banner will not appear (it only renders when GTM is configured), but the `cookie_consent` cookie will still be available for you to use in your own scripts.

### How do I style the banner to match my design?

1. Use `ACCENT_COLOR` in the config to change the button/link color.
2. Publish the views and edit the Tailwind classes.
3. Create a completely custom view and point `CONSENT_BANNER_VIEW` to it.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Security

If you find a security vulnerability, please email [contact@leobsst.fr](mailto:contact@leobsst.fr) instead of using the issue tracker.

## Credits

- [LEOBSST](https://github.com/LEOBSST)
- [B.L.A.M. PRODUCTION](https://linksly.fr/BLAM-PRODUCTION)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
