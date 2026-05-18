<p align="center"><img src="/art/socialcard.png" alt="Custom icons for Laravel Blade by Sertxu Developer"></p>

# Blade Icons - Sertxu's Collection

![](https://img.shields.io/github/v/release/sertxudeveloper/blade-icons) ![](https://github.com/sertxudeveloper/blade-icons/actions/workflows/tests.yml/badge.svg) ![](https://img.shields.io/github/license/sertxudeveloper/blade-icons) ![](https://img.shields.io/github/repo-size/sertxudeveloper/blade-icons) ![](https://img.shields.io/packagist/dt/sertxudeveloper/blade-icons) ![](https://img.shields.io/github/issues/sertxudeveloper/blade-icons) ![](https://img.shields.io/packagist/php-v/sertxudeveloper/blade-icons) [![Codecov Test coverage](https://img.shields.io/codecov/c/github/sertxudeveloper/blade-icons)](https://app.codecov.io/gh/sertxudeveloper/blade-icons)

This package provides a collection of custom icons for Laravel Blade. It is based on Blade Icons from Blade UI Kit.

## Requirements

- PHP 8.2 or higher
- Laravel 11.x or higher

## Installation

```bash
composer require sertxudeveloper/blade-icons
```

## Blade Icons

Blade Icons - Sertxu's Collection uses Blade Icons from Blade UI Kit under the hood. Please refer to [the Blade Icons readme](https://github.com/blade-ui-kit/blade-icons) for additional functionality. We also recommend to [enable icon caching](https://github.com/blade-ui-kit/blade-icons#caching) with this library.

## Configuration

Blade Icons - Sertxu's Collection also offers the ability to use features from Blade Icons like default classes, default attributes, etc. If you'd like to configure these, publish the `icons.php` config file:

```bash
php artisan vendor:publish --tag=icons-config
```

## Usage

Icons can be used as self-closing Blade components which will be compiled to SVG icons:

```blade
<x-icon-home/>
```

You can also pass classes to your icon components:

```blade
<x-icon-home class="w-6 h-6 text-gray-500"/>
```

And even use inline styles:

```blade
<x-icon-home style="color: #555"/>
```

The solid icons can be referenced like this:

```blade
<x-icon-home/>
```

## Testing

This package contains tests, you can run them using the following command:

```bash
composer test
```

## Contributing

Please see [CONTRIBUTING](https://github.com/sertxudeveloper/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Sergio Peris](https://github.com/sertxudev)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

<br><br>
<p align="center">Copyright © 2024 Sertxu Developer</p>
