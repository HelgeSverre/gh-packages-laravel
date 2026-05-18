# Laravel Hierarchical Multi-Scope Settings

A powerful, enterprise-ready Laravel package for managing application-level and user-level settings with hierarchical scope inheritance, caching, and automatic value casting.

## Features

- **Multi-Scope Support**: Global, User, Team, Company, or any custom scope.
- **Hierarchical Inheritance**: Define fallback chains (e.g., User -> Team -> Global).
- **Dot Notation**: Access nested settings easily (`settings()->get('ui.theme.color')`).
- **Automatic Casting**: Supports integer, float, boolean, array, object, json, and string.
- **Cache-Friendly**: Built-in caching layer with automatic invalidation.
- **Model Integration**: Simple trait to add settings capability to any Eloquent model.

## Installation

You can install the package via composer:

```bash
composer require hatchyu/laravel-settings
```

### Run Migrations

The package requires two tables: `setting_definitions` and `setting_values`.

```bash
php artisan migrate
```

## Configuration

The package automatically registers its Service Provider. If you need to manually register it, add this to `config/app.php`:

```php
'providers' => [
    Hatchyu\Settings\SettingsServiceProvider::class,
],
```

## Basic Usage

### Global Settings

Use the `settings()` helper or the `Settings` facade:

```php
use Hatchyu\Settings\Facades\Settings;

// Set a global setting
settings()->set('app.name', 'My Super App');

// Get a global setting
$name = settings()->get('app.name'); // 'My Super App'

// Get with default value
$theme = settings()->get('ui.theme', 'light');
```

### Nested Retrieval

If you have multiple settings under a prefix, you can retrieve them as an array:

```php
settings()->set('ui.theme', 'dark');
settings()->set('ui.language', 'en');

$ui = settings()->get('ui'); 
// Returns: ['ui.theme' => 'dark', 'ui.language' => 'en']
```

---

## Scoped Settings

The real power of this package lies in its ability to handle different scopes (User, Team, Project, etc.).

### 1. Prepare your Model

Implement the `SettingsScope` contract and use the `HasSettings` trait in your model:

```php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Hatchyu\Settings\Contracts\SettingsScope;
use Hatchyu\Settings\Traits\HasSettings;

class User extends Authenticatable implements SettingsScope
{
    use HasSettings;

    /**
     * Define the fallback hierarchy for this model.
     * When a setting isn't found for the user, it checks these scopes in order.
     */
    public function getSettingsFallbackScopes(): array
    {
        return [
            $this->team,    // Check team settings first
            $this->company, // Then check company settings
        ];
    }
}
```

### 2. Using Scoped Settings

```php
$user = User::find(1);

// Set a setting specifically for this user
settings()->scope($user)->set('ui.theme', 'dark');

// Retrieve it (it will look at User -> Team -> Company -> Global)
$theme = settings()->scope($user)->get('ui.theme');

// You can also use the trait method directly on the model
$user->settings()->set('notifications.email', true);
$user->settings()->get('notifications.email');
```

---

## Technical Details

### Setting Definitions

Settings are stored in two parts:
1. **Definitions**: Defines the key, data type, and default value.
2. **Values**: Stores the actual value for a specific scope.

When you use `set()`, the package automatically creates a definition if it doesn't exist, inferring the data type.

### Supported Data Types

The package automatically casts values based on the definition's `data_type`:
- `integer`, `float`, `boolean`, `array`, `object`, `json`, `string`.

### Caching

Settings are cached for 60 minutes (3600 seconds) by default. The cache is automatically cleared for a specific key when that key is updated via `set()` or removed via `forget()`.

---

## API Reference

### `SettingsManager` / `settings()` helper

| Method | Description |
| --- | --- |
| `scope(SettingsScope $scope)` | Returns a new manager instance focused on the given scope. |
| `get(string $key, $default = null)` | Retrieve a setting value. |
| `set(string $key, $value)` | Store a setting value for the current scope. |
| `has(string $key)` | Check if a setting exists in the current scope chain. |
| `forget(string $key)` | Remove a setting value for the current scope. |
| `all(?string $prefix = null)` | Retrieve all settings (optionally filtered by prefix). |

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
