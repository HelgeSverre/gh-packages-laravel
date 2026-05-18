# zairakai/laravel-eloquent

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![Packagist][packagist-badge]][packagist]
[![Downloads][downloads-badge]][packagist]
[![License][license-badge]][license]

[![PHP][php-badge]][php]
[![Laravel][laravel-badge]][laravel]
[![Static Analysis][phpstan-badge]][phpstan]
[![Code Style][pint-badge]][pint]

Eloquent base classes and helpers for safer column mapping, automatic table detection, and clean JSON serialization.

---

## Features

- **Column mapping** — map logical names to physical database column names via a `COLUMNS` constant
- **Relation mapping** — map logical names to Eloquent relationship methods via a `RELATIONS` constant
- **Scope mapping** — map logical names to Eloquent scope methods via a `SCOPES` constant
- **Automatic table detection** — derives table name from class name and namespace, no configuration needed
- **Primary key detection** — resolves from `PRIMARY_KEY` constant or `COLUMNS['id']`, defaults to `'id'`
- **Deprecated column tracking** — redirect renamed columns via `COLUMNS_DELETED` with automatic log warnings
- **Safe JSON serialization** — `toJson()`, `jsonSerialize()`, and `toReadableArray()` use logical column names
- **Transparent Eloquent API** — `fill()`, `getAttribute()`, `setAttribute()`, `isFillable()` resolve column names automatically
- **`BaseModel`** — ready-to-extend abstract model with all features pre-configured
- **`BasePivot`** — ready-to-extend abstract pivot class, non-incrementing by default
- **`BaseTable` trait** — use all features in any existing model without changing its base class
- **Configurable logging** — channel, level, backtrace depth, and per-model exclusions via `config/laravel-eloquent.php`
- **`eloquent:convert` command** — detect and convert existing `Model`/`Pivot` classes to `BaseModel`/`BasePivot`
- **Published stubs** — `model.stub`, `model.pivot.stub`, `model.plain.stub` for `make:model`

---

## Install

```bash
composer require zairakai/laravel-eloquent
```

---

## Usage

### Extend BaseModel

```php
use Zairakai\LaravelEloquent\Models\BaseModel;

class User extends BaseModel
{
    public const string ROUTE_PARAM = 'user';

    public const array COLUMNS = [
        'id'    => 'user_id',
        'email' => 'user_email',
        'name'  => 'full_name',
    ];

    public const array RELATIONS = [
        'roles' => 'roles',
    ];

    public const array SCOPES = [
        'suspended' => 'scopeSuspended',
    ];
}

// Eloquent methods use logical names transparently
User::where('email', 'alice@example.com')->first();
$user->fill(['name' => 'Alice']);
$user->getAttribute('email');

// Resolution helpers
User::resolveColumn('email');    // 'user_email'
User::resolveRelation('roles');  // 'roles'
User::resolveScope('suspended'); // 'scopeSuspended'
```

### Extend BasePivot

```php
use Zairakai\LaravelEloquent\Models\BasePivot;

class RoleUser extends BasePivot
{
    public const TABLE_NAME = 'role_user';

    public const COLUMNS = [
        'role_id' => 'fk_role',
        'user_id' => 'fk_user',
    ];
}
```

`BasePivot` is non-incrementing by default (`$incrementing = false`).

### Use the trait on an existing model

```php
use Illuminate\Database\Eloquent\Model;
use Zairakai\LaravelEloquent\Traits\BaseTable;

class Post extends Model
{
    use BaseTable;

    public const COLUMNS = [
        'id'    => 'post_id',
        'title' => 'post_title',
    ];
}
```

### Table name resolution

The table name is derived automatically. You can override it with `TABLE_NAME`:

```php
// App\Models\User → users
// App\Models\BlogPost → blog_posts
// App\Models\Shop\Product → shop_products  (namespace prefix)

class Invoice extends BaseModel
{
    public const TABLE_NAME = 'billing_invoices'; // explicit override
}
```

### Primary key resolution

Resolution order: `PRIMARY_KEY` constant → `COLUMNS['id']` value → `'id'` fallback.

```php
class Order extends BaseModel
{
    public const PRIMARY_KEY = 'order_uuid';
}

class Product extends BaseModel
{
    public const COLUMNS = [
        'id' => 'product_id', // resolved as primary key
    ];
}
```

### Deprecated column tracking

Rename a column in `COLUMNS` and keep the old key in `COLUMNS_DELETED` to redirect legacy code
with a log warning instead of silently breaking:

```php
class User extends BaseModel
{
    public const COLUMNS = [
        'id'       => 'user_id',
        'username' => 'login_name', // renamed column
    ];

    public const COLUMNS_DELETED = [
        'login' => 'username', // 'login' → redirects to 'username' + logs a warning
    ];
}

$user->getAttribute('login'); // resolves to 'login_name', logs deprecation warning
```

### Publish configuration

```bash
php artisan vendor:publish --tag=laravel-eloquent-config
```

Key options in `config/laravel-eloquent.php`:

| Key | Default | Description |
| :--- | :--- | :--- |
| `logging.enabled` | `true` | Enable/disable all column resolution logging. |
| `logging.channel` | `null` | Log channel (uses default Laravel channel if null). |
| `logging.levels.deprecated` | `'warning'` | Log level for deprecated column access. |
| `logging.levels.missing` | `'info'` | Log level for columns not found in `COLUMNS`. |
| `logging.include_backtrace` | `true` | Include call backtrace in log entries. |
| `logging.backtrace_depth` | `5` | Number of stack frames in the backtrace. |
| `logging.excluded_models` | `[]` | Model classes excluded from logging. |

### Publish stubs

```bash
php artisan vendor:publish --tag=laravel-eloquent-stubs
```

Published stubs: `stubs/model.stub`, `stubs/model.pivot.stub`, `stubs/model.plain.stub`.

### Convert existing models

Detect and convert all `Model` / `Pivot` classes in your `app/Models` directory:

```bash
# Preview changes without modifying files
php artisan eloquent:convert --dry-run

# Convert with confirmation prompt
php artisan eloquent:convert

# Convert a custom path without confirmation
php artisan eloquent:convert --path=app/Domain/Models --force
```

The command replaces `extends Model` with `extends BaseModel` and `extends Pivot` with
`extends BasePivot`, updates imports, and removes any manual `use BaseTable` statements.

---

## Development

```bash
make quality        # pint + phpstan + rector + insights + markdownlint + shellcheck
make quality-fast   # pint + phpstan + markdownlint
make test           # phpunit / pest
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md][contributing] for the project-specific workflow and quality standards.

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->
[pipeline-main-badge]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/commits/develop
[coverage-badge]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/-/commits/main
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/php-packages/laravel-eloquent?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/-/releases
[packagist-badge]: https://img.shields.io/packagist/v/zairakai/laravel-eloquent
[packagist]: https://packagist.org/packages/zairakai/laravel-eloquent
[downloads-badge]: https://img.shields.io/packagist/dt/zairakai/laravel-eloquent
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fphp-packages%2Flaravel-eloquent?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/php-packages/laravel-eloquent/-/issues
[php-badge]: https://img.shields.io/badge/php-8.4-blue?logo=php
[php]: https://www.php.net
[laravel-badge]: https://img.shields.io/badge/Laravel-12%20%7C%2013-red?logo=laravel
[laravel]: https://laravel.com
[phpstan-badge]: https://img.shields.io/badge/static%20analysis-phpstan-5B2C6F.svg?logo=php
[phpstan]: https://phpstan.org
[pint-badge]: https://img.shields.io/badge/code%20style-pint-22C55E.svg
[pint]: https://laravel.com/docs/pint
[ecosystem]: https://gitlab.com/zairakai
[contributing]: ./CONTRIBUTING.md
