# Starter

[![codecov](https://codecov.io/gh/patrikjak/starter/graph/badge.svg?token=kaq2yLG9xq)](https://codecov.io/gh/patrikjak/starter)

## Installation

Install the package via Composer:

```bash
composer require patrikjak/starter
```

## Documentation

- [Web header Components](docs/metadata-header.md) - Documentation for the web header component
- [Configuration](docs/config.md) - Documentation for all available configuration options
- [Permissions](docs/permissions.md) - How to add and manage permissions
- [Extensibility](docs/extensibility.md) - How to extend DTOs, repositories, and form requests

## Setup

After installing the package, add the package provider to the providers array in bootstrap/providers.php.

```php
use Patrikjak\Starter\StarterServiceProvider;
use Patrikjak\Utils\UtilsServiceProvider;
use Patrikjak\Auth\AuthServiceProvider;

return [
    ...
    UtilsServiceProvider::class,
    AuthServiceProvider::class,
    StarterServiceProvider::class,
];
```

You need to have installed and configured `patrikjak/utils` and `patrikjak/auth` packages.

For fast setup, you can run this command:

```bash
php artisan install:pjstarter
```

It will publish assets, views and config file.

If you don't publish config file, you will miss all features of this package. I recommend add this script to your `composer.json` file:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan vendor:publish --tag=pjstarter-assets --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-config --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-views --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-migrations --ansi --force"
    ]
}
```

All post-update-cmd can look like this:

```json
"scripts": {
    "post-update-cmd": [
        "@php artisan vendor:publish --tag=pjutils-config --ansi --force",
        "@php artisan vendor:publish --tag=pjutils-assets --ansi --force",
        "@php artisan vendor:publish --tag=pjutils-translations --ansi --force",
        "@php artisan vendor:publish --tag=pjauth-assets --ansi --force",
        "@php artisan vendor:publish --tag=pjauth-config --ansi --force",
        "@php artisan vendor:publish --tag=pjauth-migrations --ansi",
        "@php artisan vendor:publish --tag=pjstarter-assets --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-config --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-views --ansi --force",
        "@php artisan vendor:publish --tag=pjstarter-migrations --ansi --force"
    ]
}
```

Adjust it to your needs. Be aware that --force flag will overwrite existing files.

## Database Setup

### 1. Configure Auth Model

Set the user model in `config/auth.php`:

```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => Patrikjak\Starter\Models\Users\User::class,
    ],
],
```

### 2. Run Migrations

```bash
php artisan migrate
```

### 3. Seed Roles and Permissions

The setup order matters - permissions must exist before they can be assigned to roles.

```bash
# Create roles (SUPERADMIN, ADMIN, USER) from the auth package
php artisan pjauth:sync-roles

# Sync permissions to database (creates all permissions defined in PermissionsDefinition)
php artisan pjstarter:permissions:sync
```

### 4. Seed Application Data

Create your own seeders for roles with permissions, users, and content. The recommended seeder order:

1. **RoleSeeder** - Assign permissions to roles (roles are created by `pjauth:sync-roles`, permissions by `pjstarter:permissions:sync`)
2. **UserSeeder** - Create users with role assignments
3. **Content seeders** - Authors, article categories, articles, static pages, etc.

### Quick Reset

```bash
php artisan migrate:fresh --force && php artisan pjauth:sync-roles && php artisan pjstarter:permissions:sync && php artisan db:seed
```

## Feature Toggles

Enable or disable features in `config/pjstarter.php`:

```php
'features' => [
    'auth' => true,           // Authentication (false = open access, auth routes return 404)
    'dashboard' => true,      // Dashboard page
    'profile' => true,        // User profile and password change
    'static_pages' => false,  // Static pages with metadata and slugs
    'articles' => false,      // Articles, categories, and authors
    'users' => false,         // User, role, and permission management
],
```

When `auth` is set to `false`:
- Auth routes (`/login`, `/register`, `/password/*`) return 404
- Admin routes are accessible without authentication
- All authorization checks are bypassed
- Profile and change-password routes are disabled