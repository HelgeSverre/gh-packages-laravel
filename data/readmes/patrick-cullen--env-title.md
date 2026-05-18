# A Laravel package for adding the environment to the HTML title

[![Latest Version on Packagist](https://img.shields.io/packagist/v/patrick-cullen/env-title.svg?style=flat-square)](https://packagist.org/packages/patrick-cullen/env-title)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/patrick-cullen/env-title/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/patrick-cullen/env-title/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/patrick-cullen/env-title/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/patrick-cullen/env-title/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/patrick-cullen/env-title.svg?style=flat-square)](https://packagist.org/packages/patrick-cullen/env-title)

Ever had local, QA, and production tabs of the same application all open at the same time? It can be easy to mix them up and waste precious time and attention keeping them straight.

This utility package creates a blade component that prepends the HTML document title (what shows in a browser tab) with the environment that the application is running in- unless it's production, in which case it is treated as a regular `<title>` tag.

## Installation

You can install the package via composer:

```bash
composer require patrick-cullen/env-title
```

Note that you may need to add the -W flag if a dependency of env-title such as "spatie/laravel-package-tools" is required by other packages in your project and is installed at a version below the required versions for env-title. 
Alternatively, run:

```bash
composer update
```

before installing this package via composer. 

The installation script will handle the rest:

```bash
php artisan env-title:install
```

Now just replace your `<title>` tags with `<x-env-title>` blade components, and you're good to go.

## Workflow for making changes to this package

- Pick a project to pull this package into 
```bash
composer require patrick-cullen/env-title --prefer-source
```
- Tinker around and commit desired changes to version control (this is what the --prefer-source flag allows you to do).
- Push your changes.
    - If you see multiple remotes (origin and composer) don't worry - updating one will update the other momentarily.
- Tag and push your changes - in a more refined workflow you would probably want to add a stability flag for anything not thoroughly tested and used by others, but standard semver should suffice.  

<!--
You can publish the config file with:

```bash
php artisan vendor:publish --tag="env-title-config"
```

This is the contents of the published config file:

```php
return [
];
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities. -->

## Credits

-   [patrick-cullen](https://github.com/patrick-cullen)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
