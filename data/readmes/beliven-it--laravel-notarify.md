# Laravel Notarify

<br>
<p align="center"><img src="./repo/banner.png" /></p>
<br>
    
<p align="center">

[![Latest Version on Packagist](https://img.shields.io/packagist/v/beliven-it/laravel-notarify.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-notarify)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-notarify/run-tests.yml?branch=main&label=tests&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-notarify/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/beliven-it/laravel-notarify/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://github.com/beliven-it/laravel-notarify/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/beliven-it/laravel-notarify.svg?style=for-the-badge&labelColor=2a2c2e&color=0fbccd)](https://packagist.org/packages/beliven-it/laravel-notarify)

</p>

A laravel package to perform notarization through blockchain.

This package supports notarization on the following providers:

- [Scaling Parrots](https://www.scalingparrots.com/en/)
- [Iuscribo](https://www.iuscribo.io/)


## Installation

You can install the package via composer:

```bash
composer require beliven-it/laravel-notarify
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="notarify-config"
```

Set the ENV variables

```
NOTARIFY_SERVICE=scalingparrots
// NOTARIFY_SERVICE=iuscribo

// If you use Scaling Parrots
SCALING_PARROTS_ENDPOINT=
SCALING_PARROTS_USERNAME=
SCALING_PARROTS_PASSWORD=

// If you use Iuscribo
IUSCRIBO_ENDPOINT=
IUSCRIBO_USERNAME=
IUSCRIBO_PASSWORD=
IUSCRIBO_COMPANY==
```

## Usage

```php
<?php

use Beliven\Notarify\Facades\Notarify;

$notarization = Notarify::upload($item) // $item is a file
$notarization = Notarify::verify($item); // $item can be a file or a Notarization instance

// The returned value is an instance of Beliven\Notarify\Entities\Notarization::class, which has the following public methods:
$notarization->getId(); // Returns the Notarization ID
$notarization->getHash(); // Returns the Notarization Hash
$notarization->getTimestamp(); // Returns the Notarization timestamp as a Carbon instance (UTC Timezone)
$notarization->getExplorerUrls(); // Returns the Notarization explorer urls as indexed array
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](https://github.com/beliven-it/.github/blob/main/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](https://github.com/beliven-it/.github/blob/main/SECURITY.md) on how to report security vulnerabilities.

## Credits

- [Andrea Spadavecchia](https://github.com/beliven-andrea-spadavecchia)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
