# Pico Settings

A lightweight Laravel package for managing key-value settings. Supports global, user-specific, and model-specific scopes with optional JSON file caching.

**Requirements:** PHP 8.3+ · Laravel 11 or 12 or 13

---

## Installation

```bash
composer require pico/settings
```

Publish the config file:

```bash
php artisan vendor:publish --tag=pico-settings-config
```

Generate and run the migration:

```bash
php artisan pico:settings-table-migration
php artisan migrate
```

This creates a timestamped `create_settings_table` migration in your `database/migrations/` directory.

If you want to customise the stub before generating, publish it first:

```bash
php artisan vendor:publish --tag=pico-settings-stubs
```

The stub will be placed at `stubs/pico-settings/create_settings_table.stub` and `pico:settings-table-migration` will use it automatically.

---

## Configuration

`config/pico-settings.php`

```php
return [

    // The table name used for the users foreign key
    'user_table' => 'users',

    'cache' => [
        // Enable JSON file caching (recommended for production)
        'enabled' => true,

        // Directory where per-scope JSON cache files are stored
        'path' => storage_path('app/pico-settings'),
    ],

];
```

---

## Usage

### Facade

```php
use Pico\Settings\Facades\Settings;
```

### Helper function

```php
settings()
```

---

### Global settings

```php
// Set a single value
Settings::set('maintenance_mode', 'false');

// Set multiple values at once
Settings::set(['theme' => 'dark', 'locale' => 'en']);

// Get a single value (with optional default)
Settings::get('theme');            // 'dark'
Settings::get('missing', 'light'); // 'light'

// Get multiple values at once
Settings::get(['theme', 'locale']);
// ['theme' => 'dark', 'locale' => 'en']
```

---

### User-specific settings

```php
$user = auth()->user();

Settings::for($user)->set('locale', 'fr');
Settings::for($user)->set(['locale' => 'fr', 'timezone' => 'Europe/Paris']);

Settings::for($user)->get('locale');             // 'fr'
Settings::for($user)->get('missing', 'en');      // 'en'
Settings::for($user)->get(['locale', 'timezone']);
// ['locale' => 'fr', 'timezone' => 'Europe/Paris']
```

---

### Model-specific settings

```php
use App\Models\Post;

Settings::model(Post::class)->set('per_page', '20');
Settings::model(Post::class)->get('per_page'); // '20'
```

You can also pass a model instance:

```php
$post = Post::find(1);
Settings::model($post)->set('featured', 'true');
```

---

### Combined scope (user + model)

```php
Settings::for($user)->model(Post::class)->set('view', 'grid');
Settings::for($user)->model(Post::class)->get('view'); // 'grid'

// Scopes are isolated — other scopes are unaffected
Settings::for($user)->get('view');              // null
Settings::model(Post::class)->get('view');      // null
```

---

### Using the helper

```php
settings()->for($user)->model(Post::class)->get('view', 'list');
settings()->for($user)->set(['locale' => 'en', 'timezone' => 'UTC']);
```

---

### Deleting settings

```php
// Delete a single key
Settings::delete('theme');

// Delete multiple keys
Settings::delete(['theme', 'locale']);

// Delete all keys in the current scope
Settings::delete();

// Delete within a user scope
Settings::for($user)->delete('locale');

// Delete within a combined user + model scope
Settings::for($user)->model(Post::class)->delete('view');
```

Deleting only affects the targeted scope — other scopes are left untouched.

---

## Caching

When caching is enabled, settings are stored in JSON files under `storage/app/pico-settings/` (configurable). Each scope gets its own file:

| Scope | File |
|---|---|
| Global | `global.json` |
| User only | `user_1.json` |
| Model only | `model_posts.json` |
| User + model | `user_1_model_posts.json` |

On every `set()` call, the database is written first and then the cache file is rebuilt. On the first `get()` after boot (cache miss), the full scope is loaded from DB and written to the cache.

### Clearing the cache

To delete all JSON cache files at once:

```bash
php artisan pico:clear
```

To disable caching (e.g. in tests):

```php
// config/pico-settings.php
'cache' => [
    'enabled' => false,
],
```

---

## Database schema

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | Primary key |
| `user_id` | bigint (nullable) | FK → users table |
| `model` | string (nullable) | Fully-qualified class name |
| `key` | string | Setting key |
| `value` | longText | Setting value |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

A unique constraint is enforced on `(user_id, model, key)`.
