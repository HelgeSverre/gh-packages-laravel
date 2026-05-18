# Laravel Hashids

[![Latest Version on Packagist](https://img.shields.io/packagist/v/atldays/laravel-hashids.svg?logo=packagist&style=for-the-badge)](https://packagist.org/packages/atldays/laravel-hashids)
[![Total Downloads](https://img.shields.io/packagist/dt/atldays/laravel-hashids.svg?style=for-the-badge&color=blue)](https://packagist.org/packages/atldays/laravel-hashids/stats)
[![CI](https://img.shields.io/github/actions/workflow/status/atldays/laravel-hashids/ci.yml?style=for-the-badge&label=CI)](https://github.com/atldays/laravel-hashids/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE.md)

`atldays/laravel-hashids` helps Laravel apps use hash IDs as one clean, consistent flow.

Instead of handling encoding, decoding, validation, routing and API output in different places, the package keeps everything working together:

- generating hash IDs on models
- resolving models from hash IDs
- route model binding
- validation rules
- request decoding in `FormRequest`
- serialized API output
- model-aware artisan commands

Under the hood, it is powered by [`hashids/hashids`](https://packagist.org/packages/hashids/hashids), while adding a Laravel-first developer experience around models, requests, validation and routing.

Your application can keep working with plain numeric values internally, while the outside world works with hash IDs in a predictable way.

## Features

- Model trait for generating and resolving hash IDs
- Query helpers like `findByHashId()` and `whereHashId()`
- Optional route model binding with hash IDs
- Validation rules for single and multiple values
- `FormRequest` integration for automatic decoding
- Wildcard request field support like `items.*.author`
- Optional serialized output that replaces the source column with a hash ID
- Model attributes for configuring hash ID source column and salt
- Legacy registry support for custom and old salts
- Artisan commands for model-specific encode and decode

## Installation

Install the package via Composer:

```bash
composer require atldays/laravel-hashids
```

Publish the config file if you want to customize the defaults:

```bash
php artisan vendor:publish --provider="Atldays\\HashIds\\HashIdServiceProvider" --tag="laravel-hashids-config"
```

If you plan to contribute, please also read [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick Start

Add `HasHashId` to your model:

```php
<?php

namespace App\Models;

use Atldays\HashIds\Concerns\HasHashId;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasHashId;
}
```

Now you can:

```php
$user = User::findOrFail(123);

$user->getHashId();
$user->hash_id;

User::findByHashId($user->hash_id);
User::findOrFailByHashId($user->hash_id);

User::query()->whereHashId($user->hash_id)->first();
```

## Core Concept

The package is built around two layers:

1. Internal application values
   Your models and database keep using numeric values.

2. External application values
   Routes, requests, validation and serialized output can use hash IDs instead.

The `hashid.enabled` config option controls that external behavior.

When it is enabled:

- routes use hash IDs
- validation expects hash IDs
- `FormRequest` decoding expects hash IDs
- serialized output can expose hash IDs

When it is disabled:

- the core `HashId` service still works
- model methods still work
- external integrations use plain numeric values instead

That makes local debugging and gradual adoption much easier.

## Basic Model Usage

### Generate Hash IDs

```php
$user = User::findOrFail(123);

$user->hash_id;
$user->getHashId();

User::encodeHashId(123);
User::decodeHashId($user->hash_id);
```

### Find Models By Hash ID

```php
User::findByHashId($hashId);
User::findOrFailByHashId($hashId);
User::findManyByHashId([$firstHashId, $secondHashId]);
User::findOrByHashId($hashId, fn () => null);
User::findOrNewByHashId($hashId);
```

### Query Builder Helpers

```php
User::query()->whereHashId($hashId)->first();
User::query()->whereHashIdNot($hashId)->get();

User::query()->whereHashIds([$firstHashId, $secondHashId])->get();
User::query()->whereHashIdsNot([$firstHashId, $secondHashId])->get();
```

## Route Model Binding

If you want route model binding to work with hash IDs, add `HasHashIdRouting`:

```php
<?php

namespace App\Models;

use Atldays\HashIds\Concerns\HasHashId;
use Atldays\HashIds\Concerns\HasHashIdRouting;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasHashId;
    use HasHashIdRouting;
}
```

Then standard Laravel route model binding works:

```php
// GET /users/jR8k2PqL

Route::get('/users/{user}', function (User $user) {
    return $user;
})->name('users.show');
```

And route generation also uses the hash ID:

```php
route('users.show', $user);
```

## Validation

The package provides two rules:

- `HashId` — validates that the value is a valid hash ID
- `HashIdExists` — validates that the hash ID is valid and the model exists

### Single Value

```php
use App\Models\User;
use Atldays\HashIds\Rules\HashId;
use Atldays\HashIds\Rules\HashIdExists;

$request->validate([
    'user' => ['required', new HashId(User::class)],
    'existing_user' => ['required', new HashIdExists(User::class)],
]);
```

### Arrays

```php
$request->validate([
    'users' => ['required', 'array', new HashId(User::class)],
    'existing_users' => ['required', 'array', new HashIdExists(User::class)],
]);
```

The rules are `nullable`-friendly by design, so they work naturally with Laravel rules like `required` and `nullable`.

Validation messages are translated through the package translation files, and you can override them in your application the same way you override other Laravel package translations.

First publish the package translations:

```bash
php artisan vendor:publish --tag=hashids-translations
```

Example:

```php
// lang/vendor/laravel-hashids/en/validation.php

return [
    'hash_id' => 'The :attribute must be a valid hash ID.',
    'hash_ids' => 'The :attribute must contain only valid hash IDs.',
    'hash_id_exists' => 'The selected :attribute is invalid.',
    'hash_ids_exist' => 'One or more selected :attribute values are invalid.',
];
```

## Form Requests

For API-heavy projects, `FormRequest` integration is one of the most useful parts of the package.

It lets you accept hash IDs from the outside world, validate them, and then work with plain numeric values or resolved models inside your request and controllers.

Use the `InteractsWithHashIds` trait:

```php
<?php

namespace App\Http\Requests;

use App\Models\Post;
use App\Models\User;
use Atldays\HashIds\Http\Attributes\HashIdField;
use Atldays\HashIds\Http\Concerns\InteractsWithHashIds;
use Atldays\HashIds\Rules\HashId;
use Illuminate\Foundation\Http\FormRequest;

#[HashIdField('posts', Post::class)]
class IndexPostsRequest extends FormRequest
{
    use InteractsWithHashIds;

    protected array $hashIdFields = [
        'author' => User::class,
    ];

    public function rules(): array
    {
        return [
            'author' => ['nullable', new HashId(User::class)],
            'posts' => ['nullable', 'array', new HashId(Post::class)],
        ];
    }
}
```

After validation:

- `author` becomes an integer model value
- `posts` becomes an array of integer model values

### Resolve Models From Request Fields

```php
$author = $request->hashedModel('author');
$author = $request->hashedModelOrFail('author');
$posts = $request->hashedModels('posts');
```

### Dot Notation And Wildcards

The request layer supports nested fields:

```php
protected array $hashIdFields = [
    'filters.author' => User::class,
    'items.*.users' => User::class,
];
```

And then:

```php
$request->hashedModel('filters.author');
$request->hashedModels('items.0.users');
```

## Serialized Output

If you want your model to expose hash IDs in serialized output, add `SerializesHashId`:

```php
<?php

namespace App\Models;

use Atldays\HashIds\Concerns\HasHashId;
use Atldays\HashIds\Concerns\SerializesHashId;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasHashId;
    use SerializesHashId;
}
```

When `hashid.enabled` is `true`, the source column used by the model is replaced in serialized output:

```php
$user->toArray();
```

Instead of:

```json
{
  "id": 123,
  "name": "Alice"
}
```

you get:

```json
{
  "id": "jR8k2PqL",
  "name": "Alice"
}
```

When `hashid.enabled` is `false`, serialization stays plain and returns numeric values.

## Model Attributes

The package supports PHP attributes for model configuration.

### Custom Source Column

```php
use Atldays\HashIds\Attributes\HashIdColumn;

#[HashIdColumn('public_id')]
class User extends Model
{
    use HasHashId;
}
```

### Custom Salt

```php
use Atldays\HashIds\Attributes\HashIdSalt;

#[HashIdSalt('custom-user-salt')]
class User extends Model
{
    use HasHashId;
}
```

### Salt From Class Name

```php
use Atldays\HashIds\Attributes\HashIdSaltFromClass;

#[HashIdSaltFromClass]
class User extends Model
{
    use HasHashId;
}
```

### Salt From Table Name

```php
use Atldays\HashIds\Attributes\HashIdSaltFromTable;

#[HashIdSaltFromTable]
class User extends Model
{
    use HasHashId;
}
```

### Trait-Level Defaults

Attributes can also live on traits, which is useful when you want shared behavior across multiple models.

Model-level attributes still take priority over trait-level attributes.

## Legacy And Custom Salt Mapping

If you need to support old salts, old namespaces or legacy model mappings, use `HashIdRegistry`.

Example:

```php
use App\Models\User;
use Atldays\HashIds\HashIdRegistry;

HashIdRegistry::make('App\\Old\\Models\\User', User::class);
```

This is especially useful when you moved models between namespaces or repositories but still need old hash IDs to keep working.

## Artisan Commands

The package provides model-aware commands:

```bash
php artisan hashid:encode "App\\Models\\User" 123
php artisan hashid:decode "App\\Models\\User" jR8k2PqL
```

These commands use the model's own hash ID configuration, including its salt logic.

## Configuration

```php
return [
    'enabled' => (bool) env('HASH_ID_ENABLED', !env('APP_DEBUG')),
    'salt' => env('HASH_ID_SALT', 'secret-salt'),
    'length' => (int) env('HASH_ID_LENGTH', 12),
    'alphabet' => env('HASH_ID_ALPHABET', 'abcdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ234567890'),
];
```

### `enabled`

Controls the package's external behavior.

When enabled, the package uses hash IDs in:

- route model binding
- validation
- request decoding
- serialized output

When disabled, those integrations use plain numeric values instead.

### `salt`

Default salt for the core `HashId` service.

### `length`

The generated hash ID length.

### `alphabet`

The alphabet passed to the underlying `hashids/hashids` encoder.

## Core `HashId` Service

If you need the low-level service directly, you can use the `HashId` facade:

```php
use Atldays\HashIds\Facades\HashId;

$encoded = HashId::encode(123);
$decoded = HashId::decode($encoded);
```

If you need a custom runtime configuration, you can create a configured `HashId` instance directly:

```php
use Atldays\HashIds\HashId;

$hashId = HashId::make(
    salt: 'custom-salt',
    length: 16,
    alphabet: 'abcdefghijklmnopqrstuvwxyz1234567890',
);
```

You can also override only the values you need:

```php
$hashId = HashId::make(salt: 'custom-salt');
```

## Local Development

Install dependencies in the same Docker-based environment used by the project:

```bash
./bin/docker-php "composer update --prefer-dist --no-interaction"
```

Run formatting and tests:

```bash
./bin/docker-php "vendor/bin/pint --test"
./bin/docker-php "composer test"
```
