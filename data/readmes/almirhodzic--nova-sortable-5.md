# Nova Sortable 5

![Nova Sortable 5](https://novafront.dev/images/sortable/sortable-screenshot.jpg)

A Laravel Nova 5 package for drag-and-drop and arrow-based sorting of resources.

- Drag-and-drop reordering via [SortableJS](https://sortablejs.github.io/Sortable/)
- Up/down arrow buttons for precise ordering
- Visual feedback: green border on moved row, red border on displaced row
- Toast notifications on success/error
- Publishable config for global defaults
- No full page reload — instant DOM updates

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Setup](#setup)
    - [1. Add a sort column to your table](#1-add-a-sort-column-to-your-table)
    - [2. Add the trait to your Eloquent Model](#2-add-the-trait-to-your-eloquent-model)
    - [3. Add the trait and field to your Nova Resource](#3-add-the-trait-and-field-to-your-nova-resource)
- [Configuration](#configuration)
- [Field Options](#field-options)
- [How it works](#how-it-works)
- [Model Features](#model-features)
- [License](#license)

## Requirements

- PHP ^8.2
- Laravel Nova ^5.0

## Installation

```bash
composer require almirhodzic/nova-sortable-5
```

The service provider is auto-discovered. No manual registration needed.

### Publish the config (optional)

```bash
php artisan vendor:publish --tag=frontbyte-nova-sortable-config
```

This creates `config/frontbyte-nova-sortable.php` where you can set global defaults.

## Setup

### 1. Add a sort column to your table

**New table:**

```php
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->unsignedInteger('sort_order')->default(0);
    // ... other columns
    $table->timestamps();
});
```

**Existing table** — create a migration to add the column:

```bash
php artisan make:migration add_sort_order_to_services_table
```

```php
Schema::table('services', function (Blueprint $table) {
    $table->unsignedInteger('sort_order')->default(0)->after('id');
});
```

Then run the migration:

```bash
php artisan migrate
```

After migrating, you can initialize the order values for existing rows:

```bash
php artisan tinker
```

```php
App\Models\Service::query()->each(function ($service, $index) {
    $service->update(['sort_order' => $index + 1]);
});
```

### 2. Add the trait to your Eloquent Model

```php
use AlmirHodzic\NovaSortable5\HasSortableRows;

class Service extends Model
{
    use HasSortableRows;

    protected string $sortableColumn = 'sort_order';
}
```

The `$sortableColumn` property is optional. If omitted, it uses the `default_column` from the config (default: `order`).

### 3. Add the trait and field to your Nova Resource

```php
use AlmirHodzic\NovaSortable5\Sortable;
use AlmirHodzic\NovaSortable5\SortableResource;

class Service extends Resource
{
    use SortableResource;

    public function fields(NovaRequest $request): array
    {
        return [
            Sortable::make('Order', 'sort_order'),

            // ... other fields
        ];
    }
}
```

The `SortableResource` trait ensures Nova sorts by your sortable column by default, preventing conflicts with drag-and-drop.

> **Tip:** If you're adding this package to an existing resource with pre-existing rows, their `sort_order` values will initially all be `0`. Simply perform a single drag-and-drop reorder in the admin panel — the package will automatically recalculate and persist the `sort_order` for all rows in the table.

## Configuration

After publishing, edit `config/frontbyte-nova-sortable.php`:

```php
return [
    // Default database column for sorting
    'default_column' => 'sort_order',

    // Default sort direction: 'asc' or 'desc'
    'order_direction' => 'asc',

    // Show the drag handle (bars icon)
    'show_drag_handle' => true,

    // Show up/down arrow buttons
    'show_order_arrows' => true,

    // Show the order number
    'show_order_number' => true,

    // Show toast messages after reordering
    'show_toast' => true,

    // Authentication guards for the API routes
    'guards' => ['web'],
];
```

All config values serve as global defaults. You can override them per field (see below).

## Field Options

You can override config defaults per resource by chaining methods on the `Sortable` field:

| Method                                    | Description                         |
| ----------------------------------------- | ----------------------------------- |
| `showDragHandle()` / `hideDragHandle()`   | Toggle drag handle visibility       |
| `showSortArrows()` / `hideSortArrows()`   | Toggle arrow buttons                |
| `showOrderNumber()` / `hideOrderNumber()` | Toggle order number display         |
| `showToast()` / `hideToast()`             | Toggle success/error toast messages |

### Auto-assign order on create

By default, the package automatically assigns the next order value (`max + 1`) when creating a new model. This means every new entry is added to the end of the list.

If you want to control the order value manually (e.g. via a form field), you can disable this:

```php
Sortable::make('Order', 'sort_order')
    ->autoAssignOnCreate(false)
```

With auto-assign disabled, you are responsible for setting the `sort_order` value yourself:

```php
Service::create([
    'name' => 'My Service',
    'sort_order' => 5, // must be set manually
]);
```

## How it works

**Drag-and-drop:** Grab the bars icon and drag a row to its new position. All affected rows are reordered in a single API call.

**Arrow buttons:** Click the up/down arrows to swap a row with its neighbor. Only the two affected rows are swapped.

**Visual feedback:** After sorting, the moved row flashes green and the displaced row flashes red — providing clear visual confirmation of what changed.

**No page reload:** All updates happen via API calls with instant DOM manipulation. The order numbers update automatically.

## Model Features

The `HasSortableRows` trait provides:

```php
// Auto-assigns the next order value when creating a model
$service = Service::create(['name' => 'New Service']);
// sort_order is automatically set to max + 1

// Move a model to a specific position (re-indexes other rows)
$service->moveToPosition(1);

// Query scope for custom ordering
Service::orderBySortable('desc')->get();

// Get the sortable column name
$service->getSortableColumn(); // 'sort_order'
```

## License

MIT License. See [LICENSE](LICENSE) for details.
