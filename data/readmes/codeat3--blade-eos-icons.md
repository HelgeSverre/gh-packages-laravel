<p align="center">
    <img src="./socialcard-blade-eos-icons.png" width="1280" title="Social Card Blade EOS Icons">
</p>

# Blade EOS Icons

<a href="https://github.com/codeat3/blade-eos-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/codeat3/blade-eos-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/codeat3/blade-eos-icons">
    <img src="https://img.shields.io/packagist/v/codeat3/blade-eos-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/codeat3/blade-eos-icons">
    <img src="https://img.shields.io/packagist/dt/codeat3/blade-eos-icons" alt="Total Downloads">
</a>

A package to easily make use of [EOS Icons](https://gitlab.com/SUSE-UIUX/eos-icons) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [icons.eosdesignsystem.com](https://icons.eosdesignsystem.com/).

## Requirements

- PHP 7.4 or higher
- Laravel 8.0 or higher

## Installation

```bash
composer require codeat3/blade-eos-icons
```

## Updating

Please refer to [`the upgrade guide`](UPGRADE.md) when updating the library.

## Blade Icons

Blade EOS Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Caching Icons

It's a good idea to add the `icons:cache` command as part of your deployment pipeline and always cache icons in production. This will significantly improve performance of the application. Refer [Caching](https://github.com/driesvints/blade-icons?tab=readme-ov-file#caching) section for details.

## Configuration

Blade EOS Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-eos-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-eos-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-eos-air/>
```

You can also pass classes to your icon components:

```blade
<x-eos-air class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-eos-air style="color: #555"/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-eos-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-eos-icons/air.svg') }}" width="10" height="10"/>
```

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Maintainers

Blade EOS Icons is developed and maintained by [Swapnil Sarwe](https://swapnilsarwe.com).

## License

Blade EOS Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
