# Laravel Scout Relations

[![Latest Version on Packagist](https://img.shields.io/packagist/v/foxws/laravel-scout-relations.svg?style=flat-square)](https://packagist.org/packages/foxws/laravel-scout-relations)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/foxws/laravel-scout-relations/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/foxws/laravel-scout-relations/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/foxws/laravel-scout-relations/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/foxws/laravel-scout-relations/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/foxws/laravel-scout-relations.svg?style=flat-square)](https://packagist.org/packages/foxws/laravel-scout-relations)

Automatically re-index Scout-searchable related models when an Eloquent model is saved or deleted.

When a parent model changes (e.g. an `Author`), its related Searchable models (e.g. `Post`) are automatically queued for re-indexing, keeping your search index consistent without any manual intervention.

## Requirements

- PHP 8.4+
- Laravel 12+
- [Laravel Scout](https://laravel.com/docs/scout)

## Installation

Install the package via Composer:

```bash
composer require foxws/laravel-scout-relations
```

## Usage

Add the `HasSearchableRelations` trait to any Eloquent model whose changes should trigger re-indexing of related models. Then override `searchableRelations()` to return the relationship names to watch.

```php
use Foxws\ScoutRelations\Concerns\HasSearchableRelations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Author extends Model
{
    use HasSearchableRelations;

    /**
     * Relationships whose models should be re-indexed when this model changes.
     *
     * @return array<int, string>
     */
    public function searchableRelations(): array
    {
        return ['posts'];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
```

The related `Post` model must use Laravel Scout's `Searchable` trait:

```php
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use Searchable;

    public function toSearchableArray(): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'author_name' => $this->author->name, // kept fresh on every re-index
        ];
    }
}
```

Now whenever an `Author` is saved with changes or deleted, all of its `Post` records are automatically re-indexed.

## How it works

The trait hooks into Eloquent's `saved` and `deleted` model events:

- **`saved`** — re-indexes relations only when `wasChanged()` is `true`, avoiding unnecessary indexing on no-op saves.
- **`deleted`** — re-indexes relations unconditionally so the search index reflects the parent's removal.

Re-indexing is performed in chunks via `chunkById`. If the related model defines `makeAllSearchableUsing()`, it is applied to the chunk query, preventing N+1 queries.

A per-class re-entry guard prevents infinite cascades when mutual relationships exist.

## Configuration

Publish the config file with:

```bash
php artisan vendor:publish --tag="scout-relations-config"
```

Available options in `config/scout-relations.php`:

| Key | Env variable | Default | Description |
|---|---|---|---|
| `enabled` | `SCOUT_RELATIONS_ENABLED` | `true` | Disable all automatic relation syncing |
| `chunk.searchable` | `SCOUT_RELATIONS_CHUNK_SEARCHABLE` | `500` | Chunk size for `searchable()` calls |
| `chunk.unsearchable` | `SCOUT_RELATIONS_CHUNK_UNSEARCHABLE` | `500` | Chunk size reserved for future use |

## Artisan command

To manually force re-indexing of all relations for a model (ignoring the `enabled` flag), use:

```bash
php artisan scout:index-relations "App\Models\Author"
```

This chunks through every record of the given model and calls `reindexSearchableRelations()` on each, with a progress bar.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [francoism90](https://github.com/foxws)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
