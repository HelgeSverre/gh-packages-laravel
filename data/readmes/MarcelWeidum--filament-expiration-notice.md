# Filament Expiration Notice

[![Latest Version on Packagist](https://img.shields.io/packagist/v/marcelweidum/filament-expiration-notice.svg)](https://packagist.org/packages/marcelweidum/filament-expiration-notice)
[![Total Downloads](https://img.shields.io/packagist/dt/marcelweidum/filament-expiration-notice.svg)](https://packagist.org/packages/marcelweidum/filament-expiration-notice)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/marcelweidum/filament-expiration-notice/pint.yml?branch=main&label=code%20style)](https://github.com/marcelweidum/filament-expiration-notice/actions?query=workflow%3A"Fix+PHP+code+styling"+branch%3Amain)
![Filament 3.x](https://img.shields.io/badge/Filament-3.x-EBB304)
![Filament 4.x](https://img.shields.io/badge/Filament-4.x-007ec6)
![Filament 5.x](https://img.shields.io/badge/Filament-5.x-44cc11)

Customize the 'Page expired' livewire message into a filament modal.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="art/cover-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="art/cover-light.png">
  <img alt="Filament Passkeys cover" src="art/cover-light.png">
</picture>

## Installation

You can install the package via composer:

```bash
composer require marcelweidum/filament-expiration-notice
```

(Optional) When you want to customize the expiration modal you can publish the view by running:

```bash
php artisan vendor:publish --tag="filament-expiration-notice-views"
```

(Optional) If you want to customize the translations, you can publish the translations by running:

```bash
php artisan vendor:publish --tag="filament-expiration-notice-translations"
```

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [MarcelWeidum](https://github.com/MarcelWeidum)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
