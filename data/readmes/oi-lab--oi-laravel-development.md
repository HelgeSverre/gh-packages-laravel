# OI Laravel Development Commands

[![Latest Version](https://img.shields.io/github/v/release/oi-lab/oi-laravel-development)](https://github.com/oi-lab/oi-laravel-development/releases)
[![License](https://img.shields.io/github/license/oi-lab/oi-laravel-development)](LICENSE)
[![PHP](https://img.shields.io/badge/php-8.2%20%7C%208.3%20%7C%208.4-blue)](composer.json)

A Laravel package providing essential development and initialization commands to streamline your development workflow.

## Features

- **dev:clear-log**: Clear Laravel log files
- **dev:clear-storage**: Clear storage directories with configurable exceptions
- **dev:force-password**: Quickly reset user passwords during development
- **dev:reset**: Complete database reset with cache clearing
- **init:all**: Interactive seeder selection and execution

## Requirements

- PHP 8.2+
- Laravel 11.0+ or 12.0+
- Laravel Prompts

## Installation

### Via Composer

If the package is published on Packagist:

```bash
composer require oi-lab/oi-laravel-development --dev
```

### Via GitHub (Private Repository)

Add the repository to your `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/oi-lab/oi-laravel-development"
        }
    ]
}
```

Then require the package:

```bash
composer require oi-lab/oi-laravel-development --dev
```

### Local Development

For local development, add this to your main project's `composer.json`:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "./packages/oi-lab/oi-laravel-development"
        }
    ]
}
```

Then:

```bash
composer require oi-lab/oi-laravel-development --dev
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=oi-laravel-development-config
```

This creates `config/oi-laravel-development.php` with the following options:

```php
return [
    // Default password for dev:force-password command
    'default_password' => env('DEV_DEFAULT_PASSWORD', 'password'),

    // Directories excluded from dev:clear-storage
    'storage_exceptions' => [
        'dev',
        'seeders',
        'backups',
    ],

    // Log files to clear with dev:clear-log
    'log_files' => [
        'laravel.log',
    ],

    // Available seeders for init:all command
    'seeders' => [
        'Database\\Seeders\\UserSeeder' => 'UserSeeder',
        'Database\\Seeders\\OrganizationSeeder' => 'OrganizationSeeder',
    ],
];
```

## Usage

### Clear Log Files

Clear all configured log files:

```bash
php artisan dev:clear-log
```

### Clear Storage

Clear storage directories with confirmation prompt:

```bash
php artisan dev:clear-storage
```

Force clear without confirmation:

```bash
php artisan dev:clear-storage --force
```

### Reset User Password

Reset a user's password during development:

```bash
php artisan dev:force-password user@example.com
```

Set a specific password:

```bash
php artisan dev:force-password user@example.com --password=newpassword
```

### Reset Database

Complete database reset with cache clearing:

```bash
php artisan dev:reset
```

Force reset without confirmation:

```bash
php artisan dev:reset --force
```

Reset and run initial seeders:

```bash
php artisan dev:reset --init
```

### Run Initial Seeders

Interactive seeder selection:

```bash
php artisan init:all
```

Run all seeders without prompting:

```bash
php artisan init:all --force
```

## Advanced Configuration

### Custom Log Files

Add custom log files to clear:

```php
// config/oi-laravel-development.php
'log_files' => [
    'laravel.log',
    'custom-application.log',
    'api-errors.log',
],
```

### Storage Exceptions

Protect specific directories from being cleared:

```php
// config/oi-laravel-development.php
'storage_exceptions' => [
    'dev',
    'seeders',
    'backups',
    'important-uploads',
],
```

### Configurable Seeders

Define which seeders appear in the init:all command:

```php
// config/oi-laravel-development.php
'seeders' => [
    'Database\\Seeders\\UserSeeder' => 'Users',
    'Database\\Seeders\\RoleSeeder' => 'Roles & Permissions',
    'Database\\Seeders\\ProductSeeder' => 'Products',
],
```

## Environment Variables

Add to your `.env` file:

```env
# Default password for dev:force-password
DEV_DEFAULT_PASSWORD=password
```

## Examples

### Complete Development Reset

```bash
# Clear everything and start fresh
php artisan dev:reset --force --init
```

This will:
1. Clear all caches (cache, config, route)
2. Clear storage directories
3. Reset database (migrate:fresh)
4. Run default seeders
5. Run initial seeders (with --init flag)

### Quick Password Reset for Testing

```bash
# Reset test user password to default
php artisan dev:force-password test@example.com
```

### Selective Seeding

```bash
# Choose which seeders to run interactively
php artisan init:all
```

## Testing

Run the test suite:

```bash
vendor/bin/pest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

When contributing:
1. Write tests for new features
2. Ensure all tests pass: `vendor/bin/pest`
3. Follow existing code style
4. Update documentation as needed

## License

This package is open-source software licensed under the [MIT license](LICENSE).

## Credits

**[Olivier Lacombe](https://www.olacombe.com)** - Creator and maintainer

Olivier is a Product & Technology Director based in Montpellier, France, with over 20 years of experience innovating in UX/UI and emerging technologies. He specializes in guiding enterprises toward cutting-edge digital solutions, combining user-centered design with continuous optimization and artificial intelligence integration.

**Projects & Resources:**
- [OnAI](https://onai.olacombe.com) - Training courses and masterclasses on generative AI for businesses
- [Promptr](https://promptr.olacombe.com) - Prompt engineering Management Platform

## Support

For support, please open an issue on the [GitHub repository](https://github.com/oi-lab/oi-laravel-development/issues).
