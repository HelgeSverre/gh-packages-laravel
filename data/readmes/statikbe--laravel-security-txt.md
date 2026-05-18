# Laravel security.txt

[![Latest Version on Packagist](https://img.shields.io/packagist/v/statikbe/laravel-security-txt.svg?style=flat-square)](https://packagist.org/packages/statikbe/laravel-security-txt)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/statikbe/laravel-security-txt/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/statikbe/laravel-security-txt/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/statikbe/laravel-security-txt/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/statikbe/laravel-security-txt/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/statikbe/laravel-security-txt.svg?style=flat-square)](https://packagist.org/packages/statikbe/laravel-security-txt)

A Laravel package to manage [security.txt](https://securitytxt.org/) files with automatic updates and configurable expiration. Fetches a template from a remote URL, replaces placeholders with dynamic values, and serves the file at `/.well-known/security.txt`.

## Installation

Install the package via Composer:

```bash
composer require statikbe/laravel-security-txt
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag="security-txt-config"
```

## Configuration

The published configuration file (`config/security-txt.php`) contains the following options:

```php
return [
    // Enable/disable the /.well-known/security.txt route
    'enabled' => env('SECURITY_TXT_ENABLED', true),

    // Remote URL to fetch the template from
    'template_url' => env('SECURITY_TXT_TEMPLATE_URL'),

    // Days until expiration (default: 365)
    'expires_days' => env('SECURITY_TXT_EXPIRES_DAYS', 365),

    // Where to store the generated file
    'output_path' => storage_path('security.txt'),

    // Placeholder mappings
    'placeholders' => [
        'CONTACT_EMAIL' => 'security@example.com',
        'PGP_KEY_URL' => fn() => config('app.url') . '/pgp-key.txt',
    ],

    // Middleware for the route
    'middleware' => ['web'],
];
```

### Environment Variables

| Variable                    | Description                | Default |
|-----------------------------|----------------------------|---------|
| `SECURITY_TXT_ENABLED`      | Enable/disable the route   | `true`  |
| `SECURITY_TXT_TEMPLATE_URL` | URL to fetch template from | `null`  |
| `SECURITY_TXT_EXPIRES_DAYS` | Days until expiration      | `365`   |

## Template Setup

Create a `security.txt` template file and host it somewhere accessible (e.g., GitHub raw file, internal server). Use `{{PLACEHOLDER_NAME}}` syntax for dynamic values.

### Example Template

```text
Contact: mailto:{{CONTACT_EMAIL}}
Expires: {{EXPIRES}}
Encryption: {{PGP_KEY_URL}}
Preferred-Languages: en
```

Host this file and set the URL in your published configuration file.

An example template is included in the package at `stubs/security.txt.template`.

## Placeholders

### Built-in Placeholders

| Placeholder   | Description                                        |
|---------------|----------------------------------------------------|
| `{{EXPIRES}}` | Auto-calculated expiration date in ISO 8601 format |

### Custom Placeholders

Define custom placeholders in the config file. Values can be strings or callables:

```php
'placeholders' => [
    'CONTACT_EMAIL' => 'security@example.com',
    'PGP_KEY_URL' => fn () => config('app.url') . '/pgp-key.txt',
    'CANONICAL_URL' => fn () => config('app.url') . '/.well-known/security.txt',
],
```

## Usage

### Generating the File

Run the Artisan command to fetch the template and generate the security.txt file:

```bash
php artisan security-txt:update
```

Override the expiration days:

```bash
php artisan security-txt:update --expires-days=30
```

### Scheduling Updates

Add the command to your `routes/console.php` to keep the file updated:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('security-txt:update')->weekly();
```

### Accessing the File

Once generated, the file is served at:

```
https://your-domain.com/.well-known/security.txt
```

## Validation

The package validates generated files against [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) requirements:

- **Contact** field is required
- **Expires** field is required

If validation fails, the file will not be written and an error will be logged.

## Error Handling

The command handles errors gracefully:

- If the template URL is unreachable, an error is logged and the existing file (if any) is preserved
- If validation fails, errors are displayed and the file is not written
- All errors are logged via Laravel's logging system

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [Aurel Demiri](https://github.com/AurelDemiri)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
