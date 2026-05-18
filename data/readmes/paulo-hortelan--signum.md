# Signum

[![Latest Version on Packagist](https://img.shields.io/packagist/v/paulo-hortelan/signum.svg?style=flat-square)](https://packagist.org/packages/paulo-hortelan/signum)
[![Tests](https://img.shields.io/github/actions/workflow/status/paulo-hortelan/signum/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/paulo-hortelan/signum/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Code Style](https://img.shields.io/github/actions/workflow/status/paulo-hortelan/signum/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/paulo-hortelan/signum/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/paulo-hortelan/signum.svg?style=flat-square)](https://packagist.org/packages/paulo-hortelan/signum)

Signum is a Laravel package to generate, sign, display, download, and validate course certificates.

It includes:

- digital signature support with RSA private/public keys
- certificate preview and PDF download routes
- browser-friendly validation page and JSON API validation response
- multi-page certificate support (course content appendices)
- i18n support (`en` and `pt_BR`)
- signature rendering as either text or image

## Requirements

- PHP `^8.1`
- Laravel `10`, `11`, or `12`

## Installation

```bash
composer require paulo-hortelan/signum
```

Publish package files:

```bash
php artisan vendor:publish --tag=signum-config
php artisan vendor:publish --tag=signum-views
php artisan vendor:publish --tag=signum-translations
php artisan vendor:publish --tag=signum-assets
php artisan vendor:publish --tag=signum-migrations
```

Run migrations:

```bash
php artisan migrate
```

## Quick Start

### 1) Configure keys

Generate keys:

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in private.pem -out public.pem
```

Set `.env`:

```dotenv
SIGNUM_PRIVATE_KEY_PATH=/absolute/path/private.pem
SIGNUM_PUBLIC_KEY_PATH=/absolute/path/public.pem
SIGNUM_VALIDATION_URL=https://your-domain.com/signum/certificates/validate
```

Docker note:

- Paths must exist inside the container (for example `/run/secrets/signum_private.pem`).
- The PHP process user inside the container must have read permission.
- If mounting key files is inconvenient, you can provide inline keys with `SIGNUM_PRIVATE_KEY` and `SIGNUM_PUBLIC_KEY`.

### 2) Generate a certificate

```php
use PauloHortelan\Signum\Facades\Signum;

$certificate = Signum::generateCertificate([
    'recipient_name' => 'Jane Doe',
    'course_name' => 'Advanced Laravel',
    'locale' => 'en',
    'meta' => [
        'content_sections' => [
            [
                'title' => 'Module 1 - Fundamentals',
                'items' => ['Service Container', 'Events', 'Queues'],
            ],
            [
                'title' => 'Module 2 - Delivery',
                'items' => ['Testing', 'CI/CD'],
            ],
        ],
    ],
    'signature_display' => [
        'type' => 'text',
        'text' => 'Jane Instructor',
    ],
]);
```

### 3) Access routes

By default:

- `GET /signum/certificates/{code}`
- `GET /signum/certificates/{code}/download`
- `GET /signum/certificates/validate?code={code}`

Development-only route (enabled in `local`/`testing` by default):

- `GET /signum/certificates/demo`

Production recommendation:

```dotenv
SIGNUM_DEMO_ROUTE_ENABLED=false
```

## Validation Endpoint (Web + API)

The same endpoint supports both browser and API consumers:

- `Accept: text/html` -> renders a styled validation page
- `Accept: application/json` -> returns JSON

Example:

```bash
curl -H "Accept: application/json" \
  "https://your-domain.com/signum/certificates/validate?code=01H..."
```

## Signature Display Options

Text signature:

```php
'signature_display' => [
    'type' => 'text',
    'text' => 'Jane Instructor',
]
```

Uploaded image signature:

```php
'signature_display' => [
    'type' => 'image',
    'image_upload' => $request->file('signature'),
]
```

Pre-existing image path:

```php
'signature_display' => [
    'type' => 'image',
    'image_path' => storage_path('app/public/signatures/director.png'),
]
```

## Localization

Supported locales:

- `en` (default)
- `pt_BR`

You can set locale per certificate (`locale` field) or globally (`SIGNUM_DEFAULT_LOCALE`).

## Customization Guide

After publishing files, you can customize:

- `config/signum.php`
: route prefix, default locale, validation URL, storage disk, default views
- `resources/views/vendor/signum/certificate.blade.php`
: certificate and appendix layout
- `resources/views/vendor/signum/validation.blade.php`
: browser validation page layout
- `lang/vendor/signum/{locale}/signum.php`
: labels and copy
- `public/vendor/signum/images/*`
: logo/background/signature assets

Useful config entries:

- `certificate.view`
- `certificate.pdf_view`
- `certificate.validation_view`
- `certificate.layout.print_width`
- `certificate.layout.print_height`
- `certificate.images`
- `certificate.text_overrides`
- `certificate.custom_html`
- `certificate.signature_upload`
- `demo_route_enabled`

## Local Package Development

This repository is a package (no root `artisan`).

Run local testbench server:

```bash
composer run serve
```

List package routes:

```bash
composer run routes
```

## Quality Checks

```bash
composer test
php vendor/bin/pint --test
php vendor/bin/phpstan analyse
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE.md](LICENSE.md).
