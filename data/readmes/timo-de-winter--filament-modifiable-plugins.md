# Filament Modifiable Plugins

[![Latest Version on Packagist](https://img.shields.io/packagist/v/timo-de-winter/filament-modifiable-plugins.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/filament-modifiable-plugins)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/timo-de-winter/filament-modifiable-plugins/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/timo-de-winter/filament-modifiable-plugins/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/timo-de-winter/filament-modifiable-plugins/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/timo-de-winter/filament-modifiable-plugins/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/timo-de-winter/filament-modifiable-plugins.svg?style=flat-square)](https://packagist.org/packages/timo-de-winter/filament-modifiable-plugins)

A powerful package for creating highly customizable Filament plugins. This package empowers plugin developers to provide end-users with extensive customization options for resources, including navigation, forms, tables, clusters, and more.

## Why Use This Package?

When building Filament plugins that provide resources or pages, you often want to give developers using your plugin the flexibility to customize various aspects such as:

- Navigation properties (labels, icons, groups, sorting)
- Page features (titles, slugs, schemas/forms)
- Table components (columns, filters, actions)
- Resource organization (clusters, parent items)
- Tenant ownership relationships
- And much more!

This package provides a clean, fluent API to make all of these customizations possible without requiring plugin users to override entire resource classes.

## Requirements

- PHP 8.3+
- Laravel 11.x or 12.x
- Filament 4.1+ or 5.0+

## Installation

Install the package via Composer:

```bash
composer require timo-de-winter/filament-modifiable-plugins
```

No additional configuration or publishing is required. The package will auto-register via Laravel's package discovery.

## Table of Contents

- [For Plugin Users](#for-plugin-users)
  - [Basic Customization](#basic-customization)
  - [Navigation Customization](#navigation-customization)
  - [Page Customization](#page-customization)
  - [Form/Schema Customization](#formschema-customization)
  - [Table Customization](#table-customization)
  - [Targeting Specific Resources](#targeting-specific-resources)
- [For Plugin Developers](#for-plugin-developers)
  - [Setting Up Your Plugin](#setting-up-your-plugin)
  - [Implementing Modifiable Resources](#implementing-modifiable-resources)
  - [Best Practices](#best-practices)

---

## For Plugin Users

If you've installed a Filament plugin that uses this package, you can easily customize the plugin's resources without modifying the plugin's source code.

### Basic Customization

Here's a comprehensive example showing all available customization options:

```php
use Filament\Panel;
use YourVendor\YourPlugin\YourPlugin;
use YourVendor\YourPlugin\Resources\UserResource;
use App\Filament\Clusters\Settings;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            YourPlugin::make()
                // Navigation customization
                ->navigationGroup('Settings', UserResource::class)
                ->label('System Users', UserResource::class)
                ->sort(10, UserResource::class)
                ->icon('heroicon-o-users', UserResource::class)
                ->activeIcon('heroicon-s-users', UserResource::class)
                ->badge('New', UserResource::class)
                ->badgeColor('success', UserResource::class)
                ->badgeTooltip('Recently added users', UserResource::class)

                // Cluster and organization
                ->cluster(Settings::class, UserResource::class)
                ->parentItem('user-management', UserResource::class)

                // Page customization
                ->title('Manage Users', UserResource::class)
                ->slug('system-users', UserResource::class)

                // Multi-tenancy
                ->tenantOwnershipRelationshipName('organization', UserResource::class)
        ]);
}
```

### Navigation Customization

Control how resources appear in your Filament panel's navigation:

```php
YourPlugin::make()
    ->navigationGroup('Settings', UserResource::class)
    ->label('Users', UserResource::class)
    ->sort(5, UserResource::class)
    ->icon('heroicon-o-users', UserResource::class)
    ->activeIcon('heroicon-s-users', UserResource::class)
    ->badge('12', UserResource::class)
    ->badgeColor('warning', UserResource::class)
```

All navigation methods support closures for dynamic values:

```php
YourPlugin::make()
    ->badge(fn () => User::count(), UserResource::class)
    ->badgeColor(fn () => User::count() > 100 ? 'danger' : 'success', UserResource::class)
```

### Page Customization

Customize page titles, slugs, and organization:

```php
YourPlugin::make()
    ->title('User Management', UserResource::class)
    ->slug('manage-users', UserResource::class)
    ->cluster(Settings::class, UserResource::class)
    ->parentItem('system', UserResource::class)
```

### Form/Schema Customization

Customize the form schema used in your resource's create and edit pages:

```php
use Filament\Schemas\Schema;
use Filament\Schemas\Components\TextInput;
use Filament\Schemas\Components\Select;

YourPlugin::make()
    ->schema(function (Schema $schema) {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->email()
                    ->required(),
                Select::make('role')
                    ->options([
                        'admin' => 'Administrator',
                        'user' => 'User',
                    ])
                    ->required(),
            ]);
    }, UserResource::class)
```

### Table Customization

Customize table columns, filters, and actions:

```php
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteAction;

YourPlugin::make()
    // Customize specific table elements
    ->columns([
        TextColumn::make('name')->searchable(),
        TextColumn::make('email')->searchable(),
        TextColumn::make('created_at')->dateTime(),
    ], UserResource::class)
    ->filters([
        SelectFilter::make('role')
            ->options([
                'admin' => 'Admin',
                'user' => 'User',
            ]),
    ], UserResource::class)
    ->recordActions([
        EditAction::make(),
        DeleteAction::make(),
    ], UserResource::class)
    ->toolbarActions([
        // Your toolbar/bulk actions here
    ], UserResource::class)
```

Alternatively, override the entire table configuration:

```php
use Filament\Tables\Table;

YourPlugin::make()
    ->customTable(function (Table $table) {
        return $table
            ->columns([
                // Your columns
            ])
            ->filters([
                // Your filters
            ])
            ->recordActions([
                // Your actions
            ])
            ->toolbarActions([
                // Your toolbar actions
            ]);
    }, UserResource::class)
```

### Targeting Specific Resources

When a plugin provides multiple resources, you can target specific ones by passing the resource class as the second parameter:

```php
use YourVendor\YourPlugin\Resources\UserResource;
use YourVendor\YourPlugin\Resources\RoleResource;

YourPlugin::make()
    // Customize UserResource
    ->navigationGroup('User Management', UserResource::class)
    ->icon('heroicon-o-users', UserResource::class)

    // Customize RoleResource
    ->navigationGroup('User Management', RoleResource::class)
    ->icon('heroicon-o-shield-check', RoleResource::class)

    // This applies to all resources without specific customization
    ->sort(10)
```

### Custom Relations and Pages

Override the relations and pages for a resource:

```php
use YourVendor\YourPlugin\Resources\UserResource\RelationManagers\RolesRelationManager;
use YourVendor\YourPlugin\Resources\UserResource\Pages;

YourPlugin::make()
    ->customRelations([
        RolesRelationManager::class,
        // Your custom relation managers
    ], UserResource::class)
    ->customPages([
        'index' => Pages\ListUsers::class,
        'create' => Pages\CreateUser::class,
        'edit' => Pages\EditUser::class,
        // Your custom pages
    ], UserResource::class)
```

---

## For Plugin Developers

If you're developing a Filament plugin and want to make your resources customizable, follow these steps.

### Setting Up Your Plugin

#### 1. Add the Trait to Your Plugin Class

Add the `CanModifyResources` trait to your plugin class:

```php
<?php

namespace YourVendor\YourPlugin;

use Filament\Contracts\Plugin;
use Filament\Panel;
use TimoDeWinter\FilamentModifiablePlugins\Concerns\CanModifyResources;

class YourPlugin implements Plugin
{
    use CanModifyResources;

    public function getId(): string
    {
        return 'your-plugin-id';
    }

    public function register(Panel $panel): void
    {
        $panel->resources([
            Resources\UserResource::class,
            Resources\RoleResource::class,
        ]);
    }

    public function boot(Panel $panel): void
    {
        //
    }

    public static function make(): static
    {
        return app(static::class);
    }
}
```

### Implementing Modifiable Resources

#### 1. Add the Trait to Your Resource

Add the `CanBeModified` trait to each resource you want to make customizable:

```php
<?php

namespace YourVendor\YourPlugin\Resources;

use Filament\Resources\Resource;
use TimoDeWinter\FilamentModifiablePlugins\Concerns\CanBeModified;

class UserResource extends Resource
{
    use CanBeModified;

    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    // Your resource implementation...
}
```

#### 2. Implement Customizable Forms/Schemas

Use the `getCustomSchema()` method to allow form customization:

```php
use Filament\Schemas\Schema;
use Filament\Schemas\Components\TextInput;

public static function schema(Schema $schema): Schema
{
    return self::getCustomSchema($schema, function (Schema $schema) {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->email()
                    ->required(),
                // Your default schema components...
            ]);
    });
}
```

#### 3. Implement Customizable Tables

Use the `getCustomTable()` method with `CustomizableTable` for table customization:

```php
use Filament\Tables\Table;
use TimoDeWinter\FilamentModifiablePlugins\CustomizableTable;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TrashedFilter;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteAction;

public static function table(Table $table): Table
{
    return self::getCustomTable($table, function (CustomizableTable $table) {
        return $table
            ->defaultColumns([
                TextColumn::make('id')->sortable(),
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('email')->searchable(),
                TextColumn::make('created_at')->dateTime(),
            ])
            ->defaultFilters([
                TrashedFilter::make(),
            ])
            ->defaultRecordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->defaultToolbarActions([
                // Your default toolbar actions
            ]);
    });
}
```

#### 4. Implement Customizable Relations

Use the `getCustomRelations()` method:

```php
public static function getRelations(): array
{
    return self::getCustomRelations([
        RelationManagers\RolesRelationManager::class,
        // Your default relation managers...
    ]);
}
```

#### 5. Implement Customizable Pages

Use the `getCustomPages()` method:

```php
public static function getPages(): array
{
    return self::getCustomPages([
        'index' => Pages\ListUsers::class,
        'create' => Pages\CreateUser::class,
        'edit' => Pages\EditUser::class,
        // Your default pages...
    ]);
}
```

### Best Practices

1. **Always provide sensible defaults** - Your resources should work perfectly out of the box even if users don't customize them.

2. **Use the helper methods consistently** - Always use `getCustomSchema()`, `getCustomTable()`, etc., in your resources to ensure customizations are applied.

3. **Document customization options** - Let your users know which resources can be customized and provide examples in your plugin's documentation.

4. **Test with customizations** - Include tests that verify customizations work correctly.

5. **Use type hints** - The package fully supports IDE autocompletion and type checking.

### Complete Resource Example

Here's a complete example of a properly implemented modifiable resource:

```php
<?php

namespace YourVendor\YourPlugin\Resources;

use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\TextInput;
use Filament\Tables\Table;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Actions\DeleteAction;
use TimoDeWinter\FilamentModifiablePlugins\Concerns\CanBeModified;
use TimoDeWinter\FilamentModifiablePlugins\CustomizableTable;
use YourVendor\YourPlugin\Models\User;

class UserResource extends Resource
{
    use CanBeModified;

    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';

    protected static ?string $navigationGroup = 'Users';

    public static function schema(Schema $schema): Schema
    {
        return self::getCustomSchema($schema, function (Schema $schema) {
            return $schema
                ->components([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255),
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true),
                ]);
        });
    }

    public static function table(Table $table): Table
    {
        return self::getCustomTable($table, function (CustomizableTable $table) {
            return $table
                ->defaultColumns([
                    TextColumn::make('id')->sortable(),
                    TextColumn::make('name')->searchable()->sortable(),
                    TextColumn::make('email')->searchable(),
                    TextColumn::make('created_at')->dateTime()->sortable(),
                ])
                ->defaultFilters([
                    //
                ])
                ->defaultRecordActions([
                    EditAction::make(),
                    DeleteAction::make(),
                ])
                ->defaultToolbarActions([
                    //
                ]);
        });
    }

    public static function getRelations(): array
    {
        return self::getCustomRelations([
            //
        ]);
    }

    public static function getPages(): array
    {
        return self::getCustomPages([
            'index' => Pages\ListUsers::class,
            'create' => Pages\CreateUsers::class,
            'edit' => Pages\EditUsers::class,
        ]);
    }
}
```

---

## Available Methods Reference

### For Plugin Users (via Plugin Class)

| Method | Description |
|--------|-------------|
| `navigationGroup($group, $resource)` | Set the navigation group |
| `label($label, $resource)` | Set the navigation label |
| `sort($order, $resource)` | Set the navigation sort order |
| `icon($icon, $resource)` | Set the navigation icon |
| `activeIcon($icon, $resource)` | Set the active navigation icon |
| `badge($badge, $resource)` | Set the navigation badge |
| `badgeColor($color, $resource)` | Set the navigation badge color |
| `badgeTooltip($tooltip, $resource)` | Set the navigation badge tooltip |
| `parentItem($parent, $resource)` | Set the navigation parent item |
| `cluster($cluster, $resource)` | Set the resource cluster |
| `title($title, $resource)` | Set the page title |
| `slug($slug, $resource)` | Set the resource slug |
| `tenantOwnershipRelationshipName($name, $resource)` | Set tenant ownership relationship |
| `schema($callback, $resource)` | Customize the form schema |
| `columns($columns, $resource)` | Set table columns |
| `filters($filters, $resource)` | Set table filters |
| `recordActions($actions, $resource)` | Set table record actions |
| `toolbarActions($actions, $resource)` | Set table toolbar actions |
| `customTable($callback, $resource)` | Override entire table configuration |
| `customRelations($relations, $resource)` | Set custom relation managers |
| `customPages($pages, $resource)` | Set custom pages |

All methods support closures for dynamic values and accept an optional resource class as the second parameter.

### For Plugin Developers (via Resource Trait)

| Method | Description |
|--------|-------------|
| `getCustomSchema($schema, $default)` | Get customized schema or default |
| `getCustomTable($table, $default)` | Get customized table or default |
| `getCustomRelations($default)` | Get customized relations or default |
| `getCustomPages($default)` | Get customized pages or default |

---

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Fix code style issues:

```bash
composer format
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Security Vulnerabilities

If you discover a security vulnerability within this package, please send an e-mail to Timo de Winter via [info@timodw.nl](mailto:info@timodw.nl). All security vulnerabilities will be promptly addressed.

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Timo de Winter](https://github.com/timo-de-winter)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Support

If you find this package helpful, please consider:

- Starring the repository
- [Sponsoring the development](https://github.com/sponsors/timo-de-winter)
- Sharing it with others who might benefit from it

For issues, questions, or suggestions, please use the [GitHub issue tracker](https://github.com/timo-de-winter/filament-modifiable-plugins/issues).
