# Laravel SVG Sanitizer

A comprehensive Laravel package for sanitizing SVG files and SVG code to prevent XSS (Cross-Site Scripting) attacks.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/your-vendor/laravel-svg-sanitizer.svg)](https://packagist.org/packages/your-vendor/laravel-svg-sanitizer)
[![License](https://img.shields.io/packagist/l/your-vendor/laravel-svg-sanitizer.svg)](https://packagist.org/packages/your-vendor/laravel-svg-sanitizer)

## Features

- ✅ **SVG File Validation** - Validate uploaded SVG files for malicious content
- ✅ **SVG Code Validation** - Validate SVG code from text inputs/textareas
- ✅ **SVG File Sanitization** - Clean uploaded SVG files before storing
- ✅ **SVG Code Sanitization** - Clean SVG code strings before saving to database
- ✅ **Configurable** - Customize allowed tags, attributes, and dangerous patterns
- ✅ **Middleware** - Add security headers when serving SVG files
- ✅ **Laravel 10 & 11 Support**

## Installation

### Step 1: Install via Composer

```bash
composer require timahfouz/svg-sanitizer
```

### Step 2: Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=svg-sanitizer-config
```

This will create `config/svg-sanitizer.php` where you can customize:

- Allowed SVG tags
- Allowed SVG attributes
- Dangerous patterns to detect
- Max file size and code length

### Step 3: Register Middleware (Optional)

Add to `bootstrap/app.php` (Laravel 11):

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'svg.headers' => \Timahfouz\SvgSanitizer\Middleware\SecureSvgHeaders::class,
    ]);
})
```

Or in `app/Http/Kernel.php` (Laravel 10):

```php
protected $middlewareAliases = [
    // ...
    'svg.headers' => \Timahfouz\SvgSanitizer\Middleware\SecureSvgHeaders::class,
];
```

## Usage

### Validation Rules

#### For SVG File Uploads

Use `svg_file_safe` rule or the `SvgFileSafe` class:

```php
use Timahfouz\SvgSanitizer\Rules\SvgFileSafe;

// Using string rule
$request->validate([
    'icon' => 'required|file|mimes:svg|svg_file_safe',
]);

// Using rule class
$request->validate([
    'icon' => ['required', 'file', 'mimes:svg', new SvgFileSafe()],
]);
```

#### For SVG Code (Textarea Input)

Use `svg_code_safe` rule or the `SvgCodeSafe` class:

```php
use Timahfouz\SvgSanitizer\Rules\SvgCodeSafe;

// Using string rule
$request->validate([
    'icon' => 'nullable|string|max:10000|svg_code_safe',
]);

// Using rule class
$request->validate([
    'icon' => ['nullable', 'string', 'max:10000', new SvgCodeSafe()],
]);
```

### Sanitization

#### Using the Facade

```php
use Timahfouz\SvgSanitizer\Facades\SvgSanitizer;

// Sanitize an uploaded file
$cleanSvg = SvgSanitizer::sanitizeFile($request->file('icon'));

// Sanitize SVG code from textarea
$cleanSvg = SvgSanitizer::sanitizeCode($request->input('icon'));

// Check if file is safe (without sanitizing)
if (SvgSanitizer::isFileSafe($request->file('icon'))) {
    // File is safe
}

// Check if code is safe (without sanitizing)
if (SvgSanitizer::isCodeSafe($request->input('icon'))) {
    // Code is safe
}
```

#### Using Dependency Injection

```php
use Timahfouz\SvgSanitizer\Services\SvgFileSanitizer;
use Timahfouz\SvgSanitizer\Services\SvgCodeSanitizer;

class MyController extends Controller
{
    public function __construct(
        protected SvgFileSanitizer $fileSanitizer,
        protected SvgCodeSanitizer $codeSanitizer
    ) {}

    public function store(Request $request)
    {
        // Sanitize file upload
        if ($request->hasFile('icon')) {
            $cleanSvg = $this->fileSanitizer->sanitize($request->file('icon'));
  
            if ($cleanSvg === null) {
                return back()->withErrors(['icon' => 'Invalid or unsafe SVG file.']);
            }
  
            // Store the sanitized SVG
            Storage::put('icons/icon.svg', $cleanSvg);
        }

        // Sanitize code input
        $iconCode = $this->codeSanitizer->sanitize($request->input('icon'));
  
        if ($iconCode === null && $request->filled('icon')) {
            return back()->withErrors(['icon' => 'Invalid or unsafe SVG code.']);
        }

        // Save to database
        Category::create([
            'name' => $request->input('name'),
            'icon' => $iconCode,
        ]);
    }
}
```

### Complete Controller Example

```php
<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Timahfouz\SvgSanitizer\Facades\SvgSanitizer;
use Timahfouz\SvgSanitizer\Rules\SvgCodeSafe;
use Timahfouz\SvgSanitizer\Rules\SvgFileSafe;

class CategoryController extends Controller
{
    /**
     * Store with SVG code from textarea.
     */
    public function storeWithCode(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => ['nullable', 'string', 'max:10000', new SvgCodeSafe()],
        ]);

        // Sanitize before storing
        if (!empty($validated['icon'])) {
            $validated['icon'] = SvgSanitizer::sanitizeCode($validated['icon']);
  
            if ($validated['icon'] === null) {
                return back()
                    ->withErrors(['icon' => 'The icon contains unsafe content.'])
                    ->withInput();
            }
        }

        Category::create($validated);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Store with SVG file upload.
     */
    public function storeWithFile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'icon' => ['nullable', 'file', 'mimes:svg,png,jpg', 'max:2048', new SvgFileSafe()],
        ]);

        $iconPath = null;

        if ($request->hasFile('icon')) {
            $file = $request->file('icon');
  
            if (strtolower($file->getClientOriginalExtension()) === 'svg') {
                // Sanitize SVG file
                $cleanSvg = SvgSanitizer::sanitizeFile($file);
  
                if ($cleanSvg === null) {
                    return back()
                        ->withErrors(['icon' => 'The SVG file contains unsafe content.'])
                        ->withInput();
                }
  
                // Store sanitized content
                $filename = uniqid() . '.svg';
                Storage::disk('public')->put("icons/{$filename}", $cleanSvg);
                $iconPath = "icons/{$filename}";
            } else {
                // Store other image types normally
                $iconPath = $file->store('icons', 'public');
            }
        }

        Category::create([
            'name' => $request->input('name'),
            'icon' => $iconPath,
        ]);

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }
}
```

### Middleware for Security Headers

Apply to routes serving SVG files:

```php
Route::get('/storage/{path}', function ($path) {
    return Storage::response($path);
})->where('path', '.*\.svg')->middleware('svg.headers');
```

## What Gets Blocked

The sanitizer blocks common XSS attack vectors including:

| Attack Vector       | Example                                                 |
| ------------------- | ------------------------------------------------------- |
| Script tags         | `<script>alert(1)</script>`                           |
| Event handlers      | `<svg onload="alert(1)">`                             |
| JavaScript URLs     | `<a href="javascript:alert(1)">`                      |
| Foreign objects     | `<foreignObject><html>...</html></foreignObject>`     |
| External references | `<use xlink:href="http://evil.com/xss.svg">`          |
| Data URLs           | `<a href="data:text/html,<script>alert(1)</script>">` |
| CSS expressions     | `style="behavior:url(...);"`                          |

## Configuration

After publishing the config file, you can customize:

```php
// config/svg-sanitizer.php

return [
    // Elements to completely remove
    'dangerous_elements' => [
        'script', 'foreignObject', 'iframe', ...
    ],

    // Allowed SVG tags (whitelist)
    'allowed_tags' => [
        'svg', 'g', 'path', 'circle', 'rect', ...
    ],

    // Allowed attributes (whitelist)
    'allowed_attributes' => [
        'id', 'class', 'fill', 'stroke', 'd', ...
    ],

    // Max file size in bytes (default: 2MB)
    'max_file_size' => 2097152,

    // Max code length in characters (default: 100KB)
    'max_code_length' => 102400,
];
```

## Frontend Safety

Even with backend sanitization, always sanitize when rendering SVG in the frontend:

### Using DOMPurify (Recommended)

```bash
npm install dompurify
```

```vue
<template>
    <div v-html="sanitizedSvg"></div>
</template>

<script setup>
import { computed } from 'vue'
import DOMPurify from 'dompurify'

const props = defineProps({ svg: String })

const sanitizedSvg = computed(() => {
    if (!props.svg) return ''
    return DOMPurify.sanitize(props.svg, {
        USE_PROFILES: { svg: true, svgFilters: true }
    })
})
</script>
```

## Testing

```bash
composer test
```

## Security

If you discover any security-related issues, please email tarek.mahfouz2011@gmail.com instead of using the issue tracker.

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
