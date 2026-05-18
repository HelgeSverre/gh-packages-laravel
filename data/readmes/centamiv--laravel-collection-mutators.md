# Laravel Collection Mutators

Laravel Collection Mutators is a lightweight package that extends Laravel's **Collections**, **LazyCollections**, and the **Arr** helper with powerful, immutable mutation methods. 

It allows you to perform common data manipulation tasks—like updating, deleting, or upserting items based on specific conditions—using a clean, fluent API. By following an immutable approach, the package ensures that your original data remains untouched, returning a fresh instance with the modifications applied.

## Functions

The following methods are added to `Collection`, `LazyCollection`, and `Arr`:

- **`updateWhere(array $where, array $update)`**: Updates items that match the given conditions.
- **`deleteWhere(array $where)`**: Removes items that match the given conditions.
- **`upsertWhere(array $where, array $values)`**: Updates matching items or appends a new item if no match is found.
- **`toggleWhere(array $where, string $booleanField)`**: Inverts a boolean field for all matching items.
- **`insertAfterKey($targetKey, $value, $newKey = null)`**: Inserts an element after a specific key.
- **`insertBeforeKey($targetKey, $value, $newKey = null)`**: Inserts an element before a specific key.

## Requirements

- PHP 8.2+
- Laravel Support 11, 12, or 13

## Installation

Install the package with Composer:

```bash
composer require centamiv/laravel-collection-mutators
```

Laravel package discovery will register the service providers automatically.

If you have disabled package discovery, register these providers manually:

```php
Centamiv\CollectionMutators\ArrMutatorsServiceProvider::class,
Centamiv\CollectionMutators\CollectionMutatorsServiceProvider::class,
Centamiv\CollectionMutators\LazyCollectionMutatorsServiceProvider::class,
```

## Usage

### `updateWhere()`

Update all items that match the given conditions and return the updated data.

**Collection:**
```php
$users = collect([
    ['id' => 1, 'name' => 'Taylor', 'active' => false],
    ['id' => 2, 'name' => 'Abigail', 'active' => true],
]);

$updated = $users->updateWhere(
    ['id' => 1],
    ['active' => true, 'name' => 'Otwell']
);
```

**Array:**
```php
use Illuminate\Support\Arr;

$users = [
    ['id' => 1, 'name' => 'Taylor', 'active' => false],
];

$updated = Arr::updateWhere($users, ['id' => 1], ['name' => 'Otwell']);
```

---

### `deleteWhere()`

Remove all items that match the given conditions.

**Collection:**
```php
$users = collect([
    ['id' => 1, 'name' => 'Taylor'],
    ['id' => 2, 'name' => 'Abigail'],
]);

$filtered = $users->deleteWhere(['id' => 1]);
```

**Array:**
```php
$users = [
    ['id' => 1, 'name' => 'Taylor'],
    ['id' => 2, 'name' => 'Abigail'],
];

$filtered = Arr::deleteWhere($users, ['id' => 1]);
```

---

### `upsertWhere()`

Update matching items if they exist, otherwise insert a new item.

**Collection:**
```php
$users = collect([
    ['id' => 1, 'name' => 'Taylor'],
]);

// Updates Taylor to Otwell
$users->upsertWhere(['id' => 1], ['name' => 'Otwell']);

// Inserts Abigail because id 2 doesn't exist
$users->upsertWhere(['id' => 2], ['name' => 'Abigail']);
```

**Array:**
```php
$users = [['id' => 1, 'name' => 'Taylor']];

$result = Arr::upsertWhere($users, ['id' => 2], ['name' => 'Abigail']);
```

---

### `toggleWhere()`

Invert a boolean field for all matching items.

**Collection:**
```php
$users = collect([
    ['id' => 1, 'active' => false],
]);

$users->toggleWhere(['id' => 1], 'active');
```

**Array:**
```php
$users = [['id' => 1, 'active' => false]];

$result = Arr::toggleWhere($users, ['id' => 1], 'active');
```

---

### `insertAfterKey()` / `insertBeforeKey()`

Insert an element into an associative array or collection at a specific position.

**Collection:**
```php
$data = collect([
    'first' => 1,
    'third' => 3,
]);

$data->insertAfterKey('first', 2, 'second');
// ['first' => 1, 'second' => 2, 'third' => 3]
```

**Array:**
```php
$data = ['first' => 1, 'third' => 3];

$result = Arr::insertAfterKey($data, 'first', 2, 'second');
```

---

### Advanced Features

#### Multiple conditions
All conditions in the `where` array must match.

```php
$result = $users->updateWhere(
    ['role' => 'developer', 'active' => true],
    ['role' => 'manager']
);
```

#### Dot notation for nested data
You can match and update nested values using dot notation.

```php
$items = collect([
    ['id' => 1, 'settings' => ['theme' => 'light']],
]);

$updated = $items->updateWhere(
    ['id' => 1],
    ['settings.theme' => 'dark']
);
```

#### Object items are cloned
When a matching item is an object, the package clones it before applying updates to ensure immutability.

```php
$user = (object) ['id' => 1, 'name' => 'Taylor'];

$updated = collect([$user])->updateWhere(['id' => 1], ['name' => 'Otwell']);

$user->name; // Taylor (unchanged)
$updated->first()->name; // Otwell
```

#### LazyCollection support
The lazy version keeps the pipeline lazy and returns a new `LazyCollection`.

```php
use Illuminate\Support\LazyCollection;

$updated = $lazyUsers->updateWhere(['id' => 1], ['active' => true]);
```

## Testing

Run the test suite with:

```bash
./vendor/bin/phpunit
```

## License

Released under the [MIT license](LICENSE).
