![Social Card](https://github.com/kaungkhantjc/blade-hugeicons/blob/main/art/socialcard-blade-hugeicons.jpeg)

# Blade Hugeicons

<a href="https://github.com/kaungkhantjc/blade-hugeicons/actions?query=workflow%3ATests">
    <img src="https://github.com/kaungkhantjc/blade-hugeicons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://github.com/kaungkhantjc/blade-hugeicons/actions/workflows/coding-standards.yml">
    <img src="https://github.com/kaungkhantjc/blade-hugeicons/actions/workflows/coding-standards.yml/badge.svg" alt="Coding Standards" />
</a>
<a href="https://packagist.org/packages/kaungkhantjc/blade-hugeicons">
    <img src="https://img.shields.io/packagist/v/kaungkhantjc/blade-hugeicons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/kaungkhantjc/blade-hugeicons">
    <img src="https://img.shields.io/packagist/dt/kaungkhantjc/blade-hugeicons" alt="Total Downloads">
</a>



A package to easily make use of [Hugeicons](https://hugeicons.com) - **~5,000+ (Stroke Rounded) Icons** in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [hugeicons.com](https://hugeicons.com/icons).

## Requirements

- PHP 8.2 or higher
- Laravel 10.0 or higher

## Installation

```bash
composer require kaungkhantjc/blade-hugeicons
```

### ✨ How Icons Are Generated

The SVG icons in this package are generated directly from the **official [@hugeicons/core-free-icons](https://www.npmjs.com/package/@hugeicons/core-free-icons) npm package** — no third-party scrapers, no manual exports. Each icon is rendered server-side via React's `renderToStaticMarkup`, producing clean, minimal SVG markup with all unnecessary attributes stripped out. The result is pure, Blade-compatible SVG files ready for use with [Blade Icons](https://github.com/driesvints/blade-icons).

### 🤖 Automated Updates via GitHub Actions

This package is kept up to date automatically. A scheduled GitHub Actions workflow runs **daily at 00:00 UTC** and:

1. Checks whether a new version of `@hugeicons/core-free-icons` has been published to npm.
2. If an update is detected, installs dependencies, upgrades the package, and regenerates all SVG icons.
3. Commits the updated `package.json` and regenerated icons, then **creates a new GitHub release automatically**.

This means you always get the latest Hugeicons set simply by updating the Composer package — no manual intervention required.

> If you find this package useful, a ⭐ on [GitHub](https://github.com/kaungkhantjc/blade-hugeicons) is much appreciated!

## Blade Icons

Blade Hugeicons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/driesvints/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/driesvints/blade-icons#caching) with this library.

## Configuration

Blade Hugeicons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-hugeicons.php` config file:

```bash
php artisan vendor:publish --tag=blade-hugeicons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```bladehtml
<x-hugeicon-play/>
```

You can also pass classes to your icon components:

```bladehtml
<x-hugeicon-play class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```bladehtml
<x-hugeicon-play style="color: #555"/>
```

You can modify the icon's stroke-width using several methods:

```bladehtml
<x-hugeicon-play stroke-width="2"/>
<x-hugeicon-play class="stroke-2" />
<x-hugeicon-play style="stroke-width: 2px" />
```

The components support all standard SVG attributes, allowing for precise control over dimensions, color, and stroke properties.

```bladehtml
<x-hugeicon-play stroke-width="2" width="48" height="48" color="green" stroke-linecap="round"/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-hugeicons --force
```

Then use them in your views like:

```bladehtml
<img src="{{ asset('vendor/blade-hugeicons/play.svg') }}" width="24" height="24"/>
```

## Changelog

Check out the [releases page](https://github.com/kaungkhantjc/blade-hugeicons/releases) in this repository for all the recent changes.

## Maintainers

Blade Hugeicons is developed and maintained by [Kaung Khant Kyaw](https://github.com/kaungkhantjc).

## License

Blade Hugeicons is open-sourced software licensed under [the MIT license](LICENSE.md).
