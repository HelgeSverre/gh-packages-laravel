# laravel-psl

Laravel-first package that makes the PHP Standard Library (PSL) feel natural inside Laravel applications.

## Status

Current v1 implementation includes:

* explicit bridge utilities for vec, dict, and Collection conversion
* opt-in list-safe Collection macros
* helper-driven typed coercion built on `Psl\Type`
* Laravel-friendly coercion exception wrapping
* PHPUnit and Testbench coverage

## Requirements

* PHP 8.4+
* Laravel 13.x
* PSL 6.x

## Installation

```bash
composer require entrepeneur4lyf/laravel-psl
```

Laravel package discovery registers the service provider automatically.

## Configuration

Publish the config if you want to change runtime behavior:

```bash
php artisan vendor:publish --tag=laravel-psl-config
```

Current config:

```php
return [
    'features' => [
        'collection_macros' => true,
    ],
];
```

## Bridge Utilities

Use `LaravelPsl\Support\PslBridge` when you want explicit conversions between Laravel Collections and PSL-style array semantics.

```php
use LaravelPsl\Support\PslBridge;

$collection = collect([
    'name' => 'Taylor',
    2 => 'Laravel',
]);

$vec = PslBridge::toVec($collection);
// ['Taylor', 'Laravel']

$dict = PslBridge::toDict($collection);
// ['name' => 'Taylor', 2 => 'Laravel']

$backToCollection = PslBridge::toCollection($dict);
// Collection(['name' => 'Taylor', 2 => 'Laravel'])
```

Bridge semantics:

* `toVec()` intentionally reindexes values.
* `toDict()` intentionally preserves runtime keys.
* Mixed `array-key` dictionaries are supported as PHP represents them at runtime.

## Collection Macros

When `features.collection_macros` is enabled, these macros are registered on `Illuminate\Support\Collection`:

* `pmap`
* `pfilter`
* `preduce`
* `pchunk`
* `psort`
* `ptoVec`
* `ptoDict`

Example:

```php
$users = collect($payload['users'])
    ->pfilter(fn (array $user): bool => $user['active'] ?? false)
    ->pmap(fn (array $user): array => [
        'email' => strtolower($user['email']),
        'name' => trim($user['name']),
    ]);
```

Macro semantics:

* `pmap`, `pfilter`, `pchunk`, and `psort` are list-safe operations.
* List-safe operations reindex values by design.
* `preduce` is terminal and returns the final accumulator.
* `preduce` always requires an explicit initial value.
* `psort` returns a reindexed Collection sorted by values.
* `ptoVec()` returns a plain list.
* `ptoDict()` returns a plain key-preserving array.

Examples:

```php
$sum = collect(['a' => 1, 'b' => 2, 'c' => 3])
    ->preduce(fn (int $carry, int $value): int => $carry + $value, 0);
// 6

$sorted = collect(['c' => 3, 'a' => 1, 'b' => 2])->psort();
// Collection([1, 2, 3])

$vec = collect(['name' => 'Taylor', 2 => 'Laravel'])->ptoVec();
// ['Taylor', 'Laravel']

$dict = collect(['name' => 'Taylor', 2 => 'Laravel'])->ptoDict();
// ['name' => 'Taylor', 2 => 'Laravel']
```

## Typed Coercion

Use `LaravelPsl\Type\Coerce` as a thin wrapper around `Psl\Type`.

```php
use LaravelPsl\Type\Coerce;
use Psl\Type;

$user = Coerce::value(
    Type\shape([
        'name' => Type\non_empty_string(),
        'roles' => Type\vec(Type\string()),
    ]),
    $payload,
);
```

On failure, the package throws `LaravelPsl\Exceptions\CoercionException` and preserves the original `Psl\Type\Exception\CoercionException` as `previous`.

## Usage Examples

### Controller

```php
use LaravelPsl\Type\Coerce;
use Psl\Type;

$input = Coerce::value(
    Type\shape([
        'email' => Type\non_empty_string(),
        'roles' => Type\vec(Type\string()),
    ]),
    $request->all(),
    ['source' => 'request', 'field' => 'user'],
);
```

### Service

```php
use LaravelPsl\Support\PslBridge;

$emails = PslBridge::toVec($users->pluck('email'));
```

### Job

```php
use LaravelPsl\Type\Coerce;
use Psl\Type;

$payload = Coerce::value(
    Type\shape([
        'user_id' => Type\positive_int(),
        'tags' => Type\vec(Type\string()),
    ]),
    $this->payload,
    ['source' => 'job', 'job' => static::class],
);
```

### Command

```php
$names = collect($this->argument('names'))
    ->pfilter()
    ->psort()
    ->ptoVec();
```

## Disabled-Feature Behavior

If `features.collection_macros` is `false`:

* Collection macros are not registered.
* `PslBridge` remains available.
* `Coerce` remains available.

## Out of Scope for V1

* dict-aware transform macros
* Form Request integration for coercion
* string adapters
* runtime-aware concurrency integration

## Development

```bash
composer install
vendor/bin/phpunit
```

Auto-discovery smoke test:

```bash
composer test:discovery:install
composer test:discovery
```

See [prd.md](./prd.md) for the product definition and [implementation-plan.md](./implementation-plan.md) for the execution checklist.
