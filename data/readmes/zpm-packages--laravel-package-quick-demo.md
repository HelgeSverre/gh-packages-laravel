# Laravel Package Quick Demo

Reusable quick-demo installer for Laravel packages.

`zpmlabs/laravel-package-quick-demo` lets Laravel package authors ship isolated demo environments inside any host Laravel application.

It is built for packages that want a “try it now” experience without asking users to manually copy files, edit `.env`, create database connections, register routes, or pollute their main application database.

With this package, a user can install a package demo with one command:

```bash
php artisan quick-demo:install blog-demo
```

---

## Features

* Isolated SQLite database per demo.
* Runtime Laravel database connection per demo.
* Demo migrations.
* Demo seeders.
* Demo routes.
* Demo route prefixes and route name prefixes.
* Demo Blade view namespaces.
* Demo view publishing.
* Demo asset publishing.
* Demo storage file publishing.
* Demo config file publishing.
* Install hooks.
* Uninstall hooks.
* Safe uninstall command.
* Config-based and runtime-based demo registration.

---

## Installation

Install the package:

```bash
composer require zpmlabs/laravel-package-quick-demo
```

Publish the config file if needed:

```bash
php artisan vendor:publish --tag=package-quick-demo-config
```

This publishes:

```txt
config/package-quick-demo.php
```

---

## Configuration

Default config:

```php
<?php

return [
    'database_directory' => database_path('quick-demos'),

    'default_database_stub' => null,

    'connection_prefix' => 'quick_demo_',

    'route_prefix' => 'quick-demo',

    'route_name_prefix' => 'quick-demo.',

    'route_middleware' => ['web'],

    'views_directory' => resource_path('views/vendor/quick-demos'),

    'assets_directory' => public_path('vendor/quick-demos'),

    'storage_directory' => storage_path('app/quick-demos'),

    'config_directory' => config_path('quick-demos'),

    'demos' => [
        // Config-based demo definitions may be placed here.
    ],
];
```

Most package authors do not need users to publish this config. Demos can be registered directly from a package service provider.

---

## Basic usage in another package

Example package: `vendor/blog-package`.

Inside the package service provider:

```php
<?php

namespace Vendor\BlogPackage;

use Illuminate\Support\ServiceProvider;
use ZPMLabs\LaravelPackageQuickDemo\Facades\QuickDemo;
use ZPMLabs\LaravelPackageQuickDemo\Support\DemoDefinition;

class BlogPackageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        QuickDemo::register(
            DemoDefinition::make(
                key: 'blog-demo',
                name: 'Blog Demo',
                databaseName: 'blog_demo',
                databaseStubPath: __DIR__ . '/../examples/database/demo.sqlite.stub',
                migrationsPath: __DIR__ . '/../examples/migrations',
                seeders: [
                    \Vendor\BlogPackage\Database\Seeders\BlogDemoSeeder::class,
                ],
                routesPath: __DIR__ . '/../examples/routes/demo.php',
                viewsPath: __DIR__ . '/../examples/views',
                assetsPath: __DIR__ . '/../examples/assets',
                storagePath: __DIR__ . '/../examples/storage',
                configPath: __DIR__ . '/../examples/config/demo.php',
            )
        );
    }
}
```

Then the user runs:

```bash
php artisan quick-demo:install blog-demo
```

---

## Minimal database-only demo

A demo does not need routes, views, assets, storage, or config.

For a database-only demo, register only database, migrations, and seeders:

```php
QuickDemo::register(
    DemoDefinition::make(
        key: 'users-demo',
        name: 'Users Demo',
        databaseName: 'users_demo',
        databaseStubPath: __DIR__ . '/../examples/database/demo.sqlite.stub',
        migrationsPath: __DIR__ . '/../examples/migrations',
        seeders: [
            \Vendor\UsersPackage\Database\Seeders\UsersDemoSeeder::class,
        ],
    )
);
```

Install it:

```bash
php artisan quick-demo:install users-demo
```

This creates a separate SQLite database and runs only the configured migrations and seeders.

---

## Full demo package structure

Recommended structure for a package that ships a complete mini demo app:

```txt
blog-package/
  composer.json
  src/
    BlogPackageServiceProvider.php
    Http/
      Controllers/
        BlogDemoController.php
    Models/
      DemoPost.php
    Database/
      Seeders/
        BlogDemoSeeder.php
  examples/
    database/
      demo.sqlite.stub
    migrations/
      2026_01_01_000001_create_demo_posts_table.php
    routes/
      demo.php
    views/
      index.blade.php
      show.blade.php
    assets/
      demo.css
      demo.js
    storage/
      images/
        demo-cover.jpg
    config/
      demo.php
```

---

## Commands

List all registered demos:

```bash
php artisan quick-demo:list
```

Show details for one demo:

```bash
php artisan quick-demo:show blog-demo
```

Install a demo:

```bash
php artisan quick-demo:install blog-demo
```

Reinstall a demo from scratch:

```bash
php artisan quick-demo:install blog-demo --fresh
```

Reinstall from scratch and overwrite generated files:

```bash
php artisan quick-demo:install blog-demo --fresh --force
```

Skip migrations:

```bash
php artisan quick-demo:install blog-demo --no-migrate
```

Skip seeders:

```bash
php artisan quick-demo:install blog-demo --no-seed
```

Skip view publishing:

```bash
php artisan quick-demo:install blog-demo --no-views
```

Skip asset publishing:

```bash
php artisan quick-demo:install blog-demo --no-assets
```

Skip storage publishing:

```bash
php artisan quick-demo:install blog-demo --no-storage
```

Skip config publishing:

```bash
php artisan quick-demo:install blog-demo --no-config
```

Uninstall generated demo files:

```bash
php artisan quick-demo:uninstall blog-demo
```

Drop only the generated SQLite database:

```bash
php artisan quick-demo:uninstall blog-demo --drop-database
```

Remove everything generated by the demo:

```bash
php artisan quick-demo:uninstall blog-demo --all --force
```

---

## SQLite database isolation

Every registered demo gets its own SQLite database.

For example:

```php
databaseName: 'blog_demo'
```

creates:

```txt
database/quick-demos/blog_demo.sqlite
```

The package also registers a runtime Laravel connection:

```txt
quick_demo_blog_demo
```

Another package can register:

```php
databaseName: 'users_demo'
```

which creates:

```txt
database/quick-demos/users_demo.sqlite
```

and registers:

```txt
quick_demo_users_demo
```

These databases are independent.

The package does not modify `.env` and does not require users to edit `config/database.php`.

---

## SQLite stub files

Each demo can provide a SQLite stub file:

```txt
examples/database/demo.sqlite.stub
```

The stub may be:

* an empty SQLite file,
* a prebuilt SQLite database with schema,
* a prebuilt SQLite database with schema and demo data.

Recommended approach:

* keep the stub empty,
* create schema through migrations,
* create sample data through seeders.

Create an empty stub:

```bash
mkdir -p examples/database
touch examples/database/demo.sqlite.stub
```

---

## Demo migrations

Every demo migration should explicitly use the quick-demo connection.

`examples/migrations/2026_01_01_000001_create_demo_posts_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use ZPMLabs\LaravelPackageQuickDemo\Facades\QuickDemo;

return new class extends Migration
{
    public function getConnection(): string
    {
        return QuickDemo::connectionName('blog-demo');
    }

    public function up(): void
    {
        Schema::connection($this->getConnection())->create('demo_posts', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->text('body')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->getConnection())->dropIfExists('demo_posts');
    }
};
```

This prevents demo tables from being created in the host application's default database.

---

## Demo seeders

Every demo seeder should write to the quick-demo connection.

`src/Database/Seeders/BlogDemoSeeder.php`

```php
<?php

namespace Vendor\BlogPackage\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use ZPMLabs\LaravelPackageQuickDemo\Facades\QuickDemo;

class BlogDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection(QuickDemo::connectionName('blog-demo'))
            ->table('demo_posts')
            ->insert([
                [
                    'title' => 'First demo post',
                    'body' => 'This post belongs to the isolated quick demo database.',
                    'is_published' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'Draft demo post',
                    'body' => 'This is another demo record.',
                    'is_published' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
    }
}
```

---

## Demo models

Demo models should use the quick-demo connection.

`src/Models/DemoPost.php`

```php
<?php

namespace Vendor\BlogPackage\Models;

use Illuminate\Database\Eloquent\Model;
use ZPMLabs\LaravelPackageQuickDemo\Facades\QuickDemo;

class DemoPost extends Model
{
    protected $table = 'demo_posts';

    protected $guarded = [];

    public function getConnectionName(): string
    {
        return QuickDemo::connectionName('blog-demo');
    }
}
```

---

## Demo routes

A package can provide routes for a demo UI.

`examples/routes/demo.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use Vendor\BlogPackage\Http\Controllers\BlogDemoController;

Route::get('/', [BlogDemoController::class, 'index'])->name('index');
Route::get('/posts/{post}', [BlogDemoController::class, 'show'])->name('show');
```

The package automatically mounts these routes under a safe prefix:

```txt
/quick-demo/blog-demo
```

Route names are prefixed too:

```txt
quick-demo.blog_demo.index
quick-demo.blog_demo.show
```

This avoids collisions with the host application.

---

## Demo controller

Example controller:

```php
<?php

namespace Vendor\BlogPackage\Http\Controllers;

use Vendor\BlogPackage\Models\DemoPost;

class BlogDemoController
{
    public function index()
    {
        return view('quick-demo-blog-demo::index', [
            'posts' => DemoPost::query()->latest()->get(),
        ]);
    }

    public function show(DemoPost $post)
    {
        return view('quick-demo-blog-demo::show', [
            'post' => $post,
        ]);
    }
}
```

---

## Demo views

A package can ship Blade views in:

```txt
examples/views
```

Example:

```txt
examples/views/index.blade.php
examples/views/show.blade.php
```

Views are registered under a generated namespace:

```txt
quick-demo-blog-demo
```

Usage:

```php
return view('quick-demo-blog-demo::index', [
    'posts' => $posts,
]);
```

When installed, views are published to:

```txt
resources/views/vendor/quick-demos/blog-demo
```

The published path is checked first. The package source path is used as fallback.

---

## Demo assets

A package can ship demo assets in:

```txt
examples/assets
```

Example:

```txt
examples/assets/demo.css
examples/assets/demo.js
```

Assets are published to:

```txt
public/vendor/quick-demos/blog-demo
```

Usage in Blade:

```blade
<link rel="stylesheet" href="{{ asset('vendor/quick-demos/blog-demo/demo.css') }}">
<script src="{{ asset('vendor/quick-demos/blog-demo/demo.js') }}" defer></script>
```

---

## Demo storage files

A package can ship sample storage files in:

```txt
examples/storage
```

Example:

```txt
examples/storage/images/demo-cover.jpg
```

Files are copied to:

```txt
storage/app/quick-demos/blog-demo
```

Usage:

```php
storage_path('app/quick-demos/blog-demo/images/demo-cover.jpg')
```

---

## Demo config files

A package can ship a demo config file:

```txt
examples/config/demo.php
```

It is copied to:

```txt
config/quick-demos/blog-demo.php
```

The package does not modify existing application config files.

---

## Config-based demo registration

Demos may also be registered through `config/package-quick-demo.php`.

```php
'demos' => [
    'blog-demo' => [
        'name' => 'Blog Demo',
        'database_name' => 'blog_demo',
        'database_stub_path' => base_path('vendor/vendor/blog-package/examples/database/demo.sqlite.stub'),
        'migrations_path' => base_path('vendor/vendor/blog-package/examples/migrations'),
        'seeders' => [
            \Vendor\BlogPackage\Database\Seeders\BlogDemoSeeder::class,
        ],
        'routes_path' => base_path('vendor/vendor/blog-package/examples/routes/demo.php'),
        'views_path' => base_path('vendor/vendor/blog-package/examples/views'),
        'assets_path' => base_path('vendor/vendor/blog-package/examples/assets'),
        'storage_path' => base_path('vendor/vendor/blog-package/examples/storage'),
        'config_path' => base_path('vendor/vendor/blog-package/examples/config/demo.php'),
    ],
],
```

Runtime registration from a package service provider is usually preferred.

---

## Install and uninstall hooks

A demo can run custom logic before or after installation and uninstallation.

```php
DemoDefinition::make(
    key: 'blog-demo',
    name: 'Blog Demo',
    databaseName: 'blog_demo',
    beforeInstall: \Vendor\BlogPackage\Demo\BeforeInstallBlogDemo::class,
    afterInstall: \Vendor\BlogPackage\Demo\AfterInstallBlogDemo::class,
    beforeUninstall: \Vendor\BlogPackage\Demo\BeforeUninstallBlogDemo::class,
    afterUninstall: \Vendor\BlogPackage\Demo\AfterUninstallBlogDemo::class,
)
```

Hook classes should have a `handle` method:

```php
<?php

namespace Vendor\BlogPackage\Demo;

use ZPMLabs\LaravelPackageQuickDemo\Support\QuickDemoContext;

class AfterInstallBlogDemo
{
    public function handle(QuickDemoContext $context): void
    {
        // Custom demo setup logic.
    }
}
```

The context contains useful information:

```php
$context->definition;
$context->databasePath;
$context->connectionName;
$context->routePrefix;
$context->routeNamePrefix;
$context->viewNamespace;
$context->assetsDestination;
$context->storageDestination;
$context->configDestination;
$context->options;
```

Hooks can also be closures or callable arrays.

```php
DemoDefinition::make(
    key: 'blog-demo',
    name: 'Blog Demo',
    databaseName: 'blog_demo',
    afterInstall: function (QuickDemoContext $context): void {
        // Custom logic.
    },
)
```

---

## Safe uninstall behavior

By default, uninstall does not remove everything automatically.

```bash
php artisan quick-demo:uninstall blog-demo
```

Use specific flags:

```bash
php artisan quick-demo:uninstall blog-demo --drop-database
php artisan quick-demo:uninstall blog-demo --remove-views
php artisan quick-demo:uninstall blog-demo --remove-assets
php artisan quick-demo:uninstall blog-demo --remove-storage
php artisan quick-demo:uninstall blog-demo --remove-config
```

Remove everything:

```bash
php artisan quick-demo:uninstall blog-demo --all --force
```

---

## Generated paths

For demo key:

```txt
blog-demo
```

and database name:

```txt
blog_demo
```

Generated paths are:

```txt
database/quick-demos/blog_demo.sqlite
resources/views/vendor/quick-demos/blog-demo
public/vendor/quick-demos/blog-demo
storage/app/quick-demos/blog-demo
config/quick-demos/blog-demo.php
```

Generated route prefix:

```txt
/quick-demo/blog-demo
```

Generated route name prefix:

```txt
quick-demo.blog_demo.
```

Generated view namespace:

```txt
quick-demo-blog-demo
```

Generated connection:

```txt
quick_demo_blog_demo
```

---

## Recommended naming

Good demo keys:

```txt
blog-demo
users-demo
orders-demo
```

Avoid vague keys:

```txt
demo
example
test
```

Good database names:

```txt
blog_demo
users_demo
orders_demo
```

Good table names:

```txt
demo_posts
demo_users
demo_orders
```

Avoid using real application table names for demo tables:

```txt
posts
users
orders
```

---

## Safety rules

This package is designed to avoid polluting the host Laravel application.

It does not require users to:

* edit `.env`,
* edit `config/database.php`,
* edit `routes/web.php`,
* create a database connection manually,
* copy demo files manually.

Package authors should avoid:

* writing demo tables into the default database,
* registering unprefixed routes,
* using generic route names,
* publishing files directly into root public/resource/storage folders,
* overwriting files without `--force`,
* using generic demo keys.

---

## Testing a demo locally

From a Laravel test application:

```bash
composer require vendor/blog-package
php artisan quick-demo:list
php artisan quick-demo:show blog-demo
php artisan quick-demo:install blog-demo --fresh --force
php artisan serve
```

Open:

```txt
http://localhost:8000/quick-demo/blog-demo
```

Validate:

```bash
php artisan route:list
```

Check that:

* the demo route is prefixed,
* the demo route names are prefixed,
* the SQLite database exists,
* migrations ran on the quick-demo connection,
* seeders inserted demo data,
* views render correctly,
* assets load correctly,
* storage files were copied if configured,
* config file was copied if configured,
* the host default database was not modified.

---

## License

MIT
