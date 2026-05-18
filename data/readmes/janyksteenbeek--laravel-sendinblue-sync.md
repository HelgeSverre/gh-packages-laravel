# laravel-sendinblue-sync
**One-way synchronization of contact fields in your Laravel application towards the Sendinblue marketing software.**

[![Latest Version on Packagist](https://img.shields.io/packagist/v/janyksteenbeek/laravel-sendinblue-sync.svg?style=flat-square)](https://packagist.org/packages/janyksteenbeek/laravel-sendinblue-sync)
[![Total Downloads](https://img.shields.io/packagist/dt/janyksteenbeek/laravel-sendinblue-sync.svg?style=flat-square)](https://packagist.org/packages/janyksteenbeek/laravel-sendinblue-sync)
[![PHPStan](https://github.com/janyksteenbeek/laravel-sendinblue-sync/actions/workflows/phpstan.yml/badge.svg)](https://github.com/janyksteenbeek/laravel-sendinblue-sync/actions/workflows/phpstan.yml)

## Installation

You can install the package via composer:

```bash
composer require janyksteenbeek/laravel-sendinblue-sync
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="sendinblue-sync-config"
```

Set all the required values in the config file or in your environment variables. See section "Setup" for more information.

Next, add the trait to your User model:

```php
use Janyk\LaravelSendinblueSync\Traits\IsSendinblueContact;

class User extends Authenticatable
{
    use IsSendinblueContact;
}
```


## Setup instructions

1. Follow the installation instructions to include the package in your application.
2. Before you can use this package, you need to generate an API token. You can do this here: https://app.sendinblue.com/settings/keys/api/
3. Add the API token to your `.env` file as `SENDINBLUE_KEY`.
6. Make sure you have a `User` model in your application. This model should have a `sendinblue_id` and `email` column. This column will be used to store the Sendinblue ID of the contact and the email of the contact. You can modify these fields in the config.
7. Make sure the other fields you want to sync with Sendinblue are present on your `User` model. You can change these mapping of those fields in the config file. In the config file, you can also set any custom fields in case you need those.
8. Add the `IsSendinblueContact` trait to your `User` model.


## Security Vulnerabilities

If you are an outside collaborator and discover a security vulnerability within this repository, please send an e-mail to our security team via [security-external@webmethod.nl](mailto:security-external@webmethod.nl). **Do not use GitHub Issues** to report security vulnerabilities. All security vulnerabilities will be promptly addressed. Please adhere to the [Webmethod Coordinated Vulnerability Disclosure guidelines](https://www.webmethod.nl/juridisch/responsible-disclosure) at all times.


## Credits

- [Janyk Steenbeek](https://github.com/janyksteenbeek)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Disclaimer

This package is not affiliated with or endorsed by SENDINBLUE or any of its affiliates. The use of the trademark SENDINBLUE is solely for the purpose of identifying the company and its products. Any references to SENDINBLUE are made strictly for identification purposes and do not imply any endorsement or sponsorship by SENDINBLUE



