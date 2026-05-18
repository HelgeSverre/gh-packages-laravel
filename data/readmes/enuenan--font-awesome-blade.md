# Font Awesome Blade Icons for Laravel

A modern, developer-friendly Laravel package that lets you use **Font Awesome icons as Blade components** with zero boilerplate.

```blade
<x-fa icon="user" />
<x-fa icon="github" style="brands" />
<x-fa icon="spinner" spin size="2x" />
```

---

## ✨ Features

- ✅ Blade component syntax
- ✅ Webfonts mode (classic `<i>` rendering)
- ✅ SVG mode (inline SVG rendering)
- ✅ Automatic CSS injection
- ✅ Configurable allowed styles
- ✅ Accessibility-friendly by default
- ✅ Optional local SVG download command

---

# 📦 Installation

```bash
composer require enuenan/font-awesome-blade
```

---

# ⚙️ Configuration

Publish config:

```bash
php artisan vendor:publish --tag="font-awesome-blade-config"
```

This creates:

```
config/font-awesome-blade-user.php
```

---

# 🛠 Configuration Options

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Rendering Mode
    |--------------------------------------------------------------------------
    | webfonts = classic <i class="fa-...">
    | svg      = inline SVG rendering
    */
    'mode' => 'webfonts',

    /*
    |--------------------------------------------------------------------------
    | Defaults
    |--------------------------------------------------------------------------
    */
    'default_style' => 'solid',
    'default_family' => 'classic',

    /*
    |--------------------------------------------------------------------------
    | Allowed Styles
    |--------------------------------------------------------------------------
    */
    'allowed_styles' => [
        'solid',
        'regular',
        'brands',
    ],

    /*
    |--------------------------------------------------------------------------
    | Allowed Families
    |--------------------------------------------------------------------------
    */
    'allowed_families' => [
        'classic',
        'sharp',
    ],

    /*
    |--------------------------------------------------------------------------
    | Auto Inject CSS
    |--------------------------------------------------------------------------
    */
    'auto_inject' => true,

    /*
    |--------------------------------------------------------------------------
    | SVG Mode Settings
    |--------------------------------------------------------------------------
    */
    'svg' => [
        'disk' => 'local',
        'path' => 'vendor/font-awesome-blade/svgs',
        'cache' => true,

        'download' => [
            'ref' => '7.x',
            'styles' => ['brands', 'solid', 'regular'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Premium (Reserved)
    |--------------------------------------------------------------------------
    */
    'premium' => [
        'enabled' => false,
        'license_key' => env('FA_BLADE_LICENSE_KEY'),
        'allow_pro_styles' => false,
    ],
];
```

---

# 🚀 Usage

## Basic Icon

```blade
<x-fa icon="user" />
```

Renders:

```html
<i class="fa-solid fa-user" aria-hidden="true"></i>
```

---

## Styles

```blade
<x-fa icon="user" style="regular" />
<x-fa icon="github" style="brands" />
```

If a style is not allowed, it falls back to `default_style`.

---

# 🎛 Modifiers

### Spin

```blade
<x-fa icon="spinner" spin />
```

### Pulse

```blade
<x-fa icon="spinner" pulse />
```

### Fixed Width

```blade
<x-fa icon="user" fw />
```

### Sizes

```blade
<x-fa icon="user" size="lg" />
<x-fa icon="user" size="2x" />
<x-fa icon="user" size="5x" />
```

### Rotate

```blade
<x-fa icon="arrow-up" rotate="90" />
```

### Flip

```blade
<x-fa icon="arrow-right" flip="horizontal" />
<x-fa icon="arrow-right" flip="vertical" />
<x-fa icon="arrow-right" flip="both" />
```

### Animations

```blade
<x-fa icon="heart" beat />
<x-fa icon="circle" fade />
<x-fa icon="bell" shake />
<x-fa icon="basketball" bounce />
```

---

# 🎨 Custom Classes

```blade
<x-fa icon="user" class="text-xl text-blue-600" />
```

---

# ♿ Accessibility

If no label is provided:

```html
aria-hidden="true"
```

If you provide one:

```blade
<x-fa icon="user" aria-label="User profile" />
```

It renders:

```html
<i class="fa-solid fa-user" role="img" aria-label="User profile"></i>
```

---

# 🖼 SVG Mode (Inline Rendering)

You can switch to SVG mode globally:

```php
'mode' => 'svg',
```

Or per icon:

```blade
<x-fa icon="user" mode="svg" />
```

SVG mode renders:

```html
<svg ...>...</svg>
```

instead of `<i>` tags.

---

# 📥 Download SVG Icons

To use SVG mode, you need SVG files stored locally.

Run:

```bash
php artisan fa:download-svgs
```

This will download official Font Awesome SVGs from:

https://github.com/FortAwesome/Font-Awesome

By default it downloads:

- brands
- solid
- regular

They are stored at:

```
storage/app/vendor/font-awesome-blade/svgs/
```

---

## Advanced Download Options

Download specific styles:

```bash
php artisan fa:download-svgs --styles=solid,regular
```

Force overwrite existing files:

```bash
php artisan fa:download-svgs --force
```

Download a specific branch or tag:

```bash
php artisan fa:download-svgs --ref=7.x
```

---

# ⚡ Automatic CSS Injection

When `auto_inject` is enabled:

- Required Font Awesome CSS files are automatically injected into `<head>`
- Only styles listed in `allowed_styles` are loaded
- No manual CDN setup needed

Disable it:

```php
'auto_inject' => false,
```

---

# 🧠 Programmatic Usage

You can generate classes or HTML in PHP:

```php
use Enuenan\FontAwesomeBlade\FontAwesomeBlade;

$fa = app(FontAwesomeBlade::class);

$classes = $fa->classes('user', 'solid');

$html = $fa->tag('check', [
    'class' => 'text-green-600',
    'aria-label' => 'Success',
]);
```

Useful for:

- Mailables
- Notifications
- Admin panel builders
- API responses

---

# 🧪 Testing

Run:

```bash
composer test
```

or

```bash
vendor/bin/pest
```

---


The architecture is designed to support gated features cleanly.

---

# 📄 License

MIT License © Enuenan
