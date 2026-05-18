# Laravel Saveable

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ritechoice23/laravel-saveable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-saveable)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ritechoice23/laravel-saveable/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/ritechoice23/laravel-saveable/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/ritechoice23/laravel-saveable.svg?style=flat-square)](https://packagist.org/packages/ritechoice23/laravel-saveable)

A flexible Laravel package for adding save/bookmark functionality to any Eloquent model with collections, metadata, and custom ordering support. Perfect for building features like bookmarks, favorites, reading lists, and more!

## Features

-   **Fully Polymorphic**: Any model can save any other model (User → Post, User → Article, etc.)
-   **MorphMap Compatible**: Full support for both `Relation::morphMap()` and base class path configurations
-   **Collections/Folders**: Organize saved items into nested collections
-   **Metadata Support**: Add notes, priorities, or custom data to saves
-   **Custom Ordering**: Control the order of saved items within collections
-   **Simple API**: Intuitive methods like `saveItem()`, `unsaveItem()`, `toggleSaveItem()`, `hasSavedItem()`
-   **Rich Queries**: Chainable query scopes and eager loading support
-   **Zero Configuration**: Works out of the box with sensible defaults
-   **Full Test Coverage**: Comprehensive Pest PHP test suite included

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Model Setup](#model-setup)
-   [Basic Usage](#basic-usage)
-   [Collection Management](#collection-management)
-   [Retrieving Saved Items](#retrieving-saved-items)
-   [Advanced Features](#advanced-features)
-   [API Reference](#api-reference)
-   [Testing](#testing)

## Why This Package?

### Popular Alternatives

-   [maize-tech/laravel-markable](https://github.com/maize-tech/laravel-markable)
-   [cybercog/laravel-love](https://github.com/cybercog/laravel-love) (bookmark feature)

### What Makes This Package Unique

✅ **Collections/Folders System** - Nested collections for organizing saved items (reading lists, watch later, favorites)

✅ **Order Management** - Custom ordering within collections with `order_column`

✅ **Metadata on Saves** - Notes, priorities, custom data on each save

✅ **Unsorted Items Management** - Dedicated methods for items saved without a collection

✅ **Mixed Models in Collections** - Save different model types in the same collection

✅ **Move Between Collections** - `moveSavedItem()` for reorganizing saved items

## Installation

Install the package via composer:

```bash
composer require ritechoice23/laravel-saveable
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-saveable-migrations"
php artisan migrate
```

Optionally, publish the config file:

```bash
php artisan vendor:publish --tag="laravel-saveable-config"
```

## Configuration

The published config file (`config/saveable.php`) includes:

```php
return [
    'saves_table' => 'saves',
    'collections_table' => 'collections',
    'auto_ordering' => true,
];
```

## Model Setup

Add the traits to your models to enable the "saver" and "saveable" functionality.

### 1. The "Saver" Model (e.g., User)

Add the `HasSaves` trait to any model that should be able to save things.

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Ritechoice23\Saveable\Traits\HasSaves;

class User extends Authenticatable
{
    use HasSaves;
    // ...
}
```

### 2. The "Saveable" Model (e.g., Post)

Add the `IsSaveable` trait to any model that you want to be saveable.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Ritechoice23\Saveable\Traits\IsSaveable;

class Post extends Model
{
    use IsSaveable;
    // ...
}
```

## Basic Usage

### Saving & Unsaving

All methods are called from the "saver" model (e.g., your User instance).

**Save an item:**

```php
$user->saveItem($post);
```

**Unsave an item:**

```php
$user->unsaveItem($post);
```

**Toggle a save:**

```php
$user->toggleSaveItem($post);
```

**Check if an item is saved:**

```php
if ($user->hasSavedItem($post)) {
    // User has saved this post
}
```

You can also check from the "saveable" model:

```php
if ($post->isSavedBy($user)) {
    // This post is saved by the user
}
```

**Count how many times an item has been saved:**

```php
$saveCount = $post->timesSaved();
```

## Collection Management

### Creating Collections

Collections are owned by a "saver" (typically a User).

**Create a top-level collection:**

```php
$collection = $user->collections()->create([
    'name' => 'Reading List'
]);
```

**Create a nested collection:**

```php
$parentCollection = $user->collections()->first();

$subCollection = $user->collections()->create([
    'name' => 'Tech Articles',
    'parent_id' => $parentCollection->id
]);
```

### Saving to Collections

Pass the collection as the second argument to the `saveItem` method.

```php
$collection = $user->collections()->where('name', 'Reading List')->first();

// Save the post directly into the 'Reading List' collection
$user->saveItem($post, $collection);
```

### Retrieving Collections & Items

**Get all collections for a user:**

```php
$collections = $user->collections;
```

**Get only top-level (root) collections:**

```php
$rootCollections = $user->rootCollections;
```

**Get a collection's children (sub-folders):**

```php
$subCollections = $collection->children;
```

**Get a collection's parent:**

```php
$parent = $subCollection->parent;
```

**Get all saved items within a collection:**

```php
$items = $collection->items(); // Returns a collection of Post, Product models, etc.
```

**Move a saved item to a different collection:**

```php
// Move to another collection
$user->moveSavedItem($post, $otherCollection);

// Move to root (unsorted)
$user->moveSavedItem($post, null);
```

## Retrieving Saved Items

**Get all "save" records for a user:**

This returns the `Save` model instances, which include metadata.

```php
$saves = $user->savedRecords;
```

**Get all saved items as a query (single type):**

This returns a Builder so you can chain additional queries.

```php
// Get all saved posts
$savedPosts = $user->savedItems(Post::class)->where('published', true)->get();

// Or use savedItemsOfType for clarity
$savedPosts = $user->savedItemsOfType(Post::class)->latest()->get();
```

**Get saved items grouped by type:**

Perfect for when users save multiple model types.

```php
$savedItemsGrouped = $user->savedItemsGrouped();
// Returns: Collection<string, Collection>
// e.g., ['App\Models\Post' => Collection, 'App\Models\Video' => Collection]

foreach ($savedItemsGrouped as $type => $items) {
    echo "Type: {$type}, Count: {$items->count()}";
}
```

**Get all unsorted items:**

This gets items that were saved without a collection.

```php
// Get Save records
$unsortedSaves = $user->unsortedSavedRecords();

// Get actual models (single type)
$unsortedPosts = $user->unsortedSavedItems(Post::class)->get();

// Get all unsorted (mixed types)
$allUnsorted = $user->unsortedSavedItems()->get();
```

**Get all users who saved a specific item:**

```php
// Get as a query (can chain additional filters)
$users = $post->savers(User::class)->where('verified', true)->get();

// Get grouped by type
$saversGrouped = $post->saversGrouped();
```

**Count saved items:**

```php
// Count all saved items
$totalCount = $user->savedItemsCount();

// Count by type
$postCount = $user->savedItemsCount(Post::class);
```

## Advanced Features

### Metadata

You can add extra data (like notes) to a save. This is stored in a JSON column on the `saves` table.

**Save with metadata:**

```php
$user->saveItem($post, $collection, [
    'note' => 'Read this by Friday.',
    'priority' => 'high'
]);
```

**Update metadata on an existing save:**

```php
$user->updateSavedItemMetadata($post, [
    'note' => 'Finished reading.',
    'priority' => 'low'
]);
```

**Retrieve metadata:**

```php
$saveRecord = $user->getSavedRecord($post);

if ($saveRecord) {
    $note = $saveRecord->metadata['note']; // 'Finished reading.'
    $priority = $saveRecord->metadata['priority']; // 'low'
}
```

### Ordering

The `saves` table has an `order_column` (integer). When a user saves an item, it's automatically given the next available number for its scope (user + collection).

You can retrieve items in this order:

```php
$saves = $user->savedRecords()->where('collection_id', $collection->id)
              ->orderBy('order_column', 'asc')
              ->get();
```

### Query Scopes

**Eager load save counts:**

```php
$posts = Post::withSavesCount()->get();

foreach ($posts as $post) {
    echo $post->saves_count;
}
```

**Get most saved posts:**

```php
$topPosts = Post::mostSaved(10)->get();
```

**Check save status for current user:**

```php
$posts = Post::withSaveStatus($currentUser)->get();

foreach ($posts as $post) {
    if ($post->is_saved) {
        echo "Saved with metadata: " . json_encode($post->save_metadata);
    }
}
```

**Filter posts saved by a user:**

```php
$savedPosts = Post::whereSavedBy($user)->get();
```

**Filter users who saved a specific post:**

```php
$users = User::whereSavedItem($post)->get();
```

## API Reference

### HasSaves Trait Methods

| Method                      | Parameters                                               | Return       | Description                                    |
| --------------------------- | -------------------------------------------------------- | ------------ | ---------------------------------------------- |
| `saveItem()`                | `Model $model, ?Collection $collection, array $metadata` | `bool`       | Save an item with optional collection/metadata |
| `unsaveItem()`              | `Model $model`                                           | `bool`       | Unsave an item                                 |
| `toggleSaveItem()`          | `Model $model, ?Collection $collection, array $metadata` | `bool`       | Toggle save status                             |
| `hasSavedItem()`            | `Model $model`                                           | `bool`       | Check if has saved a model                     |
| `getSavedRecord()`          | `Model $model`                                           | `?Save`      | Get the save record for a model                |
| `moveSavedItem()`           | `Model $model, ?Collection $collection`                  | `bool`       | Move a save to a different collection          |
| `updateSavedItemMetadata()` | `Model $model, array $metadata`                          | `bool`       | Update metadata on a save                      |
| `savedItems()`              | `?string $type`                                          | `Builder`    | Get saved items query (chainable)              |
| `savedItemsOfType()`        | `string $type`                                           | `Builder`    | Get saved items of specific type               |
| `savedItemsGrouped()`       | -                                                        | `Collection` | Get saved items grouped by type                |
| `unsortedSavedRecords()`    | -                                                        | `Collection` | Get unsorted Save records                      |
| `unsortedSavedItems()`      | `?string $type`                                          | `Builder`    | Get unsorted items query                       |
| `savedItemsCount()`         | `?string $type`                                          | `int`        | Count saved items                              |
| `savedRecords()`            | -                                                        | `MorphMany`  | Relationship: all Save records                 |
| `collections()`             | -                                                        | `HasMany`    | Relationship: all collections owned            |
| `rootCollections()`         | -                                                        | `HasMany`    | Relationship: root collections                 |

### HasSaves Trait Scopes

| Scope              | Parameters     | Description                         |
| ------------------ | -------------- | ----------------------------------- |
| `whereSavedItem()` | `Model $model` | Filter by models that saved an item |

### IsSaveable Trait Methods

| Method            | Parameters      | Return       | Description                         |
| ----------------- | --------------- | ------------ | ----------------------------------- |
| `timesSaved()`    | -               | `int`        | Total number of saves               |
| `isSavedBy()`     | `Model $saver`  | `bool`       | Check if saved by a specific model  |
| `savedRecordBy()` | `Model $saver`  | `?Save`      | Get save record by a specific model |
| `savers()`        | `?string $type` | `Builder`    | Get savers query (chainable)        |
| `saversGrouped()` | -               | `Collection` | Get savers grouped by type          |
| `removeSavedBy()` | `Model $saver`  | `bool`       | Remove a specific model's save      |
| `saversCount()`   | `?string $type` | `int`        | Count savers                        |
| `saveRecords()`   | -               | `MorphMany`  | Relationship: all Save records      |

### IsSaveable Trait Scopes

| Scope              | Parameters        | Description                          |
| ------------------ | ----------------- | ------------------------------------ |
| `withSavesCount()` | -                 | Eager load save count                |
| `mostSaved()`      | `int $limit = 10` | Order by most saved                  |
| `withSaveStatus()` | `Model $saver`    | Add save status for a specific saver |
| `whereSavedBy()`   | `Model $saver`    | Filter by saved by a saver           |

## Practical Examples

### Building a Bookmark Feature

```php
// Controller
class BookmarkController extends Controller
{
    public function store(Post $post, Request $request)
    {
        $collection = null;

        if ($request->collection_id) {
            $collection = auth()->user()->collections()->find($request->collection_id);
        }

        auth()->user()->saveItem($post, $collection, [
            'note' => $request->note
        ]);

        return back()->with('success', 'Post bookmarked!');
    }

    public function destroy(Post $post)
    {
        auth()->user()->unsaveItem($post);

        return back()->with('success', 'Bookmark removed!');
    }
}
```

### User's Saved Items Dashboard

```php
public function dashboard()
{
    $user = auth()->user();

    // Get all collections with item counts
    $collections = $user->collections()
        ->withCount('saves')
        ->get();

    // Get unsorted saved posts
    $unsortedPosts = $user->unsortedSavedItems(Post::class)
        ->where('published', true)
        ->latest()
        ->get();

    // Get all saved items grouped by type
    $savedItemsGrouped = $user->savedItemsGrouped();

    return view('dashboard', compact('collections', 'unsortedPosts', 'savedItemsGrouped'));
}
```

### Popular Posts

```php
public function popular()
{
    $popularPosts = Post::mostSaved(20)
        ->with('saveRecords')
        ->get();

    return view('popular', compact('popularPosts'));
}
```

### Get Saved Posts with Filtering

```php
public function mySavedPosts()
{
    // Using the Builder pattern - can chain any query methods
    $savedPosts = auth()->user()
        ->savedItems(Post::class)
        ->where('published', true)
        ->where('category_id', 5)
        ->latest()
        ->paginate(20);

    return view('my-saves', compact('savedPosts'));
}
```

## Testing

Run the test suite:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Run static analysis:

```bash
composer analyse
```

Run code formatting:

```bash
composer format
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

-   [Daramola Babatunde Ebenezer](https://github.com/ritechoice23)
-   [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
