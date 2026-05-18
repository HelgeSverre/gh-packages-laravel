<p align="center">
    <img src="./socialcard-blade-majestic-icons.png" width="1280" title="Social Card Blade Majestic Icons">
</p>

# Blade Majestic Icons

<a href="https://github.com/codeat3/blade-majestic-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/codeat3/blade-majestic-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/codeat3/blade-majestic-icons">
    <img src="https://img.shields.io/packagist/v/codeat3/blade-majestic-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/codeat3/blade-majestic-icons">
    <img src="https://img.shields.io/packagist/dt/codeat3/blade-majestic-icons" alt="Total Downloads">
</a>

A package to easily make use of [Blade Majestic Icons](https://github.com/halfmage/majesticons) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [majesticons.netlify.app](https://majesticons.netlify.app).

## Requirements

- PHP 7.4 or higher
- Laravel 8.0 or higher

## Installation

```bash
composer require codeat3/blade-majestic-icons
```

## Updating

Please refer to [`the upgrade guide`](UPGRADE.md) when updating the library.

## Note

When you upgrade to `2.0` of this package, most of the icons which were available in `1.0` won't be available. This is due to the deletion of icons in the original repository. Kindly make note of it. The commit can be found on the original repo at this link with the commit description as [initial commit for v2](https://github.com/halfmage/majesticons/commit/4417a83f6869615bfa2447df4f461de95530b5c6)

## Blade Icons

Blade Majestic Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Caching Icons

It's a good idea to add the `icons:cache` command as part of your deployment pipeline and always cache icons in production. This will significantly improve performance of the application. Refer [Caching](https://github.com/driesvints/blade-icons?tab=readme-ov-file#caching) section for details.

## Configuration

Blade Majestic Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-majestic-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-majestic-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-majestic-cookie-line/>
```

You can also pass classes to your icon components:

```blade
<x-majestic-cookie-line class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-majestic-cookie-line style="color: #555"/>
```

The solid icons can be referenced like this by using suffix `-solid`:
```blade
<x-majestic-cookie-solid/>
```

The line icons can be referenced like this by using suffix `-line`:
```blade
<x-majestic-cookie-line/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-majestic-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-majestic-icons/cookie-line.svg') }}" width="10" height="10"/>
```

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Maintainers

Blade Majestic Icons is developed and maintained by [Swapnil Sarwe](https://swapnilsarwe.com).

## License

Blade Majestic Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
