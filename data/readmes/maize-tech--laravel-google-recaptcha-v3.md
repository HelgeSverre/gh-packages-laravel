# Laravel Google reCAPTCHA v3

[![Latest Version on Packagist](https://img.shields.io/packagist/v/maize-tech/laravel-google-recaptcha-v3.svg?style=flat-square)](https://packagist.org/packages/maize-tech/laravel-google-recaptcha-v3)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/maize-tech/laravel-google-recaptcha-v3/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/maize-tech/laravel-google-recaptcha-v3/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/maize-tech/laravel-google-recaptcha-v3/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/maize-tech/laravel-google-recaptcha-v3/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/maize-tech/laravel-google-recaptcha-v3.svg?style=flat-square)](https://packagist.org/packages/maize-tech/laravel-google-recaptcha-v3)

A Laravel package that provides a simple and elegant integration of Google reCAPTCHA v3 for your Laravel applications. This package includes a Blade directive for easy frontend integration and a validation rule for backend verification with customizable score thresholds.

## Installation

You can install the package via composer:

```bash
composer require maize-tech/laravel-google-recaptcha-v3
```

You can install and configure the package with:

```bash
php artisan google-recaptcha-v3:install
```

This command will publish the configuration file.

This is the contents of the published config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Enabled
    |--------------------------------------------------------------------------
    |
    | This option controls whether Google reCAPTCHA v3 is enabled.
    | When disabled, the validation will be skipped.
    |
    */
    'enabled' => env('GOOGLE_RECAPTCHA_V3_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Site Key
    |--------------------------------------------------------------------------
    |
    | Your Google reCAPTCHA v3 site key.
    | You can get this from https://www.google.com/recaptcha/admin
    |
    */
    'site_key' => env('GOOGLE_RECAPTCHA_V3_SITE_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Secret Key
    |--------------------------------------------------------------------------
    |
    | Your Google reCAPTCHA v3 secret key.
    | You can get this from https://www.google.com/recaptcha/admin
    |
    */
    'secret_key' => env('GOOGLE_RECAPTCHA_V3_SECRET_KEY'),

    /*
    |--------------------------------------------------------------------------
    | Score Threshold
    |--------------------------------------------------------------------------
    |
    | The minimum score threshold for the reCAPTCHA validation.
    | Google reCAPTCHA v3 returns a score (1.0 is very likely a good interaction,
    | 0.0 is very likely a bot). Default is 0.5.
    |
    */
    'score_threshold' => env('GOOGLE_RECAPTCHA_V3_SCORE_THRESHOLD', 0.5),

    /*
    |--------------------------------------------------------------------------
    | Badge
    |--------------------------------------------------------------------------
    |
    | The default badge position for the reCAPTCHA badge.
    | Available options: 'bottomright', 'bottomleft', 'inline', 'hidden'.
    | Default is 'bottomright'.
    |
    */
    'badge' => env('GOOGLE_RECAPTCHA_V3_BADGE', 'bottomright'),
];
```

## Configuration

After installing the package, add the following environment variables to your `.env` file:

```env
GOOGLE_RECAPTCHA_V3_ENABLED=true
GOOGLE_RECAPTCHA_V3_SITE_KEY=your-site-key-here
GOOGLE_RECAPTCHA_V3_SECRET_KEY=your-secret-key-here
GOOGLE_RECAPTCHA_V3_SCORE_THRESHOLD=0.5
GOOGLE_RECAPTCHA_V3_BADGE=bottomright
```

You can obtain your site key and secret key from the [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin).

## Usage

### Frontend Integration

Add the reCAPTCHA script to your Blade templates using the `@recaptcha` directive:

```blade
@recaptcha
```

You can also customize the badge position by passing one of the available badge positions:

```blade
<!DOCTYPE html>
<html>
<head>
    <title>My Form</title>
</head>
<body>
    <form id="myForm" method="POST" action="/submit">
        @csrf
        <!-- Your form fields -->
        <input type="hidden" name="g-recaptcha-response" id="g-recaptcha-response">
        <button type="submit">Submit</button>
    </form>

    @recaptcha(\Maize\GoogleRecaptchaV3\Enums\Badge::BOTTOMRIGHT)

    <script>
        document.getElementById('myForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const token = await window.recaptcha('submit');
            document.getElementById('g-recaptcha-response').value = token;

            this.submit();
        });
    </script>
</body>
</html>
```

#### Available Badge Positions

- `Badge::INLINE` - Displays the badge inline
- `Badge::BOTTOMLEFT` - Displays the badge at the bottom left
- `Badge::BOTTOMRIGHT` - Displays the badge at the bottom right (recommended)
- `Badge::HIDDEN` - Hides the badge completely

**Important Note about Hidden Badge:**
When using `Badge::HIDDEN`, you must display the reCAPTCHA branding visibly in your user flow. According to [Google's guidelines](https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed), you need to include the following text:

```html
This site is protected by reCAPTCHA and the Google
<a href="https://policies.google.com/privacy">Privacy Policy</a> and
<a href="https://policies.google.com/terms">Terms of Service</a> apply.
```

### Backend Validation

Use the `googleRecaptchaV3` validation rule in your form requests or controllers:

```php
use Illuminate\Support\Facades\Validator;

$validator = Validator::make($request->all(), [
    'name' => 'required|string',
    'email' => 'required|email',
    'g-recaptcha-response' => ['required', 'string', Rule::googleRecaptchaV3()],
]);
```

#### Custom Score Threshold

You can override the default score threshold (configured in `config/google-recaptcha-v3.php`) by passing a custom threshold to the validation rule:

```php
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

$validator = Validator::make($request->all(), [
    'g-recaptcha-response' => ['required', 'string', Rule::googleRecaptchaV3(0.7)],
]);
```

A higher threshold (e.g., 0.7 or 0.8) means stricter validation, while a lower threshold (e.g., 0.3 or 0.4) is more permissive.

### Form Request Example

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContactFormRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'g-recaptcha-response' => ['required', 'string', Rule::googleRecaptchaV3()],
        ];
    }
}
```

### JavaScript Helper

The package automatically provides a global `window.recaptcha()` function that you can use to get the reCAPTCHA token:

```javascript
// Get token with default action 'submit'
const token = await window.recaptcha();

// Get token with custom action
const token = await window.recaptcha('login');
```

This function returns a Promise that resolves to the reCAPTCHA token, or `null` if reCAPTCHA is not available or fails.

### Disabling reCAPTCHA

You can disable reCAPTCHA validation by setting the `enabled` configuration to `false` or by setting the `GOOGLE_RECAPTCHA_V3_ENABLED` environment variable to `false`. This is useful for local development or testing environments.

When disabled:
- The `@recaptcha` directive will not render any scripts
- The validation rule will pass without making any API calls to Google

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/maize-tech/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Enrico De Lazzari](https://github.com/enricodelazzari)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
