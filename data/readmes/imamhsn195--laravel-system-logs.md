# Laravel System Logs

[![Latest Version](https://img.shields.io/packagist/v/imamhsn195/laravel-system-logs.svg?style=flat-square)](https://packagist.org/packages/imamhsn195/laravel-system-logs)
[![Total Downloads](https://img.shields.io/packagist/dt/imamhsn195/laravel-system-logs.svg?style=flat-square)](https://packagist.org/packages/imamhsn195/laravel-system-logs)
[![License](https://img.shields.io/packagist/l/imamhsn195/laravel-system-logs.svg?style=flat-square)](https://packagist.org/packages/imamhsn195/laravel-system-logs)

A comprehensive Laravel package for viewing and managing system logs with an intuitive web interface.

## Features

- 📋 View log entries from multiple files
- 🔍 Advanced filtering and search (channel, level, environment, date, text search)
- 🗑️ Delete single or bulk entries
- 📁 Recursive directory scanning with depth limits
- 🎨 Flexible layout support (works with any Laravel layout)
- 🔒 Security features (path validation, file size limits)
- 📱 Responsive design
- 🌐 Multi-language support
- ⚡ Real-time filtering via AJAX

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x, or 12.x

## Installation

### Via Packagist (Recommended)

```bash
composer require imamhsn195/laravel-system-logs
```

### Via Composer (from GitHub)

If you need to install from the GitHub repository directly:

Add the repository to your `composer.json`:

```json
{
    "repositories": [
        {
            "type": "vcs",
            "url": "https://github.com/imamhsn195/laravel-system-logs"
        }
    ],
    "require": {
        "imamhsn195/laravel-system-logs": "dev-main"
    }
}
```

Then run:

```bash
composer require imamhsn195/laravel-system-logs:dev-main
```

## Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=system-logs-config
```

This will create `config/system-logs.php` where you can customize:

- Log directory path
- Route prefix and middleware
- Permission names
- UI layout
- Filter defaults
- Directory scanning options
- Security settings

## Usage

### Basic Usage

After installation, navigate to `/admin/system-logs` (or your configured prefix).

### Custom Layout

The package supports any Laravel layout. Configure it in `config/system-logs.php`:

```php
'ui' => [
    'layout' => 'layouts.app', // Your layout name
    'title' => 'System Logs',
],
```

### Permissions

The package uses Laravel's permission system. Configure permission names:

```php
'permissions' => [
    'view' => 'system-log.view',
    'delete' => 'system-log.delete',
],
```

Make sure to add these permissions to your permission system.

### Publishing Assets

Publish CSS and JavaScript files:

```bash
php artisan vendor:publish --tag=system-logs-assets
```

### Publishing Views (Optional)

If you want to customize the views:

```bash
php artisan vendor:publish --tag=system-logs-views
```

### Publishing Translations (Optional)

If you want to customize translations:

```bash
php artisan vendor:publish --tag=system-logs-lang
```

## Features

### Filtering

- **Channel**: Filter by log channel (single, daily, stack, etc.)
- **File**: Filter by specific log file
- **Level**: Filter by log level (debug, info, warning, error, etc.)
- **Environment**: Filter by environment (local, production, etc.)
- **Date**: Filter entries by specific date
- **Search**: Full-text search across messages and context

### Deletion

- **Single Entry**: Delete individual log entries
- **Bulk Delete**: Delete multiple selected entries
- **Bulk Delete by Filters**: Delete all entries matching current filters (with confirmation)

### Recursive Scanning

The package can scan subdirectories recursively:

```php
'scanning' => [
    'recursive' => true,
    'max_depth' => 10,
    'exclude_directories' => ['.git', 'node_modules', '.cache'],
],
```

## Configuration Options

### Log Directory

```php
'log_directory' => storage_path('logs'),
```

### Route Configuration

```php
'route' => [
    'prefix' => 'admin/system-logs',
    'middleware' => ['web', 'auth'],
    'name_prefix' => 'system-logs.',
],
```

### UI Configuration

```php
'ui' => [
    'layout' => 'layouts.app',
    'layout_type' => 'extend',
    'section_name' => 'content',
    'title' => 'System Logs',
],
```

### Filter Defaults

```php
'filters' => [
    'default_per_page' => 50,
    'min_per_page' => 10,
    'max_per_page' => 300,
    'default_max_files' => 3,
    'min_max_files' => 1,
    'max_max_files' => 20,
],
```

## API Routes

- `GET /admin/system-logs` - View log entries
- `DELETE /admin/system-logs` - Delete single entry
- `DELETE /admin/system-logs/bulk` - Bulk delete selected entries
- `DELETE /admin/system-logs/bulk-by-filters` - Bulk delete by filters

## Testing

```bash
./vendor/bin/phpunit
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Security

If you discover any security-related issues, please email imamhasan@example.com instead of using the issue tracker.

## License

MIT License. See [LICENSE](LICENSE) file for details.

## Author

**Imam Hasan**

- Website: [imamhasan.me](https://imamhasan.me)
- GitHub: [@imamhsn195](https://github.com/imamhsn195)
- LinkedIn: [in/imamhsn195](https://linkedin.com/in/imamhsn195)

## Support

If you find this package useful, please consider giving it a ⭐ on GitHub!

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.
