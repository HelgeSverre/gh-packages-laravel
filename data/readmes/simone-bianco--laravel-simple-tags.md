# Laravel Simple Tags

A high-performance, drop-in replacement (mostly) for `spatie/laravel-tags` using string columns instead of JSON.

This package provides a `Tag` model and a `HasTags` trait that allows you to easily tag your Eloquent models, but with a focus on PostgreSQL performance by avoiding `json` columns for tag names.

## Why use this instead of Spatie's?

Spatie's package is great, but it uses `json` columns for `name` and `slug` to support translations. In some databases (like PostgreSQL), `json` columns (unlike `jsonb`) cannot be efficiently indexed for partial matches or sorting without specialized indexes. If you don't need translations, this package offers significantly better performance for lookups and sorting (O(logN) vs O(N)).

## Installation

You can install the package via composer:

```bash
composer require simone-bianco/laravel-simple-tags
```

You can publish the migration with:

```bash
php artisan vendor:publish --provider="SimoneBianco\LaravelSimpleTags\SimpleTagsServiceProvider" --tag="tags-migrations"
```

After the migration has been published you can create the tags and taggables tables by running the migrations:

```bash
php artisan migrate
```

You can optionally publish the config file with:

```bash
php artisan vendor:publish --provider="SimoneBianco\LaravelSimpleTags\SimpleTagsServiceProvider" --tag="tags-config"
```

## Usage

To make an Eloquent model taggable just add the `\SimoneBianco\LaravelSimpleTags\HasTags` trait to it:

```php
use Illuminate\Database\Eloquent\Model;
use SimoneBianco\LaravelSimpleTags\HasTags;

class YourModel extends Model
{
    use HasTags;
}
```

### Attaching tags

```php
//adding a single tag
$yourModel->attachTag('tag 1');

//adding multiple tags
$yourModel->attachTags(['tag 2', 'tag 3']);

//adding a tag with a type
$yourModel->attachTag('tag 3', 'category');
```

### Detaching tags

```php
//using a string
$yourModel->detachTag('tag 1');

//using an array
$yourModel->detachTags(['tag 2', 'tag 3']);
```

### Syncing tags

```php
//syncing tags (replaces all existing tags with new ones)
$yourModel->syncTags(['tag 2', 'tag 3']);

//syncing tags with type
$yourModel->syncTagsWithType(['tagA', 'tagB'], 'firstType');
```

### Retrieving tagged models

The package provides four scopes `withAnyTags`, `withAllTags`, `withAnyTagsOfAnyType`, and `withAllTagsOfAnyType` that can help you find models with certain tags.

#### `withAnyTags`

The `withAnyTags` scope will return models that have one or more of the given tags attached to them. If you pass the type argument, it will look for tags with specified type, if not, it will only look for tags that have no type.

```php
//returns models that have one or more of the given tags that are not saved with a type
YourModel::withAnyTags(['tag 1', 'tag 2'])->get();

//returns models that have one or more of the given tags that are typed `myType`
YourModel::withAnyTags(['tag 1', 'tag 2'], 'myType')->get();
```

#### `withAllTags`

The `withAllTags` scope will return only the models that have all of the given tags attached to them. If you pass the type argument, it will look for tags with specified type, if not, it will only look for tags that have no type. So when passing a non-existing tag, or a correct tag name with the wrong type, no models will be returned.

```php
//returns models that have all given tags that are not saved with a type
YourModel::withAllTags(['tag 1', 'tag 2'])->get();

//returns models that have all given tags that are typed `myType`
YourModel::withAllTags(['tag 1', 'tag 2'], 'myType')->get();
```

#### `withAnyTagsOfAnyType`

The `withAnyTagsOfAnyType` scope will return models that have one or more of the given tags attached to them, but doesn't restrict given tags to any type if they are passed as string.

```php
//returns models that have one or more of the given tags of any type
YourModel::withAnyTagsOfAnyType(['tag 1', 'tag 2'])->get();
```

#### `withAllTagsOfAnyType`

The `withAllTagsOfAnyType` scope will return only the models that have all of the given tags attached to them, but doesn't restrict given tags to any type if they are passed as string. So when passing a non-existing tag no models will be returned.

```php
//returns models that have all given tags of any type
YourModel::withAllTagsOfAnyType(['tag 1', 'tag 2'])->get();
```

### Managing Tags

```php
use SimoneBianco\LaravelSimpleTags\Tag;

// Find or create
$tag = Tag::findOrCreate('my tag');

// Find or create with type
$tag = Tag::findOrCreate('my tag', 'news');

// Find from string
$tag = Tag::findFromString('my tag');
```

## Differences from Spatie

-   **No translations**: `name` and `slug` are simpler `string` columns.
-   **No `SortableTrait` dependency**: Sorting column exists but you must implement your own logic if you need drag-and-drop reordering.
-   **Simple Slugging**: Uses `Str::slug()` by default.

## Testing

```bash
composer test
```

## License

The MIT License (MIT).
