# laravel-refactor

Rename or move PHP classes in your Laravel project and automatically update every reference across PHP files, Blade templates, routes, config files, and service providers.

## Installation

```bash
composer require shan/laravel-refactor --dev
```

Laravel auto-discovers the service provider. Optionally publish the config:

```bash
php artisan vendor:publish --tag=laravel-refactor-config
```

## Usage

### Rename a class

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member"
```

### Move a class to a new namespace

```bash
php artisan refactor:move "App\Models\User" "App\Domain\Users\User"
```

### Preview changes without applying (dry-run)

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member" --dry-run
```

### Undo the last operation

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member" --rollback
```

### Override a naming conflict

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member" --force
```

## What gets updated

| Reference type | Example |
|---|---|
| `use` statements | `use App\Models\User;` |
| `new` instantiations | `new User()` |
| `extends` / `implements` | `class Admin extends User` |
| Type hints & return types | `function store(User $user): User` |
| Static calls | `User::find(1)` |
| `::class` constant | `User::class` |
| Service provider bindings | `$app->bind(User::class, ...)` |
| Route controllers | `[UserController::class, 'index']` |
| Blade `@inject` | `@inject('u', 'App\Models\User')` |
| Quoted FQCN strings in Blade | `'App\Models\User'` |

## Configuration

```php
// config/laravel-refactor.php

return [
    'scan_paths' => [
        'app',
        'routes',
        'config',
        'resources/views',
        'database',
        'tests',
    ],

    'excluded_paths' => [
        'vendor',
        'node_modules',
        'storage',
        'bootstrap/cache',
    ],

    'backup_path' => 'storage/app/refactor-backups',
];
```

## How it works

1. **Validates** that the source class exists via PSR-4 mappings in `composer.json`
2. **Detects conflicts** — errors out if the target class already exists
3. **Scans** all configured paths using an AST parser ([nikic/php-parser](https://github.com/nikic/PHP-Parser)) for PHP files and regex for Blade templates
4. **Snapshots** all affected files for rollback
5. **Updates** all references in-place
6. **Renames/moves** the source file and updates its `namespace` / `class` declaration
7. Runs `composer dump-autoload` automatically

## Error: class already exists

```
ERROR: Class App\Models\Member already exists at app/Models/Member.php
Rename aborted. Use --force to override (dangerous).
```

## Testing locally before publishing

You can test the package against a real Laravel project before pushing to Packagist.

### 1. Create a fresh Laravel project (or use an existing one)

```bash
composer create-project laravel/laravel my-test-app
cd my-test-app
```

### 2. Point Composer at your local package

Add a `path` repository to `composer.json` in the Laravel project:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "../laravel-refactor"
        }
    ]
}
```

The `url` is the path from the Laravel project to the package directory — adjust it to match your folder layout.

### 3. Install the package

```bash
composer require shan/laravel-refactor:@dev --dev
```

Composer creates a symlink to your local package. Any change you make in `laravel-refactor/src/` is immediately reflected — no need to reinstall.

### 4. Create test fixtures

Create a few classes and references to exercise the different scenarios:

```bash
# Source class
php artisan make:model User

# A class that references it
php artisan make:controller UserController
```

Open `app/Http/Controllers/UserController.php` and add a reference:

```php
use App\Models\User;

class UserController extends Controller
{
    public function index(): User
    {
        return new User();
    }
}
```

Optionally add a Blade template:

```bash
echo "@inject('user', 'App\Models\User')" > resources/views/users/show.blade.php
```

### 5. Run through the checklist

**Dry-run first — never skip this step:**

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member" --dry-run
```

Expected output: a list of every file and line that would change. No files are modified.

**Apply the rename:**

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member"
```

Check that:
- `app/Models/User.php` no longer exists
- `app/Models/Member.php` exists with `class Member` and `namespace App\Models`
- `app/Http/Controllers/UserController.php` now has `use App\Models\Member` and `Member` everywhere
- `resources/views/users/show.blade.php` references `App\Models\Member`
- `composer dump-autoload` ran automatically (verify with `php artisan tinker` → `App\Models\Member::class`)

**Roll back:**

```bash
php artisan refactor:rename "App\Models\User" "App\Models\Member" --rollback
```

Check that all files are back to their original state.

**Move (namespace change):**

```bash
php artisan refactor:move "App\Models\Member" "App\Domain\Users\Member"
```

Check that:
- `app/Domain/Users/Member.php` exists (directory was created)
- `namespace App\Domain\Users;` is in the file
- `app/Http/Controllers/UserController.php` imports `use App\Domain\Users\Member`

**Conflict detection:**

```bash
php artisan refactor:rename "App\Models\Post" "App\Models\Member"
```

Expected: an error saying `Member` already exists. Then:

```bash
php artisan refactor:rename "App\Models\Post" "App\Models\Member" --force
```

**Publish and customise config:**

```bash
php artisan vendor:publish --tag=laravel-refactor-config
```

Open `config/laravel-refactor.php` and add a path to `scan_paths` (e.g. `'src'`). Re-run a dry-run to confirm the new path is scanned.

### 6. Run the package's own test suite

Back in the `laravel-refactor` directory:

```bash
./vendor/bin/pest --no-coverage
```

All 79 tests should be green before publishing.

---

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12

## License

MIT
