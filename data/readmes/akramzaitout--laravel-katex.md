# Laravel KaTeX

<p align="center">
  <img src="./assets/logo.png" alt="Laravel KaTeX Package Logo" width="200" />
</p>

<p align="center">
  <a href="https://packagist.org/packages/akram-zaitout/laravel-katex">
    <img src="https://img.shields.io/packagist/v/akram-zaitout/laravel-katex?style=flat-square"
         alt="Latest Version on Packagist">
  </a>

  <a href="https://packagist.org/packages/akram-zaitout/laravel-katex">
    <img src="https://img.shields.io/packagist/dt/akram-zaitout/laravel-katex?style=flat-square"
         alt="Total Downloads">
  </a>

  <a href="https://packagist.org/packages/akram-zaitout/laravel-katex">
    <img src="https://img.shields.io/packagist/l/akram-zaitout/laravel-katex?style=flat-square"
         alt="License">
  </a>
</p>


A comprehensive, production-ready Laravel package for rendering beautiful mathematical expressions using [KaTeX](https://katex.org/). Native PHP implementation with dependency injection, following Laravel best practices.

## ✨ Features

- � **Flexible & Intuitive** - Use it your way with Blade directives, components, or our Facade—whatever fits your coding style.
- 🔒 **Secure by Design** - We handle XSS protection and validation automatically so you can render user content with peace of mind.
- ⚙️ **Fully Customizable** - Tweak delimiters, error handling, and macros globally or on the fly to match your specific needs.
- 🚀 **Blazing Fast** - Optimized rendering ensures your mathematical expressions load instantly without slowing down your app.
- 🧪 **Production Ready** - Built with a comprehensive test suite and strict typing to ensure reliability in mission-critical applications.

## 📋 Requirements

- PHP 7.2 or higher
- Laravel 6.0 or higher
- ext-json

## 📦 Installation

Install the package via Composer:

```bash
composer require akram-zaitout/laravel-katex
```

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=katex-config
```

This creates `config/katex.php` where you can customize all aspects of the package.

### Publish Views (Optional)

```bash
php artisan vendor:publish --tag=katex-views
```

## 🚀 Quick Start

### Basic Setup

In your Blade layout file (e.g., `resources/views/layouts/app.blade.php`):

```blade
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>My Application</title>
    
    @katexStyles
</head>
<body>
    @yield('content')
    
    @katexScripts
</body>
</html>
```

### Using Blade Directives

```blade
{{-- Inline math --}}
<p>The quadratic formula is @katex('x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}')</p>

{{-- Display (block) math --}}
@katexBlock('\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}')

{{-- With variables --}}
@php
    $equation = 'E = mc^2';
@endphp
<p>Einstein's equation: @katex($equation)</p>
```

## 📖 Usage

### 1. Blade Directives

#### @katexStyles

Renders the KaTeX CSS stylesheet:

```blade
@katexStyles
```

#### @katexScripts

Renders KaTeX JavaScript with optional configuration:

```blade
{{-- Default options --}}
@katexScripts

{{-- Custom options --}}
@katexScripts([
    'delimiters' => [
        ['left' => '$', 'right' => '$', 'display' => false],
        ['left' => '$$', 'right' => '$$', 'display' => true],
    ],
    'throwOnError' => false,
    'macros' => [
        '\\RR' => '\\mathbb{R}',
    ]
])
```

#### @katex

Renders inline mathematical expressions:

```blade
@katex('a^2 + b^2 = c^2')
```

#### @katexBlock

Renders display mode (block) mathematical expressions:

```blade
@katexBlock('\sum_{i=1}^{n} i = \frac{n(n+1)}{2}')
```

### 2. Facade

Use the `Katex` facade for programmatic access:

```php
use AkramZaitout\LaravelKatex\Facades\Katex;

// Generate stylesheet
$styles = Katex::generateStylesheet();

// Generate scripts
$scripts = Katex::generateScripts(['throwOnError' => false]);

// Wrap expressions
$inline = Katex::wrapInline('x^2');
$display = Katex::wrapDisplay('\int_0^\infty');

// Get configuration
$version = Katex::getConfig('version');
```

### 3. Helper Functions

```php
// Get renderer instance
$renderer = katex();

// Render inline math
$inline = katex_inline('a^2 + b^2 = c^2');

// Render display math
$display = katex_display('\sum_{i=1}^{n} i');

// Generate assets
$styles = katex_styles();
$scripts = katex_scripts(['throwOnError' => false]);
```

### 4. Blade Component

```blade
<x-katex::math 
    expression="x^2 + y^2 = r^2" 
    display="false"
    class="my-math"
    id="pythagorean"
/>
```

### 5. Service Injection

```php
use AkramZaitout\LaravelKatex\Services\KatexRenderer;

class MathController extends Controller
{
    public function __construct(
        protected KatexRenderer $katex
    ) {}
    
    public function show()
    {
        $expression = $this->katex->wrapInline('E=mc^2');
        
        return view('math.show', compact('expression'));
    }
}
```

## ⚙️ Configuration

### Environment Variables

Set these in your `.env` file:

```env
KATEX_VERSION=0.16.28
KATEX_CDN=https://cdn.jsdelivr.net/npm/katex
KATEX_CSS_INTEGRITY=sha384-Wsr4Nh3yrvMf2KCebJchRJoVo1gTU6kcP05uRSh5NV3sj9+a8IomuJoQzf3sMq4T
KATEX_JS_INTEGRITY=sha384-+W9OcrYK2/bD7BmUAk+xeFAyKp0QjyRQUCxeU31dfyTt/FrPsUgaBTLLkVf33qWt
KATEX_AUTO_RENDER_INTEGRITY=sha384-hCXGrW6PitJEwbkoStFjeJxv+fSOOQKOPbJxSfM6G5sWZjAyWhXiTIIAmQqnlLlh
```

### Configuration File

Publish and edit `config/katex.php`:

```php
return [
    'version' => '0.16.28',
    'cdn' => 'https://cdn.jsdelivr.net/npm/katex',
    
    'options' => [
        'delimiters' => [
            ['left' => '$$', 'right' => '$$', 'display' => true],
            ['left' => '\\(', 'right' => '\\)', 'display' => false],
        ],
        'throwOnError' => false,
        'errorColor' => '#cc0000',
        'macros' => [
            '\\RR' => '\\mathbb{R}',
            '\\NN' => '\\mathbb{N}',
        ],
    ],
];
```

## 🌍 Local Asset Management (Offline Support)

This package supports downloading KaTeX assets to your local application, allowing you to run without external CDN dependencies. This is perfect for offline environments, intranets, or strict privacy compliance/GDPR.

### 1. Download Assets
Run the artisan command to download CSS, JS, and font files to `public/vendor/katex`:

```bash
php artisan katex:download
```

You can also specify a specific version:

```bash
php artisan katex:download --version=0.16.0
```

### 2. Enable Local Assets
Update your `.env` file to tell the package to use the local files:

```env
KATEX_USE_LOCAL_ASSETS=true
```

Or configure it in `config/katex.php`:

```php
'use_local_assets' => true,
```

## 🎓 Examples



```blade
<article class="lesson">
    <h1>Calculus Fundamentals</h1>
    
    <p>The derivative of @katex('x^n') is @katex('nx^{n-1}').</p>
    
    <h2>Example</h2>
    @katexBlock('\frac{d}{dx}(x^3) = 3x^2')
    
    <h2>The Power Rule</h2>
    @katexBlock('\frac{d}{dx}(x^n) = nx^{n-1}')
</article>
```



## 🔒 Security

### XSS Protection

All user input is automatically escaped using Laravel's `e()` helper:

```blade
{{-- Safe: HTML is escaped --}}
@katex($userInput)
```

### Subresource Integrity

SRI hashes ensure CDN files haven't been tampered with:

```php
'css_integrity' => 'sha384-Wsr4Nh3yrvMf2KCebJchRJoVo1gTU6kcP05uRSh5NV3sj9+a8IomuJoQzf3sMq4T',
```

### Trust Settings

By default, `\url` and `\href` commands are disabled. Enable only if needed:

```php
'options' => [
    'trust' => false, // Keep disabled for user-generated content
],
```

## 📝 License

This package is open-sourced software licensed under the [MIT license](LICENSE.md).

---

<p align="center">Made with ❤️ by <a href="https://github.com/akramzaitout">Akram Zaitout</a></p>
