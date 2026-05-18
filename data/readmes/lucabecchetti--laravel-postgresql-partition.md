# Laravel PostgreSQL Partition

**Laravel-pgsql-partition** is a useful Laravel package to easily work with [PostgreSQL Table Partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html). Partitioning requires PostgreSQL version >= 10.0.

## Installation

Add the package using composer:

```sh
$ composer require brokenice/laravel-pgsql-partition
```

For Laravel versions before 5.5 or if not using auto-discovery, register the service provider in `config/app.php`:

```php
'providers' => [
  /*
   * Package Service Providers...
   */
  Brokenice\LaravelPgsqlPartition\PartitionServiceProvider::class,
],
```

## Quickstart

### Create a partitioned table migration

From the command line:

```shell
php artisan make:migration create_partitioned_orders_table
```

Then edit the migration you just created:

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Brokenice\LaravelPgsqlPartition\Models\Partition;
use Brokenice\LaravelPgsqlPartition\Schema\Schema;

class CreatePartitionedOrdersTable extends Migration
{
    public function up()
    {
        // Create the partitioned table
        DB::statement('
            CREATE TABLE orders (
                id BIGSERIAL,
                customer_id BIGINT NOT NULL,
                order_date DATE NOT NULL,
                total DECIMAL(10,2),
                created_at TIMESTAMP,
                updated_at TIMESTAMP,
                PRIMARY KEY (id, order_date)
            ) PARTITION BY RANGE (order_date)
        ');

        // Add partitions for years
        Schema::partitionByYears('orders', 'order_date', 2022, 2025);
    }

    public function down()
    {
        Schema::drop('orders');
    }
}
```

Run the migration:

```shell
php artisan migrate
```

## Partition Types Support

PostgreSQL supports these partitioning methods:

| Type | Description |
|------|-------------|
| RANGE | Partition based on a range of values |
| LIST | Partition based on a list of discrete values |
| HASH | Partition based on hash of the partition key |

## Usage Examples

### Partition by RANGE

This type of partitioning assigns rows to partitions based on column values falling within a given range.

```php
use Brokenice\LaravelPgsqlPartition\Models\Partition;
use Brokenice\LaravelPgsqlPartition\Schema\Schema;

// Add individual range partitions
Schema::addRangePartition('orders', 'orders_2024', '2024-01-01', '2025-01-01');
Schema::addRangePartition('orders', 'orders_2025', '2025-01-01', '2026-01-01');

// Or create multiple partitions at once using Partition objects
$partitions = [
    Partition::range('orders_2024', '2024-01-01', '2025-01-01'),
    Partition::range('orders_2025', '2025-01-01', '2026-01-01'),
];
Schema::partitionByRange('orders', 'order_date', $partitions);

// Add a default partition for future values
Schema::addDefaultPartition('orders', 'orders_default');
```

### Partition by LIST

Similar to partitioning by RANGE, except that the partition is selected based on columns matching one of a set of discrete values.

```php
// Create LIST partitions
Schema::addListPartition('users', 'users_europe', ['IT', 'FR', 'DE', 'ES']);
Schema::addListPartition('users', 'users_america', ['US', 'CA', 'MX', 'BR']);

// Or using Partition objects
$partitions = [
    Partition::list('server_east', [1, 43, 65, 12, 56, 73]),
    Partition::list('server_west', [534, 6422, 196, 956, 22]),
];
Schema::partitionByList('servers', 'region_id', $partitions);
```

### Partition by HASH

With this type of partitioning, a partition is selected based on the hash of the partition key.

```php
// Create 4 hash partitions
Schema::partitionByHash('logs', 'user_id', 4);

// This creates:
// logs_p0 - FOR VALUES WITH (MODULUS 4, REMAINDER 0)
// logs_p1 - FOR VALUES WITH (MODULUS 4, REMAINDER 1)
// logs_p2 - FOR VALUES WITH (MODULUS 4, REMAINDER 2)
// logs_p3 - FOR VALUES WITH (MODULUS 4, REMAINDER 3)
```

### Partition by YEARS

Convenience method to partition a table by year ranges:

```php
// Create yearly partitions from 2020 to 2025
Schema::partitionByYears('events', 'event_date', 2020, 2025);

// Omit end year to use current year
Schema::partitionByYears('events', 'event_date', 2020);
```

### Partition by YEARS AND MONTHS

Create partitions for each month within a year range:

```php
// Create monthly partitions for 2024
Schema::partitionByYearsAndMonths('logs', 'created_at', 2024);

// Create monthly partitions from 2023 to 2024
Schema::partitionByYearsAndMonths('logs', 'created_at', 2023, 2024);
```

## Partition Maintenance

### Detach a Partition

Detaching a partition keeps the data but removes it from the partitioned table:

```php
Schema::detachPartition('orders', 'orders_2022');
// orders_2022 is now a standalone table
```

### Attach a Partition

Attach an existing table as a partition:

```php
$partitionDef = Partition::range('orders_2022', '2022-01-01', '2023-01-01');
Schema::attachPartition('orders', 'orders_2022', $partitionDef);
```

### Drop a Partition

Permanently delete a partition and its data:

```php
Schema::dropPartition('orders_2022');
```

### Truncate a Partition

Remove all data from a partition:

```php
Schema::truncatePartition('orders_2022');

// Or multiple partitions
Schema::truncatePartitions(['orders_2022', 'orders_2023']);
```

### Vacuum (Optimize)

Reclaim storage and update statistics:

```php
Schema::vacuumPartition('orders_2024');
Schema::vacuumPartition('orders_2024', true); // VACUUM FULL
```

### Analyze

Update query planner statistics:

```php
Schema::analyzePartition('orders_2024');
Schema::analyzePartitions(['orders_2024', 'orders_2025']);
```

### Reindex

Rebuild indexes on a partition:

```php
Schema::reindexPartition('orders_2024');
```

## Querying Partitions with Eloquent

### Create a Model

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'orders';
}
```

### Query a Specific Partition

In PostgreSQL, partitions are separate tables, so you can query them directly:

```php
// Query the orders_2024 partition directly
Order::partition('orders_2024')->where('total', '>', 100)->get();
```

### Query Multiple Partitions

```php
// Query multiple partitions
Order::partitions(['orders_2024', 'orders_2025'])->get();
```

### Using MultipleSchemaModel

For multi-schema support:

```php
namespace App\Models;

use Brokenice\LaravelPgsqlPartition\Models\MultipleSchemaModel;

class Order extends MultipleSchemaModel
{
    protected $table = 'orders';
}

// Query with schema
$order = new Order();
$order->setSchema('sales');
$order->save();

// Or save directly
$order->saveOnSchema('sales');
```

## Artisan Commands

This package provides a set of artisan commands for partition management:

```shell
php artisan laravel-pgsql-partition {action} [options]
```

### Available Actions

| Action | Description |
|--------|-------------|
| `list` | List all partitions for a table |
| `create` | Create partitions on an existing partitioned table |
| `detach` | Detach a partition (keeps data) |
| `attach` | Attach a table as a partition |
| `drop` | Drop a partition (deletes data) |
| `truncate` | Truncate partition data |
| `vacuum` | Run VACUUM on partitions |
| `analyze` | Run ANALYZE on partitions |
| `reindex` | Run REINDEX on partitions |

### Examples

```shell
# List partitions
php artisan laravel-pgsql-partition list --table=orders

# Create partitions by year
php artisan laravel-pgsql-partition create --table=orders --column=order_date --method=YEAR

# Create hash partitions
php artisan laravel-pgsql-partition create --table=logs --method=HASH --number=8

# Detach a partition
php artisan laravel-pgsql-partition detach --table=orders --partitions=orders_2022

# Truncate partitions
php artisan laravel-pgsql-partition truncate --partitions=orders_2022,orders_2023

# Vacuum with FULL option
php artisan laravel-pgsql-partition vacuum --partitions=orders_2024 --full

# Analyze partitions
php artisan laravel-pgsql-partition analyze --partitions=orders_2024,orders_2025

# Reindex partitions
php artisan laravel-pgsql-partition reindex --partitions=orders_2024
```

### Options

| Option | Description |
|--------|-------------|
| `--schema` | PostgreSQL schema (default: public) |
| `--table` | Parent table name |
| `--method` | Partition method: RANGE, LIST, HASH, YEAR, MONTH, YEAR_MONTH |
| `--column` | Column to partition by |
| `--number` | Number of partitions (for HASH) |
| `--partitions` | Partition names (comma-separated) |
| `--excludeDefault` | Don't create a default partition |
| `--from` | Start value for RANGE partition |
| `--to` | End value for RANGE partition |
| `--full` | Use VACUUM FULL |

## PostgreSQL vs MySQL Partitioning

Key differences from the MySQL version of this package:

| Feature | MySQL | PostgreSQL |
|---------|-------|------------|
| Partition creation | ALTER TABLE on existing | At CREATE TABLE or separate CREATE TABLE ... PARTITION OF |
| Future values | MAXVALUE | DEFAULT partition |
| Subpartitions | Native support | Partition of partition |
| KEY partitioning | Supported | Use HASH instead |
| Maintenance | OPTIMIZE, REPAIR, REBUILD | VACUUM, ANALYZE, REINDEX |

## Important Notes

1. **PostgreSQL 10+ Required**: Native declarative partitioning requires PostgreSQL 10 or higher.

2. **Primary Keys**: In PostgreSQL, the partition key must be included in any primary key or unique constraint.

3. **Auto-increment**: Use `BIGSERIAL` for auto-increment columns, but include the partition key in the primary key:
   ```sql
   PRIMARY KEY (id, order_date)
   ```

4. **Indexes**: Each partition maintains its own indexes. Create indexes on the parent table and they'll be automatically created on partitions.

5. **Default Partition**: Always consider adding a default partition to catch rows that don't match any other partition.

## Tests

```shell
$ composer test
# or
$ composer test:unit
```

For integration tests (requires PostgreSQL):

```shell
$ composer test:integration
```

## Contributing

Recommendations and pull requests are most welcome! Pull requests with tests are the best!

## Credits & License

laravel-pgsql-partition is owned and maintained by [Luca Becchetti](http://www.lucabecchetti.com)

As open source creation any help is welcome!

The code of this library is licensed under MIT License; you can use it in commercial products without any limitation.

The only requirement is to add a line in your Credits/About section with the text below:

```
Partition by laravel-pgsql-partition - http://www.lucabecchetti.com
Created by Becchetti Luca and licensed under MIT License.
```
