# Blade selfh.st Icons

<a href="https://github.com/RobertBoes/blade-selfhst-icons/actions?query=workflow%3ATests">
    <img src="https://github.com/RobertBoes/blade-selfhst-icons/workflows/Tests/badge.svg" alt="Tests">
</a>
<a href="https://packagist.org/packages/robertboes/blade-selfhst-icons">
    <img src="https://img.shields.io/packagist/v/robertboes/blade-selfhst-icons" alt="Latest Stable Version">
</a>
<a href="https://packagist.org/packages/robertboes/blade-selfhst-icons">
    <img src="https://img.shields.io/packagist/dt/robertboes/blade-selfhst-icons" alt="Total Downloads">
</a>

A package to easily make use of [selfh.st Icons](https://selfh.st/icons/) in your Laravel Blade views.

For a full list of available icons see [the SVG directory](resources/svg) or preview them at [selfh.st/icons](https://selfh.st/icons/).

## Requirements

- PHP 8.2 or higher
- Laravel 11.0 or higher

## Installation

```bash
composer require robertboes/blade-selfhst-icons
```

## Updating

Please refer to [`the upgrade guide`](UPGRADE.md) when updating the library.

## Blade Icons

Blade selfh.st Icons uses Blade Icons under the hood. Please refer to [the Blade Icons readme](https://github.com/driesvints/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/driesvints/blade-icons#caching) with this library.

## Configuration

Blade selfh.st Icons also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `blade-selfhst-icons.php` config file:

```bash
php artisan vendor:publish --tag=blade-selfhst-icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-selfhst-1panel/>
```

You can also pass classes to your icon components:

```blade
<x-selfhst-1panel class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-selfhst-1panel style="color: #555"/>
```

Icons are available in three variants: default, light, and dark:

```blade
<x-selfhst-1panel/>
<x-selfhst-1panel-light/>
<x-selfhst-1panel-dark/>
```

### Raw SVG Icons

If you want to use the raw SVG icons as assets, you can publish them using:

```bash
php artisan vendor:publish --tag=blade-selfhst-icons --force
```

Then use them in your views like:

```blade
<img src="{{ asset('vendor/blade-selfhst-icons/1panel.svg') }}" width="10" height="10"/>
```

## Changelog

Check out the [CHANGELOG](CHANGELOG.md) in this repository for all the recent changes.

## Maintainers

Blade selfh.st Icons is developed and maintained by Robert Boes.

## License

Blade selfh.st Icons is open-sourced software licensed under [the MIT license](LICENSE.md).
