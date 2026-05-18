# Filament System Configuration

[![run-tests](https://github.com/skylence-be/filament-system-configuration/actions/workflows/run-tests.yml/badge.svg)](https://github.com/skylence-be/filament-system-configuration/actions/workflows/run-tests.yml)

A flexible system configuration management plugin for Filament 4 with sidebar navigation.

## Requirements

- PHP 8.2+
- Laravel 11+
- Filament 4.0+
- [skylence/filament-context-sidebar](../filament-context-sidebar)

## Installation

```bash
composer require skylence/filament-system-configuration
```

Publish the config file:

```bash
php artisan vendor:publish --tag="filament-system-configuration-config"
```

Run migrations:

```bash
php artisan migrate
```

## Basic Usage

### 1. Register the Plugin

Add the plugin to your Filament panel provider:

```php
use Skylence\FilamentSystemConfiguration\FilamentSystemConfigurationPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            FilamentSystemConfigurationPlugin::make()
                ->sections([
                    \App\Config\Sections\GeneralSection::class,
                    \App\Config\Sections\SalesSection::class,
                ])
                ->sidebarGroups([
                    'General' => ['general'],
                    'Sales' => ['sales', 'tax'],
                ]),
        ]);
}
```

### 2. Create Configuration Sections

Create a section class that returns a `ConfigSection`:

```php
<?php

namespace App\Config\Sections;

use Skylence\FilamentSystemConfiguration\Config\ConfigField;
use Skylence\FilamentSystemConfiguration\Config\ConfigGroup;
use Skylence\FilamentSystemConfiguration\Config\ConfigSection;

class GeneralSection
{
    public static function make(): ConfigSection
    {
        return ConfigSection::make('general')
            ->label('General')
            ->icon('heroicon-o-cog-6-tooth')
            ->sort(10)
            ->groups([
                ConfigGroup::make('store_information')
                    ->label('Store Information')
                    ->icon('heroicon-o-building-storefront')
                    ->description('Basic information about your store')
                    ->fields([
                        ConfigField::make('store_name')
                            ->label('Store Name')
                            ->text()
                            ->required()
                            ->placeholder('Enter your store name')
                            ->helperText('This name will be displayed in emails.')
                            ->sort(10),

                        ConfigField::make('store_email')
                            ->label('Store Email')
                            ->email()
                            ->required()
                            ->sort(20),

                        ConfigField::make('enable_notifications')
                            ->label('Enable Notifications')
                            ->toggle()
                            ->default(true)
                            ->usedInCode()
                            ->sort(30),
                    ]),
            ]);
    }
}
```

### 3. Access Configuration Values

Use the `ConfigService` to retrieve values:

```php
use Skylence\FilamentSystemConfiguration\Services\ConfigService;

// In a service or controller
$configService = app(ConfigService::class);

// Get a single value with a default fallback
$storeName = $configService->get('general/store_information/store_name', 'My Store');

// Get multiple values
$settings = $configService->getMany([
    'general/store_information/store_name',
    'general/store_information/store_email',
]);

// Set a value
$configService->set('general/store_information/store_name', 'New Store Name');
$configService->clearCache();

// Set multiple values
$configService->setMany([
    'general/store_information/store_name' => 'New Store',
    'general/store_information/store_email' => 'new@example.com',
]);
```

## Configuration

### Permissions

By default, the plugin uses two permissions:
- `view_system_configuration` - to view the configuration page
- `update_system_configuration` - to save configuration changes

Disable permission checking by setting to `false`:

```php
// config/filament-system-configuration.php
'permissions' => [
    'view' => false,
    'update' => false,
],
```

### Sidebar Groups

Define how sections appear in the sidebar:

```php
'sidebar' => [
    'title' => 'Configuration',
    'description' => 'System Settings',
    'groups' => [
        'General' => ['general', 'design', 'currency'],
        'Sales' => ['sales', 'tax', 'shipping'],
        'Advanced' => ['features', 'system'],
    ],
],
```

### Default Values

Set default values for configuration paths:

```php
'defaults' => [
    'general/store_information/store_name' => 'My Store',
    'general/locale_options/currency' => 'USD',
],
```

## Field Types

The plugin supports these field types:

| Type | Method | Description |
|------|--------|-------------|
| Text | `->text()` | Single line text input |
| Textarea | `->textarea()` | Multi-line text input |
| Select | `->select($options)` | Dropdown selection |
| MultiSelect | `->multiSelect($options)` | Multiple selection |
| Toggle | `->toggle()` | Boolean toggle switch |
| Number | `->number()` | Numeric input |
| Email | `->email()` | Email input with validation |
| Password | `->password()` | Password input (encrypted) |
| Color | `->color()` | Color picker |
| ColorPalette | `->colorPalette($options)` | Color selection from palette |
| Image | `->image()` | Image upload |
| RichEditor | `->richEditor()` | WYSIWYG editor |
| Info | `->info()` | Read-only display field |

## Field Options

```php
ConfigField::make('example')
    ->label('Example Field')
    ->text()
    ->required()
    ->default('default value')
    ->placeholder('Enter value...')
    ->helperText('Help text shown below field')
    ->rules(['min:3', 'max:100'])
    ->encrypted()                    // Encrypt value in database
    ->systemValueOption(false)       // Disable "Use system value" checkbox
    ->usedInCode()                   // Show "Used in code" indicator
    ->visible(fn () => true)         // Conditional visibility
    ->sort(10);                      // Display order
```

## Events

The plugin dispatches events you can listen to:

```php
// Listen for configuration changes
Event::listen('config.saved', function ($path, $value) {
    // Handle configuration change
});
```

## Testing

```bash
composer test
```

## License

MIT License
