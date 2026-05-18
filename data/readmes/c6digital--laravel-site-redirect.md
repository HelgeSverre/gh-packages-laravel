# A small package to redirect all requests elsewhere.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/c6digital/laravel-site-redirect.svg?style=flat-square)](https://packagist.org/packages/c6digital/laravel-site-redirect)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/c6digital/laravel-site-redirect/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/c6digital/laravel-site-redirect/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/c6digital/laravel-site-redirect/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/c6digital/laravel-site-redirect/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/c6digital/laravel-site-redirect.svg?style=flat-square)](https://packagist.org/packages/c6digital/laravel-site-redirect)

This package can be used to redirect all requests to a site elsewhere with the flick of an environment variable.

## Installation

You can install the package via Composer:

```bash
composer require c6digital/laravel-site-redirect
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="laravel-site-redirect-config"
```

## Usage

Use environment variables to enable & disable the redirect and configure the redirect location.

```sh
SITE_REDIRECT_ENABLED=true
SITE_REDIRECT_LOCATION=https://my-site.test
```

> The middleware that handles the redirect is registered globally by the package.

### Bypassing redirects

There are times when you want to allow somebody to bypass the redirect mechanism. This can be achieved with a "bypass token".

Start by specifying the bypass token as an environment variables.

```
SITE_REDIRECT_BYPASS_TOKEN=example-token
```

To bypass the redirect, simply provide the bypass token in the query string of the request.

```
https://my-site.test/?bypass_token=example-token
```

This will let you access the site as normal. The bypass will be active for 1 hour so subsequent requests will not require a token.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Ryan Chandler](https://github.com/c6digital)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
