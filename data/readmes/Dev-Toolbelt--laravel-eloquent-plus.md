# Laravel Eloquent Plus

[![CI](https://github.com/Dev-Toolbelt/laravel-eloquent-plus/actions/workflows/ci.yml/badge.svg)](https://github.com/Dev-Toolbelt/laravel-eloquent-plus/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Dev-Toolbelt/laravel-eloquent-plus/branch/main/graph/badge.svg)](https://codecov.io/gh/Dev-Toolbelt/laravel-eloquent-plus)
[![Latest Stable Version](https://poser.pugx.org/dev-toolbelt/laravel-eloquent-plus/v/stable)](https://packagist.org/packages/dev-toolbelt/laravel-eloquent-plus)
[![Total Downloads](https://poser.pugx.org/dev-toolbelt/laravel-eloquent-plus/downloads)](https://packagist.org/packages/dev-toolbelt/laravel-eloquent-plus)
[![License](https://poser.pugx.org/dev-toolbelt/laravel-eloquent-plus/license)](https://packagist.org/packages/dev-toolbelt/laravel-eloquent-plus)
[![PHP Version](https://img.shields.io/badge/php-%5E8.3-blue)](https://php.net)

**Supercharge your Laravel Eloquent models** with automatic validation, audit trails, external IDs, smart casting, and lifecycle hooks — all with zero boilerplate.

---

## Features

| Feature | Description |
|---------|-------------|
| **Automatic Validation** | Validate model attributes before save using Laravel's validation rules |
| **Audit Trail (Blamable)** | Automatically track `created_by`, `updated_by`, and `deleted_by` |
| **External ID (UUID)** | Public-facing UUIDs while keeping internal integer IDs |
| **Smart Auto-Casting** | Infer attribute casts from validation rules automatically |
| **Date Formatting** | Control date output format (string or Carbon instance) |
| **Lifecycle Hooks** | Execute custom logic at `beforeValidate`, `beforeSave`, `afterSave`, `beforeDelete`, `afterDelete` |
| **Hidden Attributes** | Automatically hide sensitive fields like `deleted_at`, `deleted_by` |
| **Custom Validators** | Built-in CPF/CNPJ (Brazilian documents) and Hex Color validators |
| **Custom Casts** | `OnlyNumbers`, `RemoveSpecialCharacters`, `UuidToIdCast` |
| **Cast Aliases** | Register short names for custom casts like Laravel's built-in types |

---

## Requirements

- PHP ^8.3
- Laravel ^11.0

---

## Installation

```bash
composer require dev-toolbelt/laravel-eloquent-plus
```

The service provider is automatically registered via Laravel's package discovery.

---

## Quick Start

Extend your models from `ModelBase` to unlock all features:

```php
<?php

namespace App\Models;

use DevToolbelt\LaravelEloquentPlus\ModelBase;

class Product extends ModelBase
{
    protected $fillable = [
        'name',
        'price',
        'sku',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected array $rules = [
        'name' => ['required', 'string', 'max:255'],
        'price' => ['required', 'numeric', 'min:0'],
        'sku' => ['required', 'string', 'unique:products,sku'],
    ];
}
```

> **Note:** Timestamp and blamable columns must be declared in `$fillable`, `$rules`, or pre-populated in `$attributes` for them to be automatically managed. Only declared columns are populated — undeclared ones are silently skipped.

That's it! Your model now has:
- Automatic validation before create/update
- Audit trail (`created_by`, `updated_by`, `deleted_by`)
- Soft deletes with tracking
- External UUID for public APIs
- Smart type casting inferred from rules
- Lifecycle hooks ready to use

---

## Available Traits

Use traits individually if you don't want the full `ModelBase`:

| Trait | Description |
|-------|-------------|
| `HasValidation` | Automatic validation with rules and auto-population of timestamps/blamable |
| `HasBlamable` | Track who created, updated, and deleted records |
| `HasExternalId` | UUID-based public identifiers |
| `HasAutoCasting` | Infer casts from validation rules |
| `HasDateFormatting` | Control date attribute output format |
| `HasLifecycleHooks` | Model lifecycle callbacks |
| `HasHiddenAttributes` | Auto-hide sensitive fields |
| `HasCastAliases` | Register custom cast aliases |

```php
use Illuminate\Database\Eloquent\Model;
use DevToolbelt\LaravelEloquentPlus\Concerns\HasValidation;
use DevToolbelt\LaravelEloquentPlus\Concerns\HasBlamable;

class MyModel extends Model
{
    use HasValidation;
    use HasBlamable;

    // ...
}
```

---

## Validation

Define rules in your model and validation runs automatically:

```php
class User extends ModelBase
{
    protected array $rules = [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'email', 'unique:users,email'],
        'document' => ['required', 'cpf_cnpj'], // Brazilian CPF/CNPJ
        'theme_color' => ['nullable', 'hex_color'],
    ];
}
```

### Built-in Validators

| Validator | Alias | Description |
|-----------|-------|-------------|
| `CpfCnpjValidator` | `cpf_cnpj` | Validates Brazilian CPF (11 digits) or CNPJ (14 digits) |
| `CpfCnpjValidator` | `cpf` | Validates only CPF |
| `CpfCnpjValidator` | `cnpj` | Validates only CNPJ |
| `HexColor` | `hex_color` | Validates hex color codes (#FFF or #FFFFFF) |

### Validation Exception

When validation fails, a `ValidationException` is thrown with detailed error information:

```php
use DevToolbelt\LaravelEloquentPlus\Exceptions\ValidationException;

try {
    $user->save();
} catch (ValidationException $e) {
    $e->getErrors();        // All errors as array
    $e->getMessages();      // All error messages
    $e->hasErrorFor('email'); // Check specific field
    $e->getFirstMessageFor('email'); // Get first error message
}
```

---

## Audit Trail (Blamable)

Track who performed actions on your records. Blamable is **disabled by default** and must be explicitly enabled per model:

```php
class Post extends ModelBase
{
    // Enable blamable audit tracking
    protected bool $usesBlamable = true;

    protected $fillable = [
        'title',
        'created_at',
        'updated_at',
        'deleted_at',
        // Declare blamable columns to enable automatic population:
        'created_by', // Set on create (authenticated user ID)
        'updated_by', // Set on create and update
        'deleted_by', // Set on soft delete
    ];
}
```

### Database Migration

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->timestamps();
    $table->softDeletes();

    // Blamable columns
    $table->foreignId('created_by')->constrained('users');
    $table->foreignId('updated_by')->nullable()->constrained('users');
    $table->foreignId('deleted_by')->nullable()->constrained('users');
});
```

### Partial Column Support

Both blamable and timestamps support **partial columns**. You don't need all columns — only the ones you declare in `$fillable`, `$rules`, or `$attributes` will be populated. Undeclared columns are silently skipped.

**Partial blamable columns:**

```php
class Comment extends ModelBase
{
    protected bool $usesBlamable = true;

    protected $fillable = [
        'body',
        'created_by', // Only track who created
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    // updated_by and deleted_by are not declared,
    // so they will be silently skipped.
}
```

**Partial timestamp columns:**

```php
class EventLog extends ModelBase
{
    protected $fillable = [
        'event',
        'created_at', // Only track creation time
    ];

    // updated_at is not declared, so it will be silently skipped
    // even though $timestamps = true.
}
```

> **Important:** `hasAttribute()` checks `$fillable`, `$rules`, and `$attributes` to determine if a column exists on the model. It does **not** query the database schema. You must explicitly declare the columns your model uses.

To enforce that all expected columns exist, enable [Strict Mode](#strict-mode).

### Customizing Column Names

Override the constants in your model:

```php
class Post extends ModelBase
{
    public const string CREATED_BY = 'author_id';
    public const string UPDATED_BY = 'editor_id';
    public const string DELETED_BY = 'remover_id';
}
```

---

## External ID (UUID)

Expose UUIDs publicly while keeping integer primary keys internally:

```php
class Order extends ModelBase
{
    // Enable external ID (enabled by default)
    public const bool USES_EXTERNAL_ID = true;
    public const string EXTERNAL_ID_COLUMN = 'external_id';
}
```

### Usage

```php
$order = Order::create(['total' => 99.99]);

// Internal ID (hidden from serialization)
$order->id; // 1

// External UUID (exposed in API responses)
$order->getExternalId(); // "550e8400-e29b-41d4-a716-446655440000"

// Find by external ID
$order = Order::findByExternalId('550e8400-e29b-41d4-a716-446655440000');
$order = Order::findByExternalIdOrFail('550e8400-e29b-41d4-a716-446655440000');

// API response automatically uses UUID as "id"
$order->toArray(); // ['id' => '550e8400-e29b-41d4-a716-446655440000', ...]
```

### Database Migration

```php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->uuid('external_id')->unique();
    $table->decimal('total', 10, 2);
    $table->timestamps();
});
```

---

## Relations in `toArray()`

By default, when a relation is eager-loaded, Eloquent serializes its **full** array
representation inside `toArray()`. Set `$addsRelationsInToArray = true` on the model
to replace each loaded relation with its lightweight `toSoftArray()` form (only the
identifier, or the external ID when enabled). Useful for API responses where you want
to expose related records as references instead of nested payloads.

```php
class Order extends ModelBase
{
    public $addsRelationsInToArray = true;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
```

```php
$order = Order::with(['product', 'items'])->find(1);

$order->toArray();
// [
//     'id' => '...',
//     'total' => 99.99,
//     'product' => ['id' => '550e8400-...'],          // toSoftArray()
//     'items'   => [['id' => 10], ['id' => 11]],      // collection of toSoftArray()
// ]
```

**Behavior notes:**

- Only **loaded** relations are processed — unloaded relations are not added.
- A `belongsTo` that resolves to `null` is preserved as `null` in the output.
- An empty `hasMany` / `hasManyThrough` collection becomes `[]`.
- Items in a relation collection that don't extend `ModelBase` fall back to their
  default `toArray()` representation.

---

## Auto-Casting

Types are automatically inferred from validation rules:

| Validation Rule | Inferred Cast |
|-----------------|---------------|
| `boolean` | `boolean` |
| `integer` | `integer` |
| `numeric` | `float` |
| `array` | `array` |
| `date` | `datetime` |
| `date_format:Y-m-d` | `date:Y-m-d` |
| `date_format:Y-m-d H:i:s` | `datetime` |
| `Illuminate\Validation\Rules\Enum` | Enum class |

```php
class Product extends ModelBase
{
    protected array $rules = [
        'active' => ['boolean'],      // Cast to boolean
        'quantity' => ['integer'],    // Cast to integer
        'price' => ['numeric'],       // Cast to float
        'tags' => ['array'],          // Cast to array
        'expires_at' => ['date'],     // Cast to datetime
    ];

    // No need to define $casts - it's automatic!
}
```

---

## Custom Casts

### Built-in Casts

| Cast | Alias | Description |
|------|-------|-------------|
| `OnlyNumbers` | `only_numbers` | Removes non-numeric characters |
| `RemoveSpecialCharacters` | `remove_special_chars` | Removes special characters |
| `UuidToIdCast` | `uuid_to_id` | Converts UUID to internal ID via lookup |

### Using Casts

```php
class Customer extends ModelBase
{
    protected $casts = [
        // Using aliases (short names)
        'phone' => 'only_numbers',
        'name' => 'remove_special_chars',
        'category_id' => 'uuid_to_id:categories,external_id',

        // Or using full class names
        'document' => \DevToolbelt\LaravelEloquentPlus\Casts\OnlyNumbers::class,
    ];
}
```

### UuidToIdCast

Convert external UUIDs to internal IDs automatically:

```php
// When you receive a UUID from the API
$order->category_id = '550e8400-e29b-41d4-a716-446655440000';

// It's automatically converted to the internal ID
$order->category_id; // 42 (the actual ID from categories table)
```

---

## Lifecycle Hooks

Execute custom logic at specific points:

```php
class Invoice extends ModelBase
{
    protected function beforeValidate(): void
    {
        // Normalize data before validation
        $this->number = strtoupper($this->number);
    }

    protected function beforeSave(): void
    {
        // Logic after validation, before database write
        $this->total = $this->calculateTotal();
    }

    protected function afterSave(): void
    {
        // Logic after persisting to database
        event(new InvoiceSaved($this));
    }

    protected function beforeDelete(): void
    {
        // Cleanup before deletion
        $this->items()->delete();
    }

    protected function afterDelete(): void
    {
        // Logic after deletion
        Cache::forget("invoice:{$this->id}");
    }
}
```

### Hook Execution Order

**On Create:**
```
autoPopulateFields() → beforeValidate() → validation → beforeSave() → INSERT → afterSave()
```

**On Update:**
```
autoPopulateFields() → beforeValidate() → validation → beforeSave() → UPDATE → afterSave()
```

**On Delete:**
```
beforeDelete() → DELETE → afterDelete()
```

---

## Date Formatting

Control how date attributes are returned:

```php
class Event extends ModelBase
{
    // Return dates as formatted strings (default)
    protected bool $carbonInstanceInFieldDates = false;

    // Or return Carbon instances
    protected bool $carbonInstanceInFieldDates = true;

    protected array $rules = [
        'starts_at' => ['required', 'date_format:Y-m-d H:i:s'],
        'ends_at' => ['required', 'date_format:Y-m-d H:i:s'],
    ];
}
```

```php
$event->starts_at; // "2024-01-15 10:00:00" (string, when $carbonInstanceInFieldDates = false)
$event->starts_at; // Carbon instance (when $carbonInstanceInFieldDates = true)
```

---

## Configuration

### Publishing Configuration

You can publish the configuration file to customize package behavior:

```bash
php artisan vendor:publish --tag=eloquent-plus-config
```

This will create `config/devToolbelt/eloquent-plus.php` in your application.

### Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `blamable_field_type` | `'integer'` | Type of blamable fields (`created_by`, `updated_by`, `deleted_by`) |
| `blamable_field_value` | `null` | Callable to customize user identifier extraction (only for `string` type) |
| `blamable_strict_mode` | `false` | Throw exception if blamable columns are missing on the model |
| `timestamps_strict_mode` | `false` | Throw exception if timestamp columns are missing on the model |

#### Blamable Field Type

By default, blamable fields (`created_by`, `updated_by`, `deleted_by`) are validated as integers with an `exists` rule to ensure the user ID exists in the database.

If your application uses string-based user identifiers (like UUIDs stored as strings), you can change this:

```php
// config/devToolbelt/eloquent-plus.php
return [
    'blamable_field_type' => 'string', // Use 'string' for UUID or other string identifiers
];
```

**When set to `'integer'` (default):**
- Validation rules: `['nullable', 'integer', 'exists:users,id']`
- Ensures the user ID exists in the users table

**When set to `'string'`:**
- Validation rules: `['nullable', 'string']`
- User ID is cast to string automatically
- No existence check (useful for external user systems or UUIDs)

#### Blamable Field Value (Custom User Identifier)

When using `'string'` type, you can customize how the user identifier is retrieved using a callable:

```php
// config/devToolbelt/eloquent-plus.php
return [
    'blamable_field_type' => 'string',

    // Use external_id instead of the default user ID
    'blamable_field_value' => fn($user) => $user->external_id,
];
```

This is useful when:
- Your users have UUID-based external IDs
- You need to store a different identifier than the primary key
- You're integrating with external authentication systems

**Examples:**

```php
// Use external UUID
'blamable_field_value' => fn($user) => $user->external_id,

// Use email as identifier
'blamable_field_value' => fn($user) => $user->email,

// Use a formatted string
'blamable_field_value' => fn($user) => "user:{$user->id}",
```

#### Strict Mode

By default, missing blamable and timestamp columns are **silently skipped**. If you want to enforce that all expected columns exist on your models, enable strict mode:

```php
// config/devToolbelt/eloquent-plus.php
return [
    'blamable_strict_mode' => true,
    'timestamps_strict_mode' => true,
];
```

When strict mode is enabled, a `MissingModelPropertyException` is thrown if the model tries to set a column that doesn't exist:

```php
use DevToolbelt\LaravelEloquentPlus\Exceptions\MissingModelPropertyException;

// With blamable_strict_mode = true
// If the table is missing the 'created_by' column:
try {
    $post->save();
} catch (MissingModelPropertyException $e) {
    // 'The property "created_by" is required in model "App\Models\Post". ...'
}
```

This is useful during development to catch missing migrations early. In production, you may prefer the default behavior (`false`) to avoid unexpected errors.

### ModelBase Constants

| Constant | Default | Description |
|----------|---------|-------------|
| `CREATED_AT` | `'created_at'` | Created timestamp column |
| `UPDATED_AT` | `'updated_at'` | Updated timestamp column |
| `DELETED_AT` | `'deleted_at'` | Soft delete timestamp column |
| `CREATED_BY` | `'created_by'` | Created by user column |
| `UPDATED_BY` | `'updated_by'` | Updated by user column |
| `DELETED_BY` | `'deleted_by'` | Deleted by user column |
| `USES_EXTERNAL_ID` | `true` | Enable/disable external UUID |
| `EXTERNAL_ID_COLUMN` | `'external_id'` | External ID column name |

### ModelBase Properties

| Property | Default | Description |
|----------|---------|-------------|
| `$timestamps` | `true` | Enable timestamps |
| `$dateFormat` | `'Y-m-d H:i:s.u'` | Database date format |
| `$snakeAttributes` | `false` | Snake case in serialization |
| `$carbonInstanceInFieldDates` | `false` | Return Carbon vs string for dates |
| `$usesBlamable` | `false` | Enable audit trail (created_by, updated_by, deleted_by) |
| `$addsRelationsInToArray` | `false` | Replace loaded relations in `toArray()` with their `toSoftArray()` representation |

---

## Full Example

```php
<?php

namespace App\Models;

use DevToolbelt\LaravelEloquentPlus\ModelBase;
use App\Enums\OrderStatus;

class Order extends ModelBase
{
    protected bool $usesBlamable = true;

    protected $fillable = [
        'customer_id',
        'status',
        'total',
        'notes',
        'delivered_at',
        'created_at',
        'updated_at',
        'deleted_at',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected array $rules = [
        'customer_id' => ['required', 'uuid', 'exists:customers,external_id'],
        'status' => ['required', new \Illuminate\Validation\Rules\Enum(OrderStatus::class)],
        'total' => ['required', 'numeric', 'min:0'],
        'notes' => ['nullable', 'string', 'max:1000'],
        'delivered_at' => ['nullable', 'date_format:Y-m-d H:i:s'],
    ];

    protected $casts = [
        'customer_id' => 'uuid_to_id:customers,external_id',
    ];

    protected function beforeSave(): void
    {
        if ($this->isDirty('status') && $this->status === OrderStatus::Delivered) {
            $this->delivered_at = now();
        }
    }
}
```

---

## Development

### Running Tests

```bash
composer test
```

### Running Tests with Coverage

```bash
composer test:coverage
```

### Code Style (PSR-12)

```bash
composer phpcs
composer phpcs:fix
```

### Static Analysis (PHPStan)

```bash
composer phpstan
```

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Minimum **85% test coverage**
- PSR-12 coding standards
- PHPStan level 6 compliance

---

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

---

### Coverage Report

- **Dashboard:** [Codecov](https://codecov.io/gh/dev-toolbelt/laravel-eloquent-plus)
- **HTML Report:** [GitHub Pages](https://dev-toolbelt.github.io/laravel-eloquent-plus/)

## Credits

- [Kilderson Sena](https://github.com/dersonsena)
- [All Contributors](../../contributors)

---

Made with by [Dev Toolbelt](https://github.com/Dev-Toolbelt)
