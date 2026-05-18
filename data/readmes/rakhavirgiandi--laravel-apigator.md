# 🚀 Laravel Apigator

Auto-generate production-ready CRUD APIs — Controller, Model, and Routes — straight from your database tables. Comes with DataTables support, dynamic query filtering, custom schema joins, and full SQL injection protection.

---

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Command Options](#command-options)
5. [Generated Files](#generated-files)
6. [API Endpoints](#api-endpoints)
7. [Dynamic Query Filtering](#dynamic-query-filtering)
8. [Eager Loading Relations](#eager-loading-relations)
9. [Custom Schema (mapSchema)](#custom-schema-mapschema)
10. [DataTables Integration](#datatables-integration)
11. [Validation Rules](#validation-rules)
12. [Configuration](#configuration)
13. [Security](#security)
14. [Advanced Usage](#advanced-usage)
15. [File Structure](#file-structure)

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.x
- MySQL, MariaDB, PostgreSQL, SQLite, or SQL Server

---

## Installation

```bash
composer require rakhavirgiandi/laravel-apigator
```

Publish the config file (optional):

```bash
php artisan vendor:publish --tag=apigator-config
```

---

## Quick Start

```bash
# Generate everything for a single table
php artisan apigator:generate --table=products

# Generate for all tables at once
php artisan apigator:generate --table=all

# Use a specific database connection
php artisan apigator:generate --table=products --connection=mysql_secondary

# Only generate specific parts
php artisan apigator:generate --table=products --generate=model,controller

# Custom output directories
php artisan apigator:generate --table=products \
    --controller-dir=Http/Controllers/API/V1 \
    --model-dir=Models/API

# Overwrite existing files
php artisan apigator:generate --table=products --force
```

---

## Command Options

| Option | Description | Default |
|---|---|---|
| `--table=` | Table name, or `all` to generate for every table | *(required)* |
| `--connection=` | Database connection to use | App default connection |
| `--generate=` | Comma-separated list: `model`, `controller`, `route` | All three |
| `--controller-dir=` | Controller directory (relative to `app/`) | `Http/Controllers/API` |
| `--model-dir=` | Model directory (relative to `app/`) | `Models` |
| `--force` | Overwrite existing files | `false` |

### `--connection`

Point the generator to any connection defined in `config/database.php`:

```bash
php artisan apigator:generate --table=orders --connection=pgsql
php artisan apigator:generate --table=all    --connection=mysql_secondary
```

Connection resolution order: `--connection` → `config('apigator.connection')` → app default.

> The generator validates the connection exists before running. An invalid connection name will exit early with a clear error.

### `--generate`

Pick exactly what gets created — useful when you only need to regenerate one part:

```bash
# Model only
php artisan apigator:generate --table=products --generate=model

# Model + controller, skip routes
php artisan apigator:generate --table=products --generate=model,controller

# Routes only (model and controller already exist)
php artisan apigator:generate --table=products --generate=route --force
```

Valid values: `model`, `controller`, `route`. Order doesn't matter — files are always generated in the correct sequence (model → controller → route).

### Safety Checks

The generator automatically:

- Verifies the table exists in the database before generating anything
- Skips already-generated files (unless `--force` is passed)
- Only checks file existence for the parts you're actually generating
- Skips system tables (`migrations`, `sessions`, `cache`, etc.) when using `--table=all`

---

## Generated Files

For a table named `products`, the command produces:

```
app/
  Models/
    Product.php                 ← Eloquent model with ApiModelTrait
  Http/Controllers/API/
    ProductController.php       ← Thin controller, logic lives in the model
routes/
  api.php                       ← 6 routes appended inside the Apigator marker block
```

### Route Marker Block

All generated routes are written inside a clearly marked area in your route file. This makes them easy to find and prevents duplication:

```php
// [APIGATOR_ENDPOINTS_START]

// [APIGATOR_ENDPOINTS] products
Route::get('/products',            [ProductController::class, 'index']);
Route::get('/products/{id}',       [ProductController::class, 'show']);
// ...

// [APIGATOR_ENDPOINTS] orders
Route::get('/orders',              [OrderController::class, 'index']);
// ...

// [APIGATOR_ENDPOINTS_END]
```

If the marker block doesn't exist yet, it is created at the end of the file automatically. New tables are always inserted just before `[APIGATOR_ENDPOINTS_END]`.

---

## API Endpoints

For a table `products` (model `Product`, slug `products`):

| Method | URL | Description |
|---|---|---|
| `GET` | `/products` | Paginated list |
| `GET` | `/products/{id}` | Single record by ID |
| `POST` | `/products` | Create a record |
| `PATCH` | `/products/{id}` | Partial update |
| `DELETE` | `/products/{id}` | Delete a record |
| `POST` | `/products_datatable` | DataTables server-side endpoint |

### GET /products — List

```
GET /products?page=1&per_page=15
```

```json
{
    "success": true,
    "message": "Success",
    "data": {
        "meta": {
            "current_page": 1,
            "per_page": 15,
            "total_pages": 4,
            "total_items": 48
        },
        "data": [...]
    }
}
```

### GET /products/{id} — Single Record

```
GET /products/5
```

Search by a custom column (must be a real column):

```
GET /products/ABC-001?column=code
```

### POST /products — Create

```json
{
    "name": "Widget A",
    "price": 29.99,
    "category_id": 3
}
```

Response `201`:

```json
{
    "success": true,
    "message": "Product created successfully.",
    "data": { "id": 42, "name": "Widget A", ... }
}
```

### PATCH /products/{id} — Partial Update

Only send the fields you want to change:

```json
{ "price": 34.99 }
```

### DELETE /products/{id} — Delete

If the model uses `SoftDeletes`, the record is soft-deleted instead of permanently removed.

---

## Dynamic Query Filtering

All `GET` list endpoints and the DataTables endpoint support rich query filtering via URL parameters. Every filter is **SQL-injection safe** — column names are whitelisted against the actual schema and sanitized before use.

### Basic Equality

```
GET /products?status=active
GET /products?category_id=3
```

### Operators

Append `[operator]` to any column name:

| Parameter | SQL Equivalent |
|---|---|
| `?col[eq]=val` | `col = val` |
| `?col[neq]=val` | `col != val` |
| `?col[gt]=val` | `col > val` |
| `?col[gte]=val` | `col >= val` |
| `?col[lt]=val` | `col < val` |
| `?col[lte]=val` | `col <= val` |
| `?col[like]=val` | `col LIKE %val%` |
| `?col[starts]=val` | `col LIKE val%` |
| `?col[ends]=val` | `col LIKE %val` |
| `?col[in]=a,b,c` | `col IN (a, b, c)` |
| `?col[not_in]=a,b,c` | `col NOT IN (a, b, c)` |
| `?col[null]=1` | `col IS NULL` |
| `?col[not_null]=1` | `col IS NOT NULL` |
| `?col[between]=val1,val2` | `col BETWEEN val1 AND val2` |
| `?col[date_from]=2024-01-01` | `DATE(col) >= 2024-01-01` |
| `?col[date_to]=2024-12-31` | `DATE(col) <= 2024-12-31` |

**Examples:**

```
GET /products?price[between]=10,100
GET /products?created_at[date_from]=2024-01-01&created_at[date_to]=2024-12-31
GET /products?name[like]=widget
GET /products?status[in]=active,draft
GET /products?deleted_at[null]=1
```

### OR Groups

Combine conditions with OR using the `_or` parameter:

```
GET /products?_or[0][status][eq]=active&_or[1][featured][eq]=1
```
→ `WHERE (status = 'active') OR (featured = 1)`

Mix OR and AND freely:

```
GET /products?category_id=3&_or[0][name][like]=widget&_or[1][name][like]=gadget
```
→ `WHERE category_id = 3 AND ((name LIKE '%widget%') OR (name LIKE '%gadget%'))`

### Full-Text Search

```
GET /products?_search=blue widget
```

Searches across all `string`-type columns defined in `mapSchema`.

### Sorting

```
GET /products?_sort=name              # ASC
GET /products?_sort=-price            # DESC (prefix with -)
GET /products?_sort=category_id,-price  # multi-column
```

### Pagination

```
GET /products?page=2&per_page=25
```

---

## Eager Loading Relations

Any `GET` list or single-record endpoint supports eager loading Eloquent relations via the `with` query parameter. Relations are **validated before loading** — if the method doesn't exist or doesn't return an Eloquent `Relation`, it is silently skipped so typos never cause a fatal error.

### Basic Usage

```
GET /products?with=category
GET /products?with=user,role
```

### Nested Relations (dot notation)

```
GET /products?with=user.organization
GET /products?with=user.organization.country
GET /products?with=user.organization,role.permissions
```

Each segment of the dot-chain is validated against the corresponding model in sequence. If any segment is invalid, the **whole chain** is dropped — not just the bad segment.

**Validation walk for `?with=user.organization.country`:**

```
user          → method_exists(Product, 'user')? ✅ → resolves to User model
organization  → method_exists(User, 'organization')? ✅ → resolves to Organization model
country       → method_exists(Organization, 'country')? ✅ → chain valid ✅
```

### Calling Directly from Code

```php
Product::getList([
    'with' => 'user.organization,role',
]);
```

### Supported Formats

| Format | Example |
|---|---|
| Single relation | `?with=user` |
| Multiple relations | `?with=user,role` |
| Nested (dot notation) | `?with=user.organization` |
| Multiple nested | `?with=user.organization,role.permissions` |

---

## Custom Schema (mapSchema)

The generated model includes a `mapSchema()` method where you define custom SELECT columns, JOIN definitions, and static WHERE conditions.

### Example: Products with Category join and inventory calculation

```php
public static function mapSchema(array $params = [], array $user = []): array
{
    $model = new self;
    $warehouseId = $params['warehouse_id'] ?? '';

    return [
        'field' => [
            'id'            => ['column' => $model->table.'.id',         'alias' => 'id',           'type' => 'int'],
            'code'          => ['column' => $model->table.'.code',        'alias' => 'code',          'type' => 'string'],
            'name'          => ['column' => $model->table.'.name',        'alias' => 'name',          'type' => 'string'],
            'category_id'   => ['column' => $model->table.'.category_id', 'alias' => 'category_id',   'type' => 'int'],
            'category_name' => ['column' => 'cat.name',                   'alias' => 'category_name', 'type' => 'string'],
            'qty_on_hand'   => [
                'column' => 'COALESCE(inv.qty, 0)',
                'alias'  => 'qty_on_hand',
                'type'   => 'float',
                'is_raw' => true,   // ← treated as a raw SQL expression
            ],
            'has_variants'  => [
                'column' => "CASE WHEN EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = {$model->table}.id) THEN 1 ELSE 0 END",
                'alias'  => 'has_variants',
                'type'   => 'bool',
                'is_raw' => true,
            ],
        ],
        'join' => [
            [
                'table' => 'categories as cat',
                'type'  => 'left',
                'on'    => ['cat.id', '=', $model->table.'.category_id'],
            ],
            [
                'table' => DB::raw("
                    (
                        SELECT product_id, SUM(
                            CASE WHEN type = 'IN' THEN qty ELSE -qty END
                        ) AS qty
                        FROM inventory_movements
                        WHERE deleted_at IS NULL
                        " . ($warehouseId ? "AND warehouse_id = {$warehouseId}" : "") . "
                        GROUP BY product_id
                    ) as inv
                "),
                'type'  => 'left',
                'on'    => ['inv.product_id', '=', $model->table.'.id'],
            ],
        ],
        'where' => [
            ['column' => $model->table.'.deleted_at', 'operator' => 'IS NULL', 'value' => null],
        ],
    ];
}
```

### Field Definition Reference

| Key | Type | Description |
|---|---|---|
| `column` | `string` | SQL column expression — `table.column` or a raw SQL expression |
| `alias` | `string` | The key name returned in the response |
| `type` | `string` | `string`, `int`, `float`, `bool`, `date`, `datetime`, `json` |
| `is_raw` | `bool` | When `true`, the `column` value is used as raw SQL (not quoted) |

### Dynamic Parameters in mapSchema

`mapSchema` receives the full request `$params` array, so you can drive query logic from any request parameter:

```php
// ?warehouse_id=5 filters inventory per warehouse
$warehouseId = $params['warehouse_id'] ?? '';
```

---

## DataTables Integration

### JavaScript Setup (DataTables 1.x / 2.x)

```javascript
$('#table').DataTable({
    processing: true,
    serverSide: true,
    ajax: {
        url: '/api/products_datatable',
        type: 'POST',
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
            'Authorization': 'Bearer ' + token,
        },
    },
    columns: [
        { data: 'id',     name: 'id' },
        { data: 'name',   name: 'name' },
        { data: 'price',  name: 'price' },
        { data: 'status', name: 'status', searchable: false },
    ],
});
```

### Server Response Format

```json
{
    "draw": 1,
    "recordsTotal": 500,
    "recordsFiltered": 48,
    "data": [...]
}
```

### Features

- Global search (across all `searchable: true` columns)
- Per-column search and multi-column sort
- Pagination via `start` / `length`
- Works with `mapSchema` joins and computed columns
- Compatible with DataTables 1.x and 2.x

---

## Validation Rules

Validation rules are **auto-generated from the database schema** at generation time. They live in two static methods on the model:

```php
Product::createRules()   // Used by POST  — required fields are marked required
Product::updateRules()   // Used by PATCH — all fields become optional
```

### Type → Rule Mapping

| DB Type | Validation Rule |
|---|---|
| `int`, `int2`, `int4`, `int8`, `integer`, `bigint`, `smallint` | `integer` |
| `decimal`, `numeric`, `float`, `double` | `numeric` |
| `bool`, `boolean` | `boolean` |
| `date` | `date` |
| `datetime`, `timestamp` | `date` |
| `time` | `date_format:H:i:s` |
| `json`, `jsonb` | `json` |
| Everything else | `string` |

Non-nullable columns → `required`. Nullable columns → `nullable`.

You can customize the rules directly in the model at any time:

```php
public static function createRules(): array
{
    return [
        'name'   => ['required', 'string', 'max:255', 'unique:products,name'],
        'email'  => ['required', 'email'],
        'price'  => ['required', 'numeric', 'min:0'],
        'status' => ['required', 'string', 'in:active,inactive,draft'],
        'image'  => ['nullable', 'image', 'max:2048'],
    ];
}
```

---

## Configuration

`config/apigator.php`:

```php
return [
    // Default database connection (falls back to app default if not set)
    'connection' => null,

    // Default controller directory (relative to app/)
    'controller_directory' => 'Http/Controllers/API',

    // Default model directory (relative to app/)
    'model_directory' => 'Models',

    // Default API route delimiter
    'route_delimiter' => '_',

    // Route file where generated routes are appended
    'route_file' => 'routes/api.php',

    // Default items per page
    'default_per_page' => 10,

    // Tables skipped when using --table=all
    'exclude_tables' => [
        'migrations', 'password_resets', 'failed_jobs',
        'personal_access_tokens', 'sessions', 'cache',
        'cache_locks', 'jobs', 'job_batches',
    ],
];
```

> **Note:** `route_middleware` has been removed. Apply middleware directly in your route file using Laravel's standard `Route::middleware(...)` wrapper around the Apigator marker block if needed.

---

## Security

### SQL Injection Protection

Every dynamic parameter passes through a multi-layer defense:

1. **Column whitelist** — column names are validated against `Schema::getColumnListing()`. Unknown columns are silently ignored.
2. **Operator whitelist** — only operators in the `OPERATORS` constant are accepted. Unknown operators are silently ignored.
3. **Column sanitization** — after whitelist check, column names are regex-sanitized to `[a-zA-Z0-9_.]` only.
4. **LIKE escaping** — `%` and `_` in user values are escaped before being used in `LIKE` clauses.
5. **Parameter binding** — all values go through PDO parameter binding; nothing is ever interpolated directly.

### Input Validation

- All `POST` and `PATCH` data is validated through Laravel's `Validator` before touching the database.
- The `column` parameter in `GET /{slug}/{id}?column=X` is validated against `Schema::getColumnListing()`.

---

## Advanced Usage

### Using ApiModelTrait in Existing Models

Add the trait to any existing model without regenerating:

```php
use Virgiandi\ApiGenerator\Traits\ApiModelTrait;

class Product extends Model
{
    use ApiModelTrait;

    public static function mapSchema(array $params = [], array $user = []): array
    {
        // your schema definition
    }
}
```

### Calling Model Methods Directly

```php
// Paginated list with filters
$result = Product::getList([
    'status'     => 'active',
    'price[lte]' => 100,
    '_sort'      => '-created_at',
    'per_page'   => 20,
    'with'       => 'category,user.organization',  // eager load relations
]);

// Single record
$product = Product::getById(5);
$product = Product::getById('PROD-001', ['column' => 'sku']);

// Create / update / delete
$product = Product::createRecord(['name' => 'New', 'price' => 9.99]);
Product::updateRecord(5, ['price' => 14.99]);
Product::deleteRecord(5);

// DataTables
$data = Product::getDatatable($request->all());
```

### Extending the Controller

Generated controllers are intentionally thin. Add custom logic by extending:

```php
class ProductController extends \App\Http\Controllers\API\ProductController
{
    public function store(Request $request): JsonResponse
    {
        $request->merge(['created_by' => auth()->id()]);
        return parent::store($request);
    }
}
```

---

## File Structure

```
laravel-apigator/
├── composer.json
├── config/
│   └── apigator.php
└── src/
    ├── ApigatorServiceProvider.php
    ├── Commands/
    │   └── GenerateApiCommand.php        ← Artisan command
    ├── Generators/
    │   ├── ModelGenerator.php            ← Builds the Model PHP file
    │   ├── ControllerGenerator.php       ← Builds the Controller PHP file
    │   └── RouteGenerator.php            ← Appends routes inside the marker block
    ├── Support/
    │   ├── DynamicQueryParser.php        ← Parses URL params into Eloquent filters
    │   ├── SchemaQueryBuilder.php        ← Builds queries from mapSchema definitions
    │   └── ValidationRuleBuilder.php     ← Derives validation rules from column types
    └── Traits/
        ├── ApiModelTrait.php             ← Core CRUD + DataTables logic (on Model)
        └── ApiControllerTrait.php        ← JSON response helpers (on Controller)
```

---

## License

MIT