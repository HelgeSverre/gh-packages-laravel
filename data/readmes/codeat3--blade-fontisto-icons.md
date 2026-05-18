<p align="center">
    <img src="./socialcard-blade-fontisto-icons.png" width="1280" title="Social Card Blade Fontisto Icons">
</p>

# Blade Fontisto Icons

<a href="https://github.com/codeat3/blade-fontisto-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/codeat3/blade-fontisto-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/codeat3/blade-fontisto-icons">
    <img src="https://img.shields.io/packagist/v/codeat3/blade-fontisto-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/codeat3/blade-fontisto-icons">
    <img src="https://img.shields.io/packagist/dt/codeat3/blade-fontisto-icons" alt="Total Downloads">
</a>

A package to easily make use of [Blade Fontisto Icons](https://github.com/kenangundogan/fontisto) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [fontisto.com](https://fontisto.com/icons).

## Requirements

- PHP 7.4 or higher
- Laravel 8.0 or higher

## Installation

```bash
composer require codeat3/blade-fontisto-icons
```

## Updating

Please refer to [`the upgrade guide`](UPGRADE.md) when updating the library.

## Blade Icons

Blade Fontisto Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Caching Icons

It's a good idea to add the `icons:cache` command as part of your deployment pipeline and always cache icons in production. This will significantly improve performance of the application. Refer [Caching](https://github.com/driesvints/blade-icons?tab=readme-ov-file#caching) section for details.

## Configuration

Blade Fontisto Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-fontisto-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-fontisto-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-fontisto-android/>
```

You can also pass classes to your icon components:

```blade
<x-fontisto-android class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-fontisto-android style="color: #555"/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-fontisto-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-fontisto-icons/android.svg') }}" width="10" height="10"/>
```

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Maintainers

Blade Fontisto Icons is developed and maintained by [Swapnil Sarwe](https://swapnilsarwe.com).

## License

Blade Fontisto Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
