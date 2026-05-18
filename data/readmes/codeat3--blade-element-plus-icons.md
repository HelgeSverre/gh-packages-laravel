<p align="center">
    <img src="./socialcard-blade-element-plus-icons.png" width="1280" title="Social Card Blade Element Plus Icons">
</p>

# Blade Element Plus Icons

<a href="https://github.com/codeat3/blade-element-plus-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/codeat3/blade-element-plus-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/codeat3/blade-element-plus-icons">
    <img src="https://img.shields.io/packagist/v/codeat3/blade-element-plus-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/codeat3/blade-element-plus-icons">
    <img src="https://img.shields.io/packagist/dt/codeat3/blade-element-plus-icons" alt="Total Downloads">
</a>

A package to easily make use of [Element Plus Icons](https://github.com/element-plus/element-plus-icons) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [element-plus.org](https://element-plus.org/en-US/component/icon.html).

## Requirements

- PHP 7.4 or higher
- Laravel 8.0 or higher

## Installation

```bash
composer require codeat3/blade-element-plus-icons
```

## Updating

Please refer to [`the upgrade guide`](UPGRADE.md) when updating the library.

## Blade Icons

Blade Element Plus Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Caching Icons

It's a good idea to add the `icons:cache` command as part of your deployment pipeline and always cache icons in production. This will significantly improve performance of the application. Refer [Caching](https://github.com/driesvints/blade-icons?tab=readme-ov-file#caching) section for details.

## Configuration

Blade Element Plus Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-element-plus-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-element-plus-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-elemplus-back/>
```

You can also pass classes to your icon components:

```blade
<x-elemplus-back class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-elemplus-back style="color: #555"/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-element-plus --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-element-plus/back.svg') }}" width="10" height="10"/>
```

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Maintainers

Blade Element Plus Icons is developed and maintained by [Swapnil Sarwe](https://swapnilsarwe.com).

## License

Blade Element Plus Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
