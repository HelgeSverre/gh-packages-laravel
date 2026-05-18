<p align="center">
<img width="600" src="art/logo.png" alt="Laravel List logo">
</p>

<p align="center">
  A Laravel Collection that guarantees sequential, 0-based integer keys at all times.
</p>
<p align="center">
  <a href="https://packagist.org/packages/derheyne/laravel-list">
    <img src="https://img.shields.io/packagist/v/derheyne/laravel-list.svg?style=flat-square" alt="Latest Version on Packagist">
  </a>

  <a href="https://github.com/derheyne/laravel-list/actions?query=workflow%3Arun-tests+branch%3Amain">
    <img src="https://img.shields.io/github/actions/workflow/status/derheyne/laravel-list/run-tests.yml?branch=main&label=tests&style=flat-square" alt="GitHub Tests Action Status">
  </a>

  <a href="https://packagist.org/packages/derheyne/laravel-list">
    <img src="https://img.shields.io/packagist/dt/derheyne/laravel-list.svg?style=flat-square" alt="Total Downloads">
  </a>
</p>

# Laravel List

`ListCollection` is a drop-in replacement for `Illuminate\Support\Collection` that enforces a single invariant:
**keys are always `[0, 1, 2, ...]`**. Every operation that would otherwise leave gaps re-indexes automatically, and
operations that fundamentally produce associative keys throw a `BadMethodCallException` instead of silently changing the
shape of your data.

```php
use dhy\LaravelList\ListCollection;

$list = new ListCollection(['a', 'b', 'c']);

$list->filter(fn ($v) => $v !== 'b')->toJson();
// "[\"a\",\"c\"]"  -- a JSON array, even after filtering
```

## Why?

Laravel's `Collection` preserves keys through almost every operation. After `filter()`, `sort()`, `unique()`, or
`forget()` you are typically left with gaps:

```php
$c = collect(['a', 'b', 'c'])->filter(fn ($v) => $v !== 'b');

$c->all();    // [0 => 'a', 2 => 'c']      -- gap at index 1
$c->toJson(); // {"0":"a","2":"c"}         -- JSON object, not array
$c[1];        // null                      -- unexpected
```

This is the right default for a general-purpose collection, but it is the wrong default any time the data is
conceptually a list -- an API response, a frontend payload, an indexed sequence, anywhere a "missing" key would be a
bug. Defending against it manually means sprinkling `->values()` calls through your code and remembering to do so every
time.

`ListCollection` removes that whole class of bug:

```php
$list = (new ListCollection(['a', 'b', 'c']))->filter(fn ($v) => $v !== 'b');

$list->all();    // [0 => 'a', 1 => 'c']
$list->toJson(); // ["a","c"]
$list[1];        // 'c'
```

## Installation

```bash
composer require derheyne/laravel-list
```

There is no service provider, facade, or configuration. Use the class directly wherever you would use a `Collection`.

## Usage

### Creating a list

The constructor and all static factories normalise their input to a sequential list. Associative keys, sparse integer
keys, and `Collection` inputs are all flattened to `[0, 1, 2, ...]`:

```php
use dhy\LaravelList\ListCollection;

(new ListCollection(['a' => 1, 'b' => 2, 'c' => 3]))->all();
// [0 => 1, 1 => 2, 2 => 3]

(new ListCollection(collect([10 => 'x', 20 => 'y'])))->all();
// [0 => 'x', 1 => 'y']

ListCollection::make([1, 2, 3]);
ListCollection::wrap('single value');           // [0 => 'single value']
ListCollection::times(5, fn ($i) => $i * 2);    // [2, 4, 6, 8, 10]
```

The package also ships a global `list_of()` helper, the `ListCollection` analogue of Laravel's `collect()`. It accepts
either a single iterable / `Arrayable` / `Collection`, or any number of variadic items:

```php
list_of();                 // empty list
list_of([1, 2, 3]);        // [0 => 1, 1 => 2, 2 => 3]
list_of(1, 2, 3);          // [0 => 1, 1 => 2, 2 => 3]
list_of('hello');          // [0 => 'hello']
list_of([1, 2], [3, 4]);   // [0 => [1, 2], 1 => [3, 4]]

list_of(3, 1, 4, 1, 5)
    ->unique()
    ->sort()
    ->all();               // [0 => 1, 1 => 3, 2 => 4, 3 => 5]
```

### Filtering, sorting, deduplicating

These all return a new `ListCollection` with re-indexed keys -- no `->values()` required:

```php
$list = new ListCollection([10, 25, 30, 5, 15]);

$list->filter(fn ($v) => $v > 10);  // [0 => 25, 1 => 30, 2 => 15]
$list->reject(fn ($v) => $v > 20);  // [0 => 10, 1 => 5,  2 => 15]
$list->sort();                      // [0 => 5,  1 => 10, 2 => 15, 3 => 25, 4 => 30]
$list->unique();
$list->whereIn(/* … */);
```

### Adding, removing, replacing

```php
$list = new ListCollection(['a', 'b', 'c', 'd']);

$list->forget(1);            // remove by index, re-indexes:        [a, c, d]
$list->forget([0, 2]);       // remove multiple indices at once
$list->pull(1);              // remove and return the value, re-indexes
$list->prepend('z');         // always adds to the beginning (the $key argument is ignored)
$list->push('x');
$list->shift();
$list->pop();
$list->splice(1, 1, ['X']);  // remove and replace, re-indexes
```

`forget()`, `prepend()`, `transform()`, `pull()`, `push()`, `pop()`, `shift()`, and `splice()` mutate in place. Methods
like `filter()`, `map()`, `sort()`, `slice()`, and `concat()` return a new instance. This is the same split as
`Illuminate\Support\Collection`.

### Setting values by index

`offsetSet` is constrained to keep the list contiguous. Valid replacement indices are `0` through `count($list)`;
anything else appends:

```php
$list = new ListCollection(['a', 'b', 'c']);

$list[] = 'd';        // append:                  [a, b, c, d]
$list[1] = 'B';       // replace index 1:         [a, B, c, d]
$list[4] = 'e';       // index == count, append:  [a, B, c, d, e]
$list[99] = 'z';      // out of range,    append: [a, B, c, d, e, z]
$list[-1] = 'q';      // negative,        append
$list['key'] = 'x';   // string key,      append
```

This means `$list[$i] = $value` is always safe -- it can never punch a hole in the list or create a string key.

### Transformations

```php
$list = new ListCollection([1, 2, 3]);

$list->map(fn ($v) => $v * 2);          // returns a new ListCollection
$list->transform(fn ($v) => $v * 10);   // mutates in place

$list->slice(1, 2);
$list->reverse();
$list->flatten();
$list->collapse();
$list->flatMap(fn ($v) => [$v, $v]);
$list->merge([4, 5, 6]);
$list->concat([7, 8]);
$list->diff([2]);
$list->intersect([1, 3]);
$list->chunk(2);                                   // ListCollection of ListCollections
$list->partition(fn ($v) => $v > 1);               // [ListCollection, ListCollection]
```

`partition()` and `chunk()` recursively return `ListCollection` instances, so the invariant holds at every level.

### Pulling values

`pull()` removes an item by index, returns it, and re-indexes the remainder. Defaults can be a value or a closure:

```php
$list = new ListCollection(['a', 'b', 'c']);

$list->pull(1);                          // 'b';   list becomes [a, c]
$list->pull(99, 'fallback');             // 'fallback'
$list->pull(99, fn () => expensive());   // closure only runs on miss
```

### `pluck()`

`pluck()` works as usual when you only ask for values:

```php
$list = new ListCollection([
    ['name' => 'Alice', 'age' => 30],
    ['name' => 'Bob',   'age' => 25],
]);

$list->pluck('name')->all(); // [0 => 'Alice', 1 => 'Bob']
```

Calling `pluck()` with the second `$key` argument throws a `BadMethodCallException`, because using one column as keys
inherently produces an associative result.

### JSON serialisation

Because keys never have gaps, `toJson()` always produces a JSON array, never an object:

```php
$list = new ListCollection([1, 2, 3]);
$list->filter(fn ($v) => $v > 1)->toJson(); // "[2,3]"

// A standard Collection produces an object after the same filter:
collect([1, 2, 3])->filter(fn ($v) => $v > 1)->toJson(); // "{\"1\":2,\"2\":3}"
```

This is the most common reason to reach for `ListCollection` in a Laravel app -- API responses, resource collections,
and frontend payloads stay consistent regardless of what filtering or sorting happens upstream.

## Blocked methods

The following methods are blocked with a `BadMethodCallException`. Each one inherently produces associative keys, so
silently re-indexing would discard information the caller asked for:

| Method                       | Why it is blocked                                          |
|------------------------------|------------------------------------------------------------|
| `flip()`                     | Uses values as keys                                        |
| `combine($values)`           | Uses current items as keys                                 |
| `groupBy($groupBy)`          | Groups into an associative structure                       |
| `keyBy($keyBy)`              | Re-keys by a field or callback                             |
| `countBy($countBy)`          | Counts into an associative structure                       |
| `mapWithKeys($callback)`     | The callback defines the keys                              |
| `mapToDictionary($callback)` | Produces a dictionary structure                            |
| `mapToGroups($callback)`     | Produces a grouped structure                               |
| `pluck($value, $key)`        | Only when `$key` is given -- it would re-key by that field |

If you genuinely need one of these shapes, hand the data off to a regular `Collection`:

```php
$grouped = collect($list->all())->groupBy('category');
```

## All supported `Collection` methods

Everything else on `Illuminate\Support\Collection` works and keeps the invariant. A non-exhaustive list:

`add`, `all`, `chunk`, `collapse`, `concat`, `contains`, `count`, `diff`, `each`, `every`, `except`, `filter`, `first`,
`firstWhere`, `flatMap`, `flatten`, `forget`, `get`, `implode`, `intersect`, `isEmpty`, `isNotEmpty`, `join`, `last`,
`map`, `max`, `median`, `merge`, `min`, `nth`, `only`, `pad`, `partition`, `pipe`, `pluck` (without `$key`), `pop`,
`prepend`, `pull`, `push`, `random`, `reduce`, `reject`, `replace`, `reverse`, `search`, `shift`, `shuffle`, `skip`,
`skipUntil`, `skipWhile`, `slice`, `sole`, `some`, `sort`, `sortBy`, `sortByDesc`, `sortDesc`, `sortKeys`,
`sortKeysDesc`, `splice`, `sum`, `take`, `takeUntil`, `takeWhile`, `toArray`, `toJson`, `transform`, `unique`, `unless`,
`values`, `when`, `where`, `whereIn`, `whereNotIn`, `zip`.

## Type safety

`ListCollection` is annotated as `@extends Collection<int, TValue>`, so PHPStan and your IDE understand that keys are
always `int` and values keep their type through `map()`, `filter()`, `pluck()`, and friends. The package itself is
analysed at PHPStan `level: max`.

## Requirements

- PHP 8.3+
- Laravel 11 or 12

## Testing

```bash
composer test          # Pest test suite
composer analyse       # PHPStan at level max
composer format        # Pint
```

The test suite runs on PHP 8.3 and 8.4 against Laravel 11 and 12, on both Ubuntu and Windows.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for recent changes.

## Contributing

Pull requests are welcome. Please run `composer test` and `composer analyse` before opening a PR, and add a Pest test
for any new behaviour.

## Credits

- [Daniel Heyne](https://github.com/derheyne)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see the [License File](LICENSE.md) for more information.
