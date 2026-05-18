# Laravel Settings Package

[![Latest Version](https://img.shields.io/packagist/v/jomigomes/laravel-settings.svg?style=flat-square)](https://packagist.org/packages/jomigomes/laravel-settings)
[![Total Downloads](https://img.shields.io/packagist/dt/jomigomes/laravel-settings.svg?style=flat-square)](https://packagist.org/packages/jomigomes/laravel-settings)
[![License](https://img.shields.io/packagist/l/jomigomes/laravel-settings.svg?style=flat-square)](https://packagist.org/packages/jomigomes/laravel-settings)

A flexible Laravel package for managing scoped, typed settings with a manifesto-based configuration approach.

## Features

- **Scoped Settings**: Associate settings with specific models or application segments
- **Type Safety**: Automatic type casting and validation for various data types
- **Manifesto-Based**: Single source of truth for settings structure and defaults
- **Default Values**: Settings are stored in config until changed, preventing database clutter
- **Flexible Organization**: Support for nested groups and dot notation access
- **Model Integration**: Easy integration with Eloquent models via the `HasSettings` trait
- **Events System**: Listen to setting lifecycle events (retrieved, created, updated, deleted)
- **Facade Support**: Clean API with `Settings` facade
- **CLI Commands**: Manage settings via artisan commands
- **Optional Caching**: Performance optimization with configurable cache layer

## Supported Types

- Integer
- Double
- Boolean
- String
- Array
- Collection (Illuminate\Support\Collection)
- Datetime (Carbon instances)
- Object

## Installation

Install the package via Composer:

```bash
composer require jomigomes/laravel-settings
```

Publish the configuration file:

```bash
php artisan vendor:publish --tag=settings-config
```

Publish and run the migration:

```bash
php artisan vendor:publish --tag=settings-migrations
php artisan migrate
```

## Configuration

The package uses a "manifesto" file (`config/settings.php`) as the single source of truth for all settings. Define your settings structure here:

```php
use JomiGomes\LaravelSettings\Models\Setting;

return [
    'system' => [
        'features' => [
            'enable_notifications' => [
                'value' => true,
                'type' => Setting::TYPE_BOOLEAN,
            ],
        ],
    ],
    
    'user' => [
        'preferences' => [
            'theme' => [
                'value' => 'light',
                'type' => Setting::TYPE_STRING,
            ],
        ],
    ],
];
```

## Usage

### Non-Model Related Settings

```php
use JomiGomes\LaravelSettings\Facades\Settings;
// Or use the model directly:
// use JomiGomes\LaravelSettings\Models\Setting;

// Get a setting
$setting = Settings::get('features.enable_notifications', 'system');

// Set a setting
Settings::set('features.enable_notifications', false, 'system');

// Get all settings for a scope
$allSettings = Settings::getAllScoped('system');

// Get filtered settings
$features = Settings::getFiltered('system', 'features');
```

### Model Related Settings

First, add the `HasSettings` trait to your model:

```php
use JomiGomes\LaravelSettings\Traits\HasSettings;

class User extends Model
{
    use HasSettings;
}
```

Then use settings with your model:

```php
$user = User::find(1);

// Get a setting
$theme = $user->getSetting('preferences.theme');

// Set a setting
$user->setSetting('preferences.theme', 'dark');

// Get all settings
$allSettings = $user->getAllSettings();

// Get filtered settings
$preferences = $user->getFilteredSettings('preferences');
```

### Events

Listen to setting changes in your `EventServiceProvider`:

```php
use JomiGomes\LaravelSettings\Events\SettingUpdated;

protected $listen = [
    SettingUpdated::class => [
        LogSettingChange::class,
    ],
];
```

Available events:
- `SettingRetrieved` - Fired when a setting is accessed
- `SettingCreated` - Fired when a new setting is stored
- `SettingUpdated` - Fired when an existing setting changes
- `SettingDeleted` - Fired when a setting reverts to default

### Artisan Commands

```bash
# List all settings
php artisan settings:list

# List settings for a specific scope
php artisan settings:list user

# List with filter
php artisan settings:list user --filter=preferences

# Show only customized settings
php artisan settings:list user --only-custom

# Clear all customized settings
php artisan settings:clear --force

# Clear settings for a scope
php artisan settings:clear user

# Clear with filter
php artisan settings:clear user --filter=preferences
```

### Caching

Enable caching for improved performance in your `.env`:

```env
SETTINGS_CACHE_ENABLED=true
SETTINGS_CACHE_TTL=3600
```

Or in `config/settings.php`:

```php
'cache' => [
    'enabled' => true,
    'ttl' => 3600, // seconds
],
```

## Documentation

For complete documentation, see the [Settings.md](docs/Settings.md) file included in this package.

## Testing

```bash
composer test
```

## License

This package is open-sourced software licensed under the MIT license.

## Credits

Created by João Gomes
