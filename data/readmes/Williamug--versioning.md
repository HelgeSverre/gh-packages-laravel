# Versioning

[![Latest Version on Packagist](https://img.shields.io/packagist/v/williamug/versioning.svg?style=flat-square)](https://packagist.org/packages/williamug/versioning)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/williamug/versioning/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/williamug/versioning/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/williamug/versioning.svg?style=flat-square)](https://packagist.org/packages/williamug/versioning)
[![License](https://img.shields.io/packagist/l/williamug/versioning.svg?style=flat-square)](https://github.com/williamug/versioning/blob/master/LICENSE.md)

A robust PHP package that helps you display your application's version by leveraging Git tags. Features include caching, multiple format options, error handling, and support for both Laravel and vanilla PHP applications.

**Works with Laravel and vanilla PHP!**

> **Quick Links:**
> - **Vanilla PHP**: [VANILLA-PHP-USAGE.md](VANILLA-PHP-USAGE.md) - Standalone usage without Laravel
> - **FTP Deployment**: [FTP-DEPLOYMENT.md](FTP-DEPLOYMENT.md) - Deploy via FTP without git

## Features

- **Multiple Version Formats**: Tag, full, commit hash, or tag with commit
- **Performance**: Built-in caching support to minimize Git command executions
- **Secure**: Proper input sanitization and error handling
- **Laravel Integration**: Seamless integration with Laravel's facade and Blade directives
- **Vanilla PHP Support**: Works standalone without any framework
- **Configurable**: Extensive configuration options
- **FTP Deployment Support**: Works with deployments that don't include git history
- **Well-tested**: Comprehensive test coverage

## Requirements

- PHP 8.2 or higher
- Laravel 10.x, 11.x, or 12.x (for Laravel integration) or vanilla PHP
- Git installed on your system
- Optional: Laravel Cache for caching (automatically available in Laravel)

## Installation

Install the package via Composer:

```bash
composer require williamug/versioning
```

### Laravel Configuration (Optional)

Publish the configuration file:

```bash
php artisan vendor:publish --tag="versioning-config"
```

This creates `config/versioning.php` where you can customize:

```php
return [
    'repository_path' => base_path(),
    'cache' => [
        'enabled' => true,
        'ttl' => 3600, // 1 hour
        'key' => 'app_version',
    ],
    'fallback_version' => env('APP_VERSION', 'dev'),
    'format' => 'tag',
    'include_prefix' => true,
];
```

## Usage

### Vanilla PHP

#### Option 1: Using the Helper Function (Simplest)

```php
require __DIR__ . '/vendor/autoload.php';

// Simple usage
echo app_version(); // v1.0.0

// Different formats
echo app_version('tag');        // v1.0.0
echo app_version('full');       // v1.0.0-5-g123abc
echo app_version('commit');     // 123abc
echo app_version('tag-commit'); // v1.0.0-123abc
```

#### Option 2: Using the Standalone Class (More Features)

```php
require __DIR__ . '/vendor/autoload.php';

use Williamug\Versioning\StandaloneVersioning;

// Configure (optional)
StandaloneVersioning::setRepositoryPath(__DIR__);
StandaloneVersioning::setFallbackVersion('1.0.0');
StandaloneVersioning::setCaching(true, 3600);
StandaloneVersioning::setIncludePrefix(true);

// Get version
echo StandaloneVersioning::tag();           // v1.0.0
echo StandaloneVersioning::full();          // v1.0.0-5-g123abc
echo StandaloneVersioning::commit();        // 123abc
echo StandaloneVersioning::tagWithCommit(); // v1.0.0-123abc

// Clear cache when needed
StandaloneVersioning::clearCache();
```

See [VANILLA-PHP-USAGE.md](VANILLA-PHP-USAGE.md) for complete standalone usage guide.

### Laravel

#### Using the Facade

```php
use Williamug\Versioning\Versioning;

// Get version tag
Versioning::tag(); // v1.0.0

// Get full version info
Versioning::full(); // v1.0.0-5-g123abc

// Get commit hash
Versioning::commit(); // 123abc

// Get tag with commit
Versioning::tagWithCommit(); // v1.0.0-123abc

// Clear version cache
Versioning::clearCache();
```

#### Using Blade Directives

```blade
{{-- Simple tag version --}}
<footer>
    Version: @app_version_tag
</footer>

{{-- Full version info --}}
<div>
    Build: @app_version_full
</div>

{{-- Just the commit hash --}}
<div>
    Commit: @app_version_commit
</div>

{{-- Custom format --}}
<div>
    Version: @app_version('tag-commit')
</div>
```

#### Using the Helper Function

```php
// In your controllers or views
$version = app_version();
$commit = app_version('commit');
```

## Configuration Options

### Repository Path

Specify where your `.git` directory is located:

```php
'repository_path' => base_path(), // or any absolute path
```

### Caching

Enable caching to improve performance:

```php
'cache' => [
    'enabled' => true,
    'ttl' => 3600, // Cache for 1 hour
    'key' => 'app_version',
],
```

### Fallback Version

Set a default version when Git is unavailable:

```php
'fallback_version' => env('APP_VERSION', 'dev'),
```

You can set this in your `.env`:

```env
APP_VERSION=v1.0.0
```

### Version Format

Choose default format:

```php
'format' => 'tag', // Options: 'tag', 'full', 'commit', 'tag-commit'
```

### Version Prefix

Control whether to include 'v' prefix:

```php
'include_prefix' => false, // Displays: 1.0.0 instead of v1.0.0
```

## Error Handling

The package gracefully handles errors:

- Returns fallback version if Git is not installed
- Returns fallback version if not in a Git repository
- Returns fallback version if no tags exist
- Catches and handles all exceptions

## Testing

```bash
# Run tests
composer test

# Run tests with coverage
composer test-coverage

# Run static analysis
composer analyse

# Format code
composer format
```

## Development

```bash
# Install dependencies
composer install

# Run Pint (code formatting)
vendor/bin/pint

# Run PHPStan (static analysis)
vendor/bin/phpstan analyse

# Run Pest (tests)
vendor/bin/pest
```

## Common Use Cases

### Display Version in Footer

```blade
<footer class="text-center py-4">
    <p>MyApp @app_version_tag | Build @app_version_commit</p>
</footer>
```

### API Response

```php
public function version()
{
    return response()->json([
        'version' => Versioning::tag(),
        'commit' => Versioning::commit(),
        'build_date' => now(),
    ]);
}
```

### Admin Dashboard

```php
public function dashboard()
{
    return view('admin.dashboard', [
        'app_version' => Versioning::full(),
        'git_commit' => Versioning::commit(),
    ]);
}
```

### Clear Cache After Deployment

```php
// In your deployment script
Artisan::call('cache:clear');
Versioning::clearCache();
```

## Troubleshooting

### "dev" is always displayed

- Ensure you're in a Git repository
- Ensure Git is installed: `git --version`
- Ensure you have tags: `git tag`
- Check your repository path in config

### Create a tag if none exist

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Asaba William](https://github.com/williamug)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
