# SEO Meta

[![Latest Version on Packagist](https://img.shields.io/packagist/v/paulund/seo-meta.svg?style=flat-square)](https://packagist.org/packages/paulund/seo-meta)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/paulund/seo-meta/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/paulund/seo-meta/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/paulund/seo-meta/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/paulund/seo-meta/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/paulund/seo-meta.svg?style=flat-square)](https://packagist.org/packages/paulund/seo-meta)

---

![SEO Meta Laravel Package](https://raw.githubusercontent.com/paulund/seo-meta/refs/heads/main/assets/images/seo-meta.webp)

SEO Meta is a package to help you manage your SEO meta tags in your Laravel application.

## Installation
Install the package via composer:

```bash
composer require paulund/seo-meta
```

Publish the configuration file:

```bash
php artisan vendor:publish --provider="Paulund\SeoMeta\SeoMetaServiceProvider"
php artisan migrate # If the package has migrations
```

## Usage

This package will add a view component into your application that will handle displaying all the meta tags in the head of your
layout blade template.

After you've installed this package add the following component into your lapout blade template, inside the head tag.

```blade
<head>
<x-meta :meta="$meta"/>
</head>
```

The component will search for meta variable passed into the view blade file. You can do this from your controller
by passing the meta variable into the view.

```php
return view('welcome', [
    'meta' => [
        'title' => 'Welcome to the site',
        'description' => 'This is the description of the site',
        'keywords' => 'site, welcome, description',
        'author' => 'Paulund',
        'robots' => 'index, follow',
        'image' => 'https://www.paulund.co.uk/wp-content/uploads/2015/01/og-image.png',
    ]
]);
```

This will add the following meta tags into the head of your layout file.

```html
<title>Welcome to the site</title>
<meta name="description" content="This is the description of the site">
<meta name="keywords" content="site, welcome, description">
<meta name="author" content="Paulund">
<meta name="robots" content="index, follow">
<meta property="og:image" content="https://www.paulund.co.uk/wp-content/uploads/2015/01/og-image.png">
```

The following meta tags are available to use in the meta array.

- title
- description
- canonical
- author
- robots
- keywords
- type
- card
- image
- url
- csp

## Testing
```bash
vendor/bin/testbench workbench:install
composer test
```

## Credits

- [paulund](https://paulund.co.uk)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
