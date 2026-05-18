# Laravel Math CAPTCHA

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Tests](https://github.com/mrtolouei/laravel-math-captcha/actions/workflows/tests.yml/badge.svg)](https://github.com/mrtolouei/laravel-math-captcha/actions/workflows/tests.yml)
[![Latest Stable Version](https://poser.pugx.org/mrtolouei/laravel-math-captcha/v/stable)](https://packagist.org/packages/mrtolouei/laravel-math-captcha)


A **stateless, lightweight math-based CAPTCHA package for Laravel** that generates a simple arithmetic challenge as an image and verifies it via signed payloads.  
No database, cache, or filesystem is required.

---
## Table of contents
1. [Features](#features)
2. [Requirements](#requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Example Controller](#example-controller)
7. [Testing](#testing)
8. [Advanced Usage](#advanced-usage)
9. [Security Notes](#security-notes)
10. [Contributions](#contributions)
11. [License](#license)
---
## Features
- Stateless: no DB, cache, or filesystem dependency.
- Uses **Laravel APP_KEY** for secure HMAC signing.
- Configurable math range and image appearance.
- Simple **one-time-use CAPTCHA** (answer embedded in signed hash).
- Ready for **Laravel 10+**.
- Fully testable with **PHPUnit**.

---
## Requirements
- PHP ≥ 8.1
- Laravel ≥ 10
- GD extension enabled (`php-gd`)
- Composer

---
## Installation
Install via Composer:
```bash
  composer require mrtolouei/laravel-math-captcha
```
Publish configuration file:
```bash
  php artisan vendor:publish --provider="Mrtolouei\MatchCaptcha\CaptchaServiceProvider" --tag="config"
```
This will create:
```text
config/captcha.php
```
---
## Configuration
**config/captcha.php** contains two main sections:
### Image
```php
'image' => [
    'width'  => 160,           // Width in pixels
    'height' => 60,            // Height in pixels
    'font'   => 5,             // GD built-in font (1-5)
    'bg'     => [245,247,250], // Background color RGB
    'fg'     => [30,30,30],    // Foreground/text color RGB
],
```
### Math Expression
```php
'math' => [
    'min' => env('CAPTCHA_MATH_MIN', 1),  // Minimum number
    'max' => env('CAPTCHA_MATH_MAX', 9),  // Maximum number
],
```
- Increasing the `min`/`max` range makes CAPTCHA harder.
- You can also use `.env` for environment-specific values.

---
## Usage
### Generating a CAPTCHA
```php
use Mrtolouei\MatchCaptcha\CaptchaManager;

$manager = new CaptchaManager();

$result = $manager->generate();

/*
$result is an instance of CaptchaGenerateResult:

$result->image // Base64-encoded PNG
$result->hash  // Signed payload with the answer
*/
```
### Display in Blade
```html
<img src="{{ $captcha->image }}" alt="CAPTCHA">
<input type="text" name="captcha_answer">
<input type="hidden" name="captcha_hash" value="{{ $captcha->hash }}">
```
### Verifying CAPTCHA
```php
$valid = $manager->verify($request->input('captcha_answer'), $request->input('captcha_hash'));

if ($valid) {
    // CAPTCHA passed
} else {
    // CAPTCHA failed
}
```
⚠ Note: This CAPTCHA is stateless, so there is no anti-replay mechanism.
Each CAPTCHA is single-use in logic only; after verification, the hash can be reused unless you implement additional storage/cache.

---
## Example Controller
```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Mrtolouei\MatchCaptcha\CaptchaManager;

class ContactController extends Controller
{
    protected CaptchaManager $captcha;

    public function __construct(CaptchaManager $captcha)
    {
        $this->captcha = $captcha;
    }

    public function showForm()
    {
        $captcha = $this->captcha->generate();
        return view('contact.form', compact('captcha'));
    }

    public function submit(Request $request)
    {
        $request->validate([
            'captcha_answer' => 'required',
            'captcha_hash'   => 'required',
        ]);

        if (! $this->captcha->verify($request->captcha_answer, $request->captcha_hash)) {
            return back()->withErrors(['captcha_answer' => 'CAPTCHA verification failed.']);
        }

        // Process the form...
    }
}
```

---
## Testing
This package uses PHPUnit 10 and Orchestra Testbench for Laravel integration.

Run tests:
```bash
    composer install
    vendor/bin/phpunit
```

### Unit Tests Covered
- CAPTCHA generation returns valid image and hash.
- Correct answers pass verification.
- Wrong answers fail verification.
- Tampered hashes fail verification.
- Math expression respects configured `min`/`max`.

---
## Advanced Usage
- Customize image width, height, font, and colors via config.
- Adjust math difficulty by setting `.env` variables:

```text
CAPTCHA_MATH_MIN=1
CAPTCHA_MATH_MAX=20
```
- Extend `CaptchaManager` to implement custom operators (e.g., multiplication).

---
## Security Notes
- The security of this CAPTCHA relies on Laravel `APP_KEY` secrecy.
- It is stateless: you may want to implement replay prevention using cache or DB if required.
- Increasing math range improves bot-resistance but may reduce readability.

---
## Contributions
PRs, issues, stars are welcome!

- For bugs: open a GitHub issue.
- For features: fork and submit a PR.
- Follow PSR-12 coding style.

---
## License
This package is open-sourced software licensed under the [MIT license](LICENSE).