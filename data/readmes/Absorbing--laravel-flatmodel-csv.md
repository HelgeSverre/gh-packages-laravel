<p align="center">
  <img src="/assets/FlatModel%20CSV.png">
</p>

FlatModel CSV is an Eloquent-inspired data modeling system for Laravel that works with CSV files.

It provides an expressive, familiar API for reading and writing flat data sources without relying on a database.

## Installation

Install with Composer into a new or existing Laravel project

```bash
composer require flatmodel/laravel-csv-flatmodel
```

## Usage

A new CSV model can be made by running the artisan command which will prompt for a few details.

```bash
php artisan make:csv-model CsvModel
```

If instead you want to skip the prompts, the arguments can be provided instead;

```bash
php artisan make:csv-model CsvModel --path=csv\data.csv --primary=id
```

Providing a primary key is optional and can be skipped with the `--noprimary` flag or by leaving the prompt empty when
prompted for a primary key.

Once the model is generated, it can be used similarly to standard models within Laravel

```php
use App\Models\CsvModel

$model = (new CsvModel)
        ->where('active', true)
        ->pluck('id');
```

The methods are returned as instances of the `Illuminate\Support\Collection` class that those familiar with Laravel will
be comfortable with. This also means that working with the data returned is simple and straightforward.

## Opt-in Features

FlatModel uses traits to provide optional functionality. Include these traits in your model as needed:

### Writable

Enables write operations (insert, update, delete, upsert):

```php
use FlatModel\CsvModel\Models\Model;
use FlatModel\CsvModel\Traits\Writable;

class EditableModel extends Model
{
    use Writable;

    protected string $path = 'data/users.csv';
    protected bool $writable = true;
}
```

### Backupable

Creates automatic timestamped backups before modifications:

```php
use FlatModel\CsvModel\Models\Model;
use FlatModel\CsvModel\Traits\Writable;
use FlatModel\CsvModel\Traits\Backupable;

class BackedUpModel extends Model
{
    use Writable, Backupable;

    protected string $path = 'data/users.csv';
    protected bool $writable = true;
    protected bool $enableBackup = true;
}
```

### AppendOnly

Restricts models to insert-only operations (no updates or deletes):

```php
use FlatModel\CsvModel\Models\Model;
use FlatModel\CsvModel\Traits\Writable;
use FlatModel\CsvModel\Traits\AppendOnly;

class LogModel extends Model
{
    use Writable, AppendOnly;

    protected string $path = 'logs/activity.csv';
    protected bool $writable = true;
    protected bool $appendOnly = true;
}
```

**Note:** `AppendOnly` requires the `Writable` trait since it restricts write operations.

### HeaderAware

Enables strict header validation and provides header utility methods:

```php
use FlatModel\CsvModel\Models\Model;
use FlatModel\CsvModel\Traits\HeaderAware;

class StrictHeaderModel extends Model
{
    use HeaderAware;

    protected string $path = 'data/users.csv';
    protected bool $hasHeaders = true;  // CSV has header row
    protected array $headers = ['id', 'name', 'email'];  // Expected headers
    protected bool $strictHeaders = true;  // Enforce exact match
}
```

**Strict mode behavior:**
- Throws `HeaderMismatchException` if CSV headers don't exactly match `$headers`
- Useful for validating CSV file structure
- Requires both `$headers` to be defined and `$strictHeaders = true`

**Without HeaderAware:**
- Headers are still loaded/generated but not validated
- More flexible for varying CSV structures

## Type Casting

CSV files store all data as strings. Use the `$cast` property to automatically convert values to specific types:

```php
use FlatModel\CsvModel\Models\Model;

class Product extends Model
{
    protected string $path = 'data/products.csv';
    
    protected array $cast = [
        'id' => 'int',
        'price' => 'float',
        'in_stock' => 'bool',
        'name' => 'string',
    ];
}

// Values are automatically cast when reading
$product = (new Product())->where('id', 1)->first();
// $product['id'] is now an integer, not a string
// $product['price'] is now a float
// $product['in_stock'] is now a boolean
```

**Supported cast types:**
- `int` or `integer` - Cast to integer
- `float` or `double` - Cast to floating point number
- `bool` or `boolean` - Cast to boolean (handles "true", "false", "1", "0", etc.)
- `string` - Cast to string

Type casting is applied automatically when:
- Reading data with `get()`, `first()`, `pluck()`, etc.
- Writing data with `insert()`, `update()`, `upsert()`

## Working with Headerless CSV Files

If your CSV file doesn't have a header row, set `$hasHeaders = false`:

### Option 1: Provide custom column names

```php
class DataModel extends Model
{
    protected string $path = 'data/raw-data.csv';
    protected bool $hasHeaders = false;
    protected array $headers = ['id', 'name', 'value'];  // Custom column names
}

// Access with your custom names
$model = new DataModel();
$model->where('name', 'John')->get();
```

### Option 2: Use numeric indices

```php
class NumericModel extends Model
{
    protected string $path = 'data/raw-data.csv';
    protected bool $hasHeaders = false;
    // No headers defined - will use: ['0', '1', '2', ...]
}

// Access with numeric indices
$model = new NumericModel();
$model->where('0', 'John')->get();  // First column
$model->pluck('2');                 // Third column
```

### Header Row vs No Header Row

```csv
# WITH header row ($hasHeaders = true) - DEFAULT
id,name,email
1,John,john@example.com
2,Jane,jane@example.com

# WITHOUT header row ($hasHeaders = false)
1,John,john@example.com
2,Jane,jane@example.com
```

## Query Methods

For interacting and querying data from the model, the following are available:

- `where(string $column, mixed $value)` - Filter rows by column value
- `first()` - Get the first matching row as an array, or null if no match
- `get()` - Get all matching rows as a Collection
- `pluck(string $column)` - Get a Collection of values from a specific column
- `select(string ...$columns)` - Select specific columns to return
- `value(string $column)` - Get the first value from a column, or null if not found

The model has a series of configurable properties that will enable or disable functionality.

| Property         | Type    | Description                                                                                                                                                                    | Default |
|------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `$path`          | string  | The path of the file                                                                                                                                                           |         |
| `$delimiter`     | string  | The delimiter used within the file                                                                                                                                             | `,`     |
| `$enclosure`     | string  | The enclosure character used to wrap field values in the file                                                                                                                  | `"`     |
| `$escape`        | string  | The escape character used in the file                                                                                                                                          | `\`     |
| `$stream`        | boolean | Indicates whether the model operates in stream mode                                                                                                                            | `false` |
| `$headers`       | array   | Array of column headers from the CSV file, if not provided will try to autodetect from file                                                                                    | `[]`    |
| `$hasHeaders`    | boolean | Indicates whether the CSV file has a header row. If true, the first row is treated as column names. If false, data starts from the first row.                                   | `true`  |
| `$strictHeaders` | boolean | Enables or disables strict header checking                                                                                                                                     | `false` |
| `$cast`          | array   | Defines type casting rules for columns. Valid cast types are `int`, `float`, `bool` and `string`                                                                               | `[]`    |
| `$writable`      | boolean | Indicates whether the model is writable, if true the model can be used to write data back to the file. If false, the model is read-only                                        | `false` |
| `$appendOnly`    | boolean | Indicates whether the model is append-only. If true the model will only have data added to the end of the file, updates cannot be written to models configured for append-only | `false` |
| `$enableBackup`  | boolean | Enables or disables automatic backups on modification of the file                                                                                                              | `false` |
| `$autoFlush`     | boolean | Indicates whether the model should flush the data to the CSV file on every modification                                                                                        | `false` |

> [!IMPORTANT]
> If `$autoFlush` is set to `false` (as it is by default), `flush()` should be manually called to persist the data to
> the file.

## Writing, Mutating & Flushing Data

Writable models can be modified and saved back to the file using `flush()` or `save()` if `$autoFlush` is disabled by
using `false`.

```php
$model = new CsvModel;

$model->insert(['id' => 5, 'name' => 'Alex']);
$model->flush(); // Writes changes to the file
```

Updates and deletes are also possible using similarly named methods using functional filtering.

```php
$model = new CsvModel;

// Update a matching row
$model->update(
    fn($row) => $row['id'] === 5,
    fn($row) => [...$row, 'name' => 'Alexa']
);

// Upsert: update if found, insert if not
$model->upsert(
    fn($row) => $row['id'] === 10,
    fn($row) => ['id' => 10, 'name' => 'New User']
);

// Delete matching rows
$model->delete(fn($row) => $row['id'] === 2);

// Save changes to disk
$model->flush();
```

Models can also be updated using more familiar array-based syntax.

```php
$model->update(['id' => 5], ['name' => 'Alexa']);
$model->upsert(['id' => 10], ['id' => 10, 'name' => 'New User']);
$model->delete(['id' => 2]);
```

> [!WARNING]
> Models in stream mode cannot be written back to the file and are read-only. If an attempt is made to write to a model
> implementing stream mode, a `StreamWriteException` will be thrown.

> [!WARNING]
> If the model is in append-only mode, updates, upserts and deletes will throw an `AppendOnlyViolationException` exception.

## Exception Handling

FlatModel uses custom exceptions to provide clear and understandable error context all extending a common base of
`FlatModelException`.

| Exception                      | Description                                                      |
|--------------------------------|------------------------------------------------------------------|
| `AppendOnlyViolationException` | When updating or deleting a model flagged as append-only         |
| `BackupFailedException`        | When a backup fails prior to committing any changes to the file  |
| `CastingException`             | When a type casting operation fails for a column value           |
| `ColumnNotFoundException`      | When attempting to access a column that doesn't exist in the CSV |
| `FileNotFoundException`        | When the specified CSV file cannot be found                      |
| `FileWriteException`           | When writing changes to the CSV file fails                       |
| `HeaderMismatchException`      | When headers don't match expected values in strict mode          |
| `InvalidHandleException`       | When attempting to read or write to an invalid file handle       |
| `InvalidRowFormatException`    | When a row doesn't match the expected format                     |
| `MissingHeaderException`       | When required headers are missing from the CSV                   |
| `PrimaryKeyMissingException`   | When a primary key operation is attempted without a defined key  |
| `StreamOpenException`          | When opening the CSV file in stream mode fails                   |
| `StreamWriteException`         | When attempting to write to a model in stream mode               |
| `WriteNotAllowedException`     | When attempting to write to a read-only model                    |

## Testing

Run tests using Composer:

```bash
composer test
```

Or run PHPUnit directly:

```bash
vendor/bin/phpunit
```

## License

FlatModel is open-sourced software licensed under the [MIT license](LICENSE).
