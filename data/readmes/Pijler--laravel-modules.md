# 📌 Laravel Modular Package

This package provides a simple yet powerful structure for organizing **Laravel** applications into **independent modules**, allowing for a cleaner, more scalable, and maintainable architecture.

Each module is a mini Laravel application with its own **routes**, **views**, **lang**, **configs**, **console**, **events**, **policies**, and **observers**, all automatically managed by the `ModuleServiceProvider`.

### 📦 Installation

Add the package to your Laravel project:

```bash
composer require pijler/laravel-modules
```

Make sure your `composer.json` autoload includes the `Modules\` namespace:

```json
"autoload": {
  "psr-4": {
    "Modules\\": "modules/"
  }
}
```

Then run:

```bash
composer dump-autoload
```

### 🧩 Module Structure

Each module should follow the structure below inside the `modules/` directory:

```
modules/
└── Blog/
    ├── app/
    │   ├── Console/
    │   │   └── Kernel.php
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   └── Middleware/
    │   └── Providers/
    │       ├── AppServiceProvider.php
    │       └── RouteServiceProvider.php
    ├── config/
    │   ├── config.php
    │   └── another.php
    ├── lang/
    │   ├── en-US.json
    │   └── pt_BR.json
    ├── resources/
    │   └── views/
    │       └── index.blade.php
    └── routes/
        └── web.php
```

### ⚙️ Module Registration

Each module must contain an `AppServiceProvider` that extends the base `ModuleServiceProvider` class.

Example:

```php
<?php

namespace Blog\Providers;

use Modules\ModuleServiceProvider;

class AppServiceProvider extends ModuleServiceProvider
{
    /**
     * The module slug.
     */
    protected string $slug = 'blog';

    /**
     * The module name.
     */
    protected string $module = 'Blog';

    /**
     * Boot the gates for the module.
     */
    protected function bootGates(): void
    {
        //
    }

    /**
     * Boot the events for the module.
     */
    protected function bootEvents(): void
    {
        //
    }

    /**
     * Boot the policies for the module.
     */
    protected function bootPolicies(): void
    {
        //
    }

    /**
     * Boot the observers for the module.
     */
    protected function bootObservers(): void
    {
        //
    }
}
```

Then, register the provider in `bootstrap/providers.php`:

```php
return [
    /*
     * Modules Service Providers...
     */
    Blog\Providers\AppServiceProvider::class,
];
```

Add a namespace mapping for the module in your `composer.json`:

```json
"autoload": {
  "psr-4": {
    "Blog\\": "modules/Blog/app/"
  }
}
```

### 🧠 Internal Functionality

The base `ModuleServiceProvider` automatically handles the booting of all module resources.

#### ✅ Views

Automatically loads views from:

```
resources/views
```

And makes them available under the module namespace (`$slug`):

```blade
@include('blog::index')
```

#### ✅ Translations

Supports both **JSON** and **PHP** translation files.

Automatically loads from:

```
lang/
```

Usage examples:

```php
trans('Hello world'); // JSON
trans('blog::messages.welcome'); // PHP
```

#### ✅ Configuration

Automatically loads and merges:

- A single `config.php` file
- Or multiple files inside the `config/` directory

They can be accessed via `config("{$slug}.key")`.

#### ✅ Commands & Schedule

If a `app/Console/Kernel.php` exists within the module, the provider:

- Registers **Artisan commands** located in the **/Commands** directory.
- Registers **scheduled tasks** defined in the `schedule(Schedule $schedule)` method.

Example:

```php
namespace Blog\Console;

use Illuminate\Console\Scheduling\Schedule;
use Modules\BaseKernel;

class Kernel extends BaseKernel
{
    /**
     * Define the application's command schedule.
     */
    public function schedule(Schedule $schedule): void
    {
        $schedule->command('blog:clean-posts')->daily();
    }

    /**
     * Register the commands for the application.
     */
    public function commands(): array
    {
        return $this->load(__DIR__.'/Commands');
    }
}
```

#### ✅ Dynamic Booting

The provider automatically attempts to execute the following methods, if they exist:

- `bootGates()`
- `bootEvents()`
- `bootPolicies()`
- `bootObservers()`

This allows additional resources to be registered without overriding `boot()`.

### 🔍 Helpers

#### `module_has(string $module): bool`

Checks if a module exists inside the `modules/` directory.

##### **Parameters**

| Name      | Type     | Description                      |
| --------- | -------- | -------------------------------- |
| `$module` | `string` | The name of the module to check. |

##### **Return**

| Type   | Description                                     |
| ------ | ----------------------------------------------- |
| `bool` | `true` if the module exists, `false` otherwise. |

##### **Example**

```php
if (module_has('Users')) {
    // The "Users" module exists
}
```

#### `module_path(string $module, string $path = ''): string`

Returns the full path to a module directory inside `modules/`.

##### **Parameters**

| Name      | Type     | Description                                   |
| --------- | -------- | --------------------------------------------- |
| `$module` | `string` | The name of the module.                       |
| `$path`   | `string` | Additional path within the module (optional). |

##### **Return**

| Type     | Description                                |
| -------- | ------------------------------------------ |
| `string` | The absolute path to the module directory. |

##### **Example**

```php
$path = module_path('Users');
// Returns something like: /var/www/app/modules/Users

$configPath = module_path('Users', 'config/module.php');
// Returns: /var/www/app/modules/Users/config/module.php
```

#### `module_component(string $component): string`

Returns the Vite/Inertia component path for module pages. The file extension comes from `config('inertia.page_extension', 'tsx')`. Add to your `config/inertia.php`:

```php
'page_extension' => env('INERTIA_PAGE_EXTENSION', 'tsx'),
```

### 🧩 Benefits

✅ Modular and independent organization  
✅ Automatic loading of configs, views, and translations  
✅ Native integration with Scheduler and Artisan  
✅ Dynamic boot for gates, policies, observers, and events  
✅ Fully compatible with the Laravel ecosystem

### 📝 License

Open-source under the [MIT license](LICENSE).

## 🚀 Thanks!
