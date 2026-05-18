# Laravel Blade Ally 🛡️

> **Static Accessibility Analyzer for Laravel Blade & Livewire Templates**  
> Catch WCAG 2.2 AA violations in your PHP source code before a single request is served.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/malikad778/laravel-blade-ally.svg)](https://packagist.org/packages/malikad778/laravel-blade-ally)
[![Tests](https://github.com/malikad778/blade-access/actions/workflows/tests.yml/badge.svg)](https://github.com/malikad778/blade-access/actions/workflows/tests.yml)
[![PHP Version](https://img.shields.io/badge/PHP-8.2%2B-blue)](https://php.net)
[![Laravel Version](https://img.shields.io/badge/Laravel-10%2C%2011%2C%2012-red)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![EAA Compliant](https://img.shields.io/badge/EAA-2025%20Ready-blueviolet)](https://ec.europa.eu/accessibility)

---

## Why laravel-blade-ally Exists

The **European Accessibility Act (EAA)** came into force in June 2025. WCAG AA compliance is now a legal requirement for public-facing web applications across the EU.

Existing tools like **axe-core**, **Lighthouse**, and **WAVE** run in the browser at runtime—after your code has been deployed. They catch nothing in CI. They cannot easily analyze dynamic Blade conditionals, Livewire component trees, or slot-rendered layouts, and they require a running server.

**laravel-blade-ally** is the missing layer: a static analysis engine that parses your Blade templates and Livewire components as source code, detects WCAG violations before compilation, and integrates into your CI/CD pipeline—acting just like PHPStan but for your frontend accessibility.

## 🚀 Installation

You can install the package via composer (typically as a development dependency):

```bash
composer require malikad778/laravel-blade-ally --dev
```

You can publish the configuration file using:

```bash
php artisan ally:init
```
This will publish the `blade-ally.php` config file to your `config/` directory.

## 🛠️ Usage

Run the static analyzer across your entire `resources/views` and `app/Livewire` directories:

```bash
php artisan ally:analyze
```

### Options

- **Specify paths:** `php artisan ally:analyze resources/views/components app/Livewire`
- **Change output format:** `php artisan ally:analyze --format=json` (Available formats: `terminal`, `json`, `html`, `checkstyle`, `github`, `sarif`, `junit`)
- **Filter by severity:** `php artisan ally:analyze --severity=error`

### Understand a Rule

If you want to know why a specific rule failed or how to fix it:

```bash
php artisan ally:explain img-missing-alt
```

### Working with Baselines

Just like PHPStan, you can create a baseline to ignore existing legacy violations and only enforce rules on new code:

```bash
php artisan ally:baseline
```
Subsequent runs of `ally:analyze` will automatically ignore the violations recorded in the baseline file.

## ✨ Feature Overview

### Core Engine
- **Full Blade Parser:** Understands `@if`, `@foreach`, `@include`, `@extends`, `@yield`, `<x-components>`, and `<x-slot>` layouts.
- **Smart Livewire Analyzer:** Understands `wire:click`, `wire:loading`, `wire:navigate`, and correlates Livewire PHP class logic with the component's Blade view.
- **Alpine.js Aware:** Respects `x-on:click`, `x-show`, and dynamically bound Alpine attributes.
- **CI/CD Ready:** Returns hard exit codes on failures. Native support for GitHub Annotations and SARIF (for GitHub Code Scanning security tabs).

### Complete WCAG Coverage (73 Rules Across 13 Categories)

The engine currently validates exactly 73 distinct criteria, including:

- **Images & Media (SC 1.1.1, 1.2.x):** Enforces meaningful `alt` text, prevents redundant filenames in alts, enforces `<svg>` titles, catches `div` backgrounds used as generic images, and checks for `<video>` captions.
- **Forms (SC 1.3.1, 3.3.2):** Validates implicit and explicit `<label>` connections. Ensures required fields have correct `aria-required` tags, and input validation is properly linked via `aria-describedby` or `role="alert"`.
- **Buttons & Links (SC 2.4.4, 4.1.2):** Catches empty links, generic "click here" text, Javascript `href` voids, and `<div role="button">` missing keyboard tabindexes.
- **Tables & Structure (SC 1.3.1):** Enforces correct `<th>` scopes, catches skipped heading levels (e.g., `h2` to `h4`), missing `<main>` landmarks, and duplicate `<h1>` tags.
- **Modals & Dialogs (SC 4.1.2):** Enforces `role="dialog"`, trapped focus management, and `@keydown.escape` handlers.
- **ARIA Verification (SC 4.1.2):** Prevents impossible ARIA roles, validates parent/child ARIA associations (e.g. `role="rowheader"` must be inside a row container), and prevents `aria-hidden` on focusable elements.
- **Livewire Specific:**
  - `livewire-poll-no-pause`: Enforces `wire:poll.visible` for performance and screen-reader sanity.
  - `wire-loading-aria-live`: Ensures visual `wire:loading` states are announced to screen readers.
  - `livewire-dispatch-focus`: Tracks missing focus management when Livewire dispatches DOM-altering events.

## ⚙️ Configuration

Your `config/blade-ally.php` allows fine-grained control over the analysis:

```php
return [
    'paths' => [
        resource_path('views'),
        app_path('Livewire'),
    ],
    
    // Ignore specific files or directories
    'exclude_paths' => [
        resource_path('views/vendor'),
    ],

    // Toggle individual rules
    'rules' => [
        'img-alt-filename' => false, // Disable specific rule
        'heading-multiple-h1' => true,
    ],
];
```

## 🔄 Continuous Integration

**laravel-blade-ally** is designed for automated checks.

### GitHub Actions Example

```yaml
name: Accessibility Analysis
on: [push, pull_request]

jobs:
  blade-ally:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - run: composer install --prefer-dist --no-progress
      - name: Run Blade Ally
        run: php artisan ally:analyze --format=github
```
*Using `--format=github` will place inline annotations directly on your Pull Request files!*

## 🧪 Testing

We use Pest/PHPUnit to ensure parser integrity and rule accuracy:

```bash
composer test
```
*(Tests cover HTML implicit semantics, Blade tokenization, Livewire bindings, and AST traversal).*

## 📄 License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.