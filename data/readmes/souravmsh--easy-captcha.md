# Easy Captcha

[![Latest Version on Packagist](https://img.shields.io/packagist/v/souravmsh/easy-captcha.svg?style=flat-square)](https://packagist.org/packages/souravmsh/easy-captcha)
[![Total Downloads](https://img.shields.io/packagist/dt/souravmsh/easy-captcha.svg?style=flat-square)](https://packagist.org/packages/souravmsh/easy-captcha)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)

An easy, lightweight, pure image-based CAPTCHA package for Laravel (Requires ext-gd).
No third-party APIs needed for local generation. The CAPTCHA generates standard image data dynamically directly via PHP.
Also supports **Google reCAPTCHA v2/v3** and **Cloudflare Turnstile** (Latest!).

**[View Landing Page & Documentation](https://souravmsh.github.io/easy-captcha/)**

## Installation

```bash
composer require souravmsh/easy-captcha
```

The package is auto-discovered by Laravel. If auto-discovery is disabled, register the service provider manually (optional):

**Laravel 11+** — in `bootstrap/providers.php`:
```php
return [
    // ...
    Souravmsh\EasyCaptcha\EasyCaptchaServiceProvider::class,
];
```

**Laravel 7–10** — in `config/app.php` under `providers`:
```php
'providers' => [
    // ...
    Souravmsh\EasyCaptcha\EasyCaptchaServiceProvider::class,
],
```

## Configuration

Optionally publish the configuration file to customize CAPTCHA sizes and colors:

```bash
php artisan vendor:publish --tag=easy-captcha-config
```

To overwrite an already published config:

```bash
php artisan vendor:publish --tag=easy-captcha-config --force
```

You can change the CAPTCHA type in `config/easy_captcha.php`, or easily turn the CAPTCHA off completely for local development/testing using your `.env` file:
```env
EASY_CAPTCHA_ENABLED=false
EASY_CAPTCHA_TYPE=math
EASY_CAPTCHA_FONT_PATH=UbuntuMono-Regular
```

### Bundled Fonts (Latest!)
The package now comes with built-in fonts that you can use by name in your `.env` or config:
- `IndieFlower` (Default - Handwritten)
- `SpecialElite` (Typewriter style)
- `CourierPrime` (Monospace)
- `Ubuntu-Bold`
- `UbuntuMono-Regular`
- `Ubuntu-Italic`

Supported types: 
- `'random'` (Alphanumeric)
- `'math'` (e.g., 5 + 3, validation checks for 8)
- `'alphabet'` (Letters only)
- `'number'` (Numbers only)
- `'google'` (Google reCAPTCHA v2/v3 support!)
- `'turnstile'` (Cloudflare Turnstile support! - Latest)

### Setting up Google reCAPTCHA 
If you choose `google` as the CAPTCHA type, our blade directive and validation facade will automatically hook into Google's APIs. If you want to use older version like v3 then spefify in config file, default is v3. Add your site/secret keys inside the `.env`:

```env
EASY_CAPTCHA_TYPE=google
EASY_CAPTCHA_GOOGLE_API_VERSION=3 
EASY_CAPTCHA_GOOGLE_SITE_KEY=your-site-key-here
EASY_CAPTCHA_GOOGLE_SECRET_KEY=your-secret-key-here
```

### Setting up Cloudflare Turnstile (Latest!)
If you choose `turnstile` as the CAPTCHA type, our blade directive and validation facade will automatically hook into Cloudflare's APIs. Add your site/secret keys inside the `.env`:

```env
EASY_CAPTCHA_TYPE=turnstile
EASY_CAPTCHA_TURNSTILE_SITE_KEY=your-site-key-here
EASY_CAPTCHA_TURNSTILE_SECRET_KEY=your-secret-key-here
```

## Usage

### Displaying the CAPTCHA image
In your Blade form, you can render an image tag manually:

```blade
@easyCaptcha
```

This simple blade directive handles showing the `<img />` and attaching a neat `[Reload]` button next to it!

Or you can use the Facade manually if you need more control:

```blade
{!! \Souravmsh\EasyCaptcha\Facades\EasyCaptcha::img(['class' => 'my-captcha-class']) !!}
```

### Validating the CAPTCHA

Once the form is submitted, validate the user's input:

```php
use Illuminate\Http\Request;
use Souravmsh\EasyCaptcha\Rules\Captcha;

public function submit(Request $request) {
    // Option 1: String rule (Standard)
    $request->validate([
        'captcha' => 'required|easyCaptcha'
    ]);

    // Option 2: Class-based rule (More robust)
    $request->validate([
        'captcha' => ['required', new Captcha]
    ]);

    // Option 3: Alias rule (More robust)
    $request->validate([
        'captcha' => 'required|captcha'
    ]);

    // Option 4: Alias rule (More robust)
    $request->validate([
        'captcha' => 'required|easy_captcha'
    ]);

    // Success! 
    return "Valid CAPTCHA!";
}
```

## Support

Laravel versions 7, 8, 9, 10, 11, 12, 13 are fully supported.
PHP 7.2.5+ & 8.0+ are required along with `ext-gd`.
