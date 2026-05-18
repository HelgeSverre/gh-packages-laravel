# Laravel Modular

A Laravel package for modular architecture with optional Filament v4 support, pattern inference, and reusable module generation.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/kz370/laravel-modular.svg?style=flat-square)](https://packagist.org/packages/kz370/laravel-modular)
[![License](https://img.shields.io/packagist/l/kz370/laravel-modular.svg?style=flat-square)](https://packagist.org/packages/kz370/laravel-modular)

## Features

- 🧩 **Modular Architecture** - Build reusable, self-contained modules
- 🔍 **Pattern Inference** - Automatically detects your project patterns
- ⚡ **Filament v4 Support** - Optional Filament resource generation
- 🌐 **Multi-language** - Auto-generates translation files for your locales
- 🔄 **Module Renaming** - Safely rename modules with full reference updates
- ⚙️ **Highly Configurable** - Customize everything via config file
- 📦 **Works with nwidart/laravel-modules** - Extends the popular module package

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- nwidart/laravel-modules 11.x or 12.x
- (Optional) Filament 3.x for Filament resource generation

## Installation

```bash
composer require kz370/laravel-modular
```

The package auto-discovers, so no manual provider registration is needed.

### Publish Configuration

```bash
php artisan vendor:publish --tag=laravel-modular-config
```

### Publish Stubs (Optional)

To customize the generated file templates:

```bash
php artisan vendor:publish --tag=laravel-modular-stubs
```

## Quick Start

### Create a Module

```bash
# Basic module
php artisan modular:make Blog

# With Filament resources (if Filament is installed)
php artisan modular:make Blog --with-filament

# Preview what would be created
php artisan modular:make Blog --dry-run
```

### List Modules

```bash
php artisan modular:list

# Filter by status
php artisan modular:list --status=enabled
```

### Rename a Module

```bash
# Rename with confirmation
php artisan modular:rename Blog Articles

# Preview changes first
php artisan modular:rename Blog Articles --dry-run

# Skip confirmation
php artisan modular:rename Blog Articles --force
```

## Configuration

After publishing the config, customize `config/laravel-modular.php`:

### Auto-Detection

```php
// Enable/disable pattern auto-detection
'auto_detect_patterns' => true,
```

### Filament Configuration

```php
'filament' => [
    'enabled' => true,
    'layout' => 'nested',           // 'nested' or 'flat'
    'generate_form_schemas' => true,
    'generate_table_classes' => true,
    'subdirectories' => ['Pages', 'Schemas', 'Tables'],
    'default_icon' => 'heroicon-o-rectangle-stack',
],
```

### Module Structure

Define which directories to generate:

```php
'structure' => [
    'app/Models' => true,
    'app/Policies' => true,
    'app/Filament/Resources' => true,
    'database/migrations' => true,
    'database/seeders' => true,
    'lang' => true,
    // ... more options
],

// Add custom directories
'custom_directories' => [
    'app/Domain/ValueObjects' => true,
    'app/Domain/Enums' => true,
],
```

### Locales

```php
// Auto-detect from project, or specify manually
'locales' => null, // or ['en', 'ar', 'es']
```

### Model Options

```php
'models' => [
    'use_translatable' => true,  // Spatie Translatable support
    'use_soft_deletes' => false,
    'use_uuids' => false,
],
```

### Policy Options

```php
'policies' => [
    'base_class' => 'App\\Policies\\BasePolicy', // or null
    'auto_register' => true,
],
```

## Filament Integration

If Filament is installed, the package generates resources that follow your project's patterns:

1. Create a module with Filament resources:
   ```bash
   php artisan modular:make Products --with-filament
   ```

2. Register in your Panel Provider:
   ```php
   use Modules\Products\Providers\ProductsServiceProvider;

   public function panel(Panel $panel): Panel
   {
       return $panel
           // ... other config
           ->discoverResources(
               in: module_path('Products', 'app/Filament/Resources'),
               for: 'Modules\\Products\\Filament\\Resources'
           );
       
       // Or use the helper method:
       // ProductsServiceProvider::registerFilament($panel);
   }
   ```

## Generated Structure

A module created with `--with-filament` will have this structure:

```
Modules/
└── Products/
    ├── app/
    │   ├── Filament/
    │   │   └── Resources/
    │   │       └── ProductResource/
    │   │           ├── ProductResource.php
    │   │           ├── Pages/
    │   │           │   ├── CreateProduct.php
    │   │           │   ├── EditProduct.php
    │   │           │   └── ListProducts.php
    │   │           ├── Schemas/
    │   │           │   └── ProductForm.php
    │   │           └── Tables/
    │   │               └── ProductTable.php
    │   ├── Models/
    │   ├── Policies/
    │   ├── Providers/
    │   │   ├── ProductsServiceProvider.php
    │   │   └── RouteServiceProvider.php
    │   └── Http/
    │       └── Controllers/
    ├── config/
    │   └── config.php
    ├── database/
    │   ├── factories/
    │   ├── migrations/
    │   └── seeders/
    ├── lang/
    │   ├── en/
    │   │   └── products.php
    │   └── ar/
    │       └── products.php
    ├── routes/
    │   ├── api.php
    │   └── web.php
    └── composer.json
```

## Commands

| Command | Description |
|---------|-------------|
| `modular:make {name}` | Create a new module |
| `modular:rename {old} {new}` | Rename an existing module |
| `modular:list` | List all modules |

### modular:make Options

| Option | Description |
|--------|-------------|
| `--with-filament` | Generate Filament resources |
| `--plain` | Create minimal module structure |
| `--force` | Overwrite existing module |
| `--dry-run` | Preview without creating |

### modular:rename Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes |
| `--force` | Skip confirmation |
| `--no-backup` | Skip backup creation |

## Working with nwidart/laravel-modules

This package works alongside nwidart/laravel-modules. You can still use all their commands:

```bash
# Enable/disable modules
php artisan module:enable Products
php artisan module:disable Products

# Run migrations
php artisan module:migrate Products

# Generate components
php artisan module:make-model Product Products
php artisan module:make-controller ProductController Products
```

## Testing

```bash
composer test
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for recent changes.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

The MIT License (MIT). See [LICENSE.md](LICENSE.md) for more information.

## Credits

- [KZ370](https://github.com/kz370)
- [nwidart/laravel-modules](https://github.com/nWidart/laravel-modules)
- [Filament](https://filamentphp.com)
