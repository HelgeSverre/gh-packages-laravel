# Knocker for Laravel

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kapersoft/knocker-for-laravel.svg?style=flat-square)](https://packagist.org/packages/kapersoft/knocker-for-laravel)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/kapersoft/knocker-for-laravel/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/kapersoft/knocker-for-laravel/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/kapersoft/knocker-for-laravel/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/kapersoft/knocker-for-laravel/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/kapersoft/knocker-for-laravel.svg?style=flat-square)](https://packagist.org/packages/kapersoft/knocker-for-laravel)

A Laravel package that seamlessly integrates your application with **Knocker for Laravel Cloud** - a reliable service that ensures your scheduled tasks continue running even when your Laravel application is in hibernation mode.

Learn more about Knocker for Laravel Cloud at [https://knocker.laravel.cloud](https://knocker.laravel.cloud).

## Requirements

- PHP 8.3 or higher
- Laravel 12.0 or higher

## Installation

Install the package using Composer:

```bash
composer require kapersoft/knocker-for-laravel
```

## Publish configuration file

If you like, you can publish the configuration file:

```bash
php artisan vendor:publish --tag="knocker-for-laravel-config"
```

This will create a configuration file with the following structure:

```php
return [
    'endpoint' => env('KNOCKER_ENDPOINT', 'https://knocker.laravel.cloud/api/v1/schedulerTasks'),
    'token' => env('KNOCKER_TOKEN', ''),
];
```

## Configuration

After registering your application on [Knocker for Laravel Cloud](https://knocker.laravel.cloud), add your authentication token to the `.env` file:

```env
KNOCKER_TOKEN=your-knocker-token-here
```

## Usage

### Registering Scheduled Tasks

To register your application's scheduled tasks with [Knocker for Laravel Cloud](https://knocker.laravel.cloud), run the following command:

```bash
php artisan knocker:send-scheduler-tasks
```

This command performs the following actions:

1. **Scans** your scheduled tasks. These are usually in `routes/console.php` or `app/Console/Kernel.php`
2. **Extracts** task configurations including:
   - Cron expressions and timing
   - Command names and descriptions
   - Timezone settings
   - Callback functions and closures
3. **Uploads** the task information to [Knocker for Laravel Cloud](https://knocker.laravel.cloud)

### Deployment Integration

For seamless integration, add the registration command to your deployment pipeline:

```bash
php artisan knocker:send-scheduler-tasks
```

This ensures your task configurations are automatically updated with each deployment, keeping [Knocker for Laravel Cloud](https://knocker.laravel.cloud) synchronized with your latest scheduled tasks.

## Testing

Run the test suite:

```bash
composer test
```

## Documentation

Please see the following files for additional information:

- [CHANGELOG](CHANGELOG.md) - Recent changes and version history
- [CONTRIBUTING](CONTRIBUTING.md) - Contribution guidelines
- [LICENSE](LICENSE.md) - MIT License details

## Security

Please review [our security policy](SECURITY.MD) for information on reporting security vulnerabilities.

## Credits

- [Jan Willem Kaper](https://github.com/kapersoft) - Package Author
- [All Contributors](../../contributors) - Community Contributors

## License

This package is open-sourced software licensed under the [MIT License](LICENSE.md).
