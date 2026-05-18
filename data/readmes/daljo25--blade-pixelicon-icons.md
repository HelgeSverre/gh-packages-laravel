# Blade Pixelicon Icons

[![Latest Version on Packagist](https://img.shields.io/packagist/v/daljo25/blade-pixelicon-icons.svg?style=flat-square)](https://packagist.org/packages/daljo25/blade-pixelicon-icons)
[![Total Downloads](https://img.shields.io/packagist/dt/daljo25/blade-pixelicon-icons.svg?style=flat-square)](https://packagist.org/packages/daljo25/blade-pixelicon-icons)
[![License](https://img.shields.io/packagist/l/daljo25/blade-pixelicon-icons.svg?style=flat-square)](LICENSE.md)

Blade UI Kit package for the **Pixel Icon Library by HackerNoon**.

This package provides **450+ SVG icons** ready to use in Laravel Blade using the same developer experience as other Blade UI Kit icon sets.

![Thumbnail](Thumbnail.png)

## ✨ Features

* 450+ Pixel icons included
* Supports **regular, solid, brands & purcats**
* Multiple Blade UI Kit usage styles
* Original SVGs are **not modified**
* Color customization via `fill` / `style`
* Zero runtime dependencies

---

## 📦 Installation

```bash
composer require daljo25/blade-pixelicon-icons
```

---

## ⚙️ Publishing

You may publish the config file and/or the SVG icons if you want to customize them.

### Publish config

```bash
php artisan vendor:publish --tag=blade-pixelicon-icons-config
```

This will publish:

```
config/blade-pixelicon-icons.php
```

---

### Publish SVG icons

```bash
php artisan vendor:publish --tag=blade-pixelicon-icons
```

This will publish all icons to:

```
resources/svg/vendor/blade-pixelicon-icons
```

This is useful if you want to:

* Modify SVG files manually
* Remove icons you don’t use
* Optimize icons
* Override specific icons

---
## Search for icons in the official Pixel Icon Library

You can search for icons in the official Pixel Icon Library by HackerNoon

[https://pixeliconlibrary.com/](https://pixeliconlibrary.com/)
---

## 🚀 Usage

This package follows the Blade UI Kit icon conventions.

You can use **any of the 3 supported syntaxes**.

### 1️⃣ Blade Component

```blade
<x-pixelicon-user />
<x-pixelicon-home />
<x-pixelicon-android />
```

---

### 2️⃣ `@svg` Directive

```blade
@svg('pixelicon-home')
@svg('pixelicon-user')
```

---

### 3️⃣ `svg()` Helper

```blade
{{ svg('pixelicon-android') }}
```

---

## 🎨 Changing Icon Color (IMPORTANT)

Pixelicon SVGs **do not include fill or stroke attributes** by design.

This package injects `fill="currentColor"` automatically via config so icons inherit color from CSS.

⚠️ Because of how these SVGs are built:

**Color must be applied using:**

* `fill=""`
* `style=""`
* inline color via parent element

**❌ Tailwind text-* classes WILL NOT work reliably.**

---

### ✔️ Correct ways to change color

#### Using `fill`

```blade
<x-pixelicon-user fill="red" />
```

```blade
@svg('pixelicon-home', 'w-6 h-6', ['fill' => '#16a34a'])
```

---

#### Using inline style

```blade
<x-pixelicon-user style="color:#0ea5e9" />
```

```blade
{{ svg('pixelicon-android')->style('color:#f97316') }}
```

---

#### Using parent element color

```blade
<div style="color: purple">
    <x-pixelicon-user />
</div>
```

---

### ❌ Not supported

```blade
{{-- This will NOT work reliably --}}
<x-pixelicon-user class="text-red-500" />
```

This limitation comes from the original Pixelicon SVG structure and is intentional to keep the source files unmodified.

---

## 🧩 Icon Prefix

All icons use the prefix:

```
pixelicon-
```

Examples:

```
pixelicon-user
pixelicon-home
pixelicon-github
pixelicon-android
pixelicon-youtube
```

---

## 🗂 Icon Sets Included

Icons are generated from the official Pixel Icon Library:

* Regular
* Solid
* Brands
* Purcats

All icons are merged into a single set for convenience.

---

## ⚙️ Config

Config file:
`config/blade-pixelicon-icons.php`

You normally don’t need to change anything, but it allows you to:

* Change default attributes
* Override global icon behavior

---

## 🧪 Testing

```bash
composer test
```

---

## 📄 License

[MIT](LICENSE.md) © Daljomar Morillo 

[Pixel Icon Library by HackerNoon](https://github.com/hackernoon/pixel-icon-library) is used under its respective license MIT for code and Creative Commons for the icons.
