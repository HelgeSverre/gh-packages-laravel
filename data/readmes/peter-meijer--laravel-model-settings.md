# Laravel Model Settings

A flexible and type-safe settings package for Laravel models. This package allows you to attach settings to any Eloquent model without adding columns to your table. It supports different groups, types (string, boolean, integer, float, array), and custom definitions using Enums or classes.

## Features

- **Eloquent Integration**: Attach settings to any model via a simple trait.
- **Type Safety**: Built-in support for multiple data types with automatic casting.
- **Organization**: Group settings to keep things organized.
- **Enum Support**: Use PHP Enums to define your settings for better IDE support and type safety.
- **Performance**: Eager-loads settings to avoid N+1 query problems.
- **Configurable**: Easily customize default groups and type aliases.

## Installation

You can install the package via composer:

```bash
composer require petermeijer/laravel-model-settings
```

The service provider will automatically register itself.

You should publish and run the migrations with:

```bash
php artisan vendor:publish --tag="model-settings-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="model-settings-config"
```

## Usage

### 1. Prepare your Model

Add the `HasSettingsInterface` and `HasSettings` trait to your model:

```php
use Illuminate\Database\Eloquent\Model;
use PeterMeijer\LaravelModelSettings\Concerns\HasSettings;
use PeterMeijer\LaravelModelSettings\Contracts\HasSettingsInterface;

class User extends Model implements HasSettingsInterface
{
    use HasSettings;
}
```

### 2. Basic Usage (String keys)

You can set and get settings using simple string keys. The type will be inferred when setting the value.

```php
$user = User::first();

// Set settings
$user->settings()->set('theme', 'dark');
$user->settings()->set('notifications_enabled', true);
$user->settings()->set('login_count', 5);

// Get settings
$theme = $user->settings()->string('theme'); // 'dark'
$enabled = $user->settings()->boolean('notifications_enabled'); // true
$logins = $user->settings()->integer('login_count'); // 5

// Check existence
if ($user->settings()->has('theme')) {
    // ...
}
```

### 3. Using Settings Groups

You can organize settings into groups:

```php
$user->settings('profile')->set('color', 'blue');
$color = $user->settings('profile')->string('color'); // 'blue'

// Or via the fluent API
$user->settings()->group('profile')->set('color', 'red');
```

### 4. Advanced Usage (Setting Definitions)

For better type safety and organization, you can define settings using Enums or classes that implement `ModelSettingDefinition`.

```php
use PeterMeijer\LaravelModelSettings\Contracts\ModelSettingDefinition;

enum UserSetting: string implements ModelSettingDefinition
{
    case Theme = 'theme';
    case Notifications = 'notifications';

    public function key(): string { return $this->value; }
    public function type(): string {
        return match($this) {
            self::Theme => 'string',
            self::Notifications => 'boolean',
        };
    }
    public function group(): string { return 'default'; }
}

// Usage with Enums
$user->settings()->set(UserSetting::Theme, 'light');
$theme = $user->settings()->string(UserSetting::Theme);
```

### 5. Available Methods

The `settings()` accessor provides many helpful methods (inspired by Laravel's `InteractsWithData` trait):

- `set($key, $value)`
- `string($key, $default = '')`
- `boolean($key, $default = false)`
- `integer($key, $default = 0)`
- `float($key, $default = 0.0)`
- `array($key)`
- `date($key, $format = null, $tz = null)`
- `enum($key, $enumClass, $default = null)`
- `str($key)` (returns `Illuminate\Support\Stringable`)
- `has($key)`
- `missing($key)`
- `all()`
- `only($keys)`
- `except($keys)`

## Configuration

The configuration file allows you to change the default group and define type aliases:

```php
return [
    'default_group' => 'default',
    
    'type_mappings' => [
        'default' => 'string',
        'types' => [
            'boolean' => ['bool', 'boolean'],
            'integer' => ['int', 'integer'],
            // ...
        ],
    ],
];
```

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
