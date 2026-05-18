# Laravel Model Utils

[![Latest Version on Packagist](https://img.shields.io/packagist/v/hindbiswas/laravel-model-utils.svg?style=flat-square)](https://packagist.org/packages/hindbiswas/laravel-model-utils)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/hindbiswas/laravel-model-utils/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/hind-sagar-biswas/laravel-model-utils/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/hindbiswas/laravel-model-utils/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/hind-sagar-biswas/laravel-model-utils/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/hindbiswas/laravel-model-utils.svg?style=flat-square)](https://packagist.org/packages/hindbiswas/laravel-model-utils)

A lightweight Laravel package that adds practical Eloquent model traits and utilities.

## Installation

```bash
composer require hindbiswas/laravel-model-utils
```

## Requirements

- PHP 8.3+
- Laravel 11, 12, or 13

## Included Features

- `BelongsToAuth`: auto-assign `user_id` when an authenticated user creates a model.
- `Optionable`: convert model records to `value`/`label` option arrays.
- `Filterable`: dynamic exact filters plus relationship-aware search with dot notation.
- `HasSlug`: generate slugs from model attributes with optional uniqueness and update behavior.
- `Archivable`: archive/restore records with query scopes for active and archived models.
- `EnumUtil`: convert PHP enums to arrays, CSV, associative maps, and options.

## Usage

### BelongsToAuth Trait

```php
use HindBiswas\ModelUtils\Traits\BelongsToAuth;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use BelongsToAuth;

    protected $guarded = [];
}
```

Behavior:

- If `user_id` is empty and a user is authenticated, `user_id` is filled from `Auth::id()`.
- If `user_id` is already present, it is not overridden.

### Optionable Trait

```php
use HindBiswas\ModelUtils\Traits\Optionable;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use Optionable;

    protected $guarded = [];
}
```

```php
Category::options();
// [
//   ['value' => 1, 'label' => 'Books'],
//   ['value' => 2, 'label' => 'Games'],
// ]
```

You can override the columns used for options:

```php
protected static function optionValue(): string
{
    return 'code';
}

protected static function optionLabel(): string
{
    return 'title';
}
```

### Filterable Trait

```php
use HindBiswas\ModelUtils\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use Filterable;

    protected $guarded = [];

    protected array $filterable = [
        'status',
        'author.name',
        'author.organization.name',
    ];

    protected array $searchable = [
        'title',
        'author.name',
        'author.organization.name',
    ];
}
```

```php
$articles = Article::query()->filter([
    'status' => 'published',
    'author.name' => 'Alice',
    'search' => 'Laravel',
])->get();
```

Notes:

- Exact filters use `where` and `whereHas`.
- Search uses grouped `orWhere` and `orWhereHas` with `%search%` matching.
- Dot notation supports nested relations like `owner.user.name`.

### HasSlug Trait

```php
use HindBiswas\ModelUtils\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasSlug;

    protected $guarded = [];

    protected function slugSource(): array
    {
        return ['title'];
    }

    protected function slugUniqueScope(): array|bool
    {
        return true;
    }

    protected function updateSlugOnUpdate(): bool
    {
        return true;
    }
}
```

Available hooks:

- `slugField()`: slug column name (default: `slug`).
- `slugSource()`: source attributes used to build slug.
- `slugUniqueScope()`: controls uniqueness.
  - `false`: no uniqueness checks.
  - `true`: unique across table.
  - `['tenant_id']`: unique within a scope.
- `maxSlugLength()`: maximum slug length (default: `255`).
- `updateSlugOnUpdate()`: regenerate slug when source fields change.

`getRouteKeyName()` returns `slugField()`.

### Archivable Trait

```php
use HindBiswas\ModelUtils\Traits\Archivable;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use Archivable;

    protected $guarded = [];
}
```

Your table should have an `archived_at` nullable datetime column.

```php
Schema::table('documents', function (Blueprint $table) {
    $table->dateTime('archived_at')->nullable();
});
```

```php
$document->archive();
$document->restoreArchive();
$document->isArchived();

Document::query()->onlyArchived()->get();
Document::query()->withArchived()->get();
```

Behavior:

- Active records are returned by default because a global scope excludes archived rows.
- `onlyArchived()` fetches only archived records.
- `withArchived()` fetches both active and archived records.
- `archived_at` is cast to `datetime` automatically.

### EnumUtil Helper

```php
use HindBiswas\ModelUtils\Utils\EnumUtil;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
}

EnumUtil::toArray(OrderStatus::class);
// ['draft', 'published']

EnumUtil::toCSV(OrderStatus::class);
// 'draft,published'

EnumUtil::toAssocArray(OrderStatus::class);
// ['draft' => 'Draft', 'published' => 'Published']

EnumUtil::toOptions(OrderStatus::class);
// [
//   ['value' => 'draft', 'label' => 'Draft'],
//   ['value' => 'published', 'label' => 'Published'],
// ]
```

If enum cases implement a `label()` method, `EnumUtil` uses it. Otherwise, labels are generated using `Str::headline(...)`.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for details.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Hind Biswas Krishna](https://github.com/hind-sagar-biswas)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
