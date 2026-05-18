# Database Sync for Laravel

<p align="center">
    <!-- <a href="https://github.com/kalel1500/laravel-db-sync/actions/workflows/tests.yml"><img src="https://github.com/kalel1500/laravel-db-sync/actions/workflows/tests.yml/badge.svg" alt="Build Status"></a> -->
    <a href="https://packagist.org/packages/kalel1500/laravel-db-sync" target="_blank"><img src="https://img.shields.io/packagist/dt/kalel1500/laravel-db-sync" alt="Total Downloads"></a>
    <a href="https://packagist.org/packages/kalel1500/laravel-db-sync" target="_blank"><img src="https://img.shields.io/packagist/v/kalel1500/laravel-db-sync" alt="Latest Stable Version"></a>
    <a href="https://packagist.org/packages/kalel1500/laravel-db-sync" target="_blank"><img src="https://img.shields.io/packagist/l/kalel1500/laravel-db-sync" alt="License"></a>
</p>

A Laravel package to **safely synchronize tables and data from external databases** into your application database.

This package is designed to **pull data from other machines or systems** (MySQL, PostgreSQL, Oracle, etc.) into a Laravel application in a controlled, traceable, and production-ready way, without forcing your final domain schema to match the source.

It focuses on **data ingestion**, not on how that data is later processed inside your application.

---

## What this package does (and when to use it)

This package is useful when you need to:

* Import data from legacy systems
* Synchronize data from external servers
* Periodically ingest data from other databases
* Create staging tables fed by external sources
* Centralize data from multiple origins

It **does not replace migrations or ORMs**.
It solves a very specific problem: **bringing external data into your Laravel database safely and observably**.

---

## Installation

Install the package via Composer:

```bash
composer require kalel1500/laravel-db-sync
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag=dbsync-migrations
php artisan migrate
```

---

## Example usage

### 1. Define an external connection

In `config/database.php`:

```php
'connections' => [
    'legacy_mysql' => [
        'driver'   => 'mysql',
        'host'     => '192.168.1.10',
        'database' => 'legacy_db',
        'username' => 'user',
        'password' => 'secret',
    ],
],
```

---

### 2. Fill package tables

#### `dbsync_connections`

| id | source_connection | target_connection |
|----|-------------------|-------------------|
| 1  | legacy_mysql      | mysql             |

---

#### `dbsync_tables`

| id | source_table | target_table | min_records | active | source_query | use_temporal_table | batch_size | copy_strategy | has_large_text_values_in_oracle | primary_key | unique_keys | indexes            | connection_id |
|----|--------------|--------------|-------------|--------|--------------|--------------------|------------|---------------|---------------------------------|-------------|-------------|--------------------|---------------|
| 1  | users        | users        | 300         | true   | null         | true               | 1000       | null          | false                           | null        | null        | null               | 1             |
| 2  | roles        | roles        | 100         | true   | null         | false              | 500        | null          | false                           | null        | null        | null               | 1             |
| 2  | types        | types        | 1           | true   | null         | false              | 500        | null          | false                           | null        | null        | [["name", "slug"]] | 1             |

> Note on Composite Keys: The `unique_keys` and `indexes` fields must follow an "array of arrays" format: [["col1"], ["col2", "col3"]].

---

#### `dbsync_columns`

Example columns for `users` table:

| id | method    | parameters      | modifiers                                                   |
|----|-----------|-----------------|-------------------------------------------------------------|
| 1  | id        | null            | null                                                        |
| 2  | string    | `["name"]`      | `["nullable"]`                                              |
| 3  | string    | `["email", 50]` | `["nullable", "unique"]`                                    |
| 4  | boolean   | `["is_active"]` | `[{"method": "default", "parameters": [true]}]`             |
| 5  | foreignId | `["type_id"]`   | `[{"method": "constrained", "parameters": ["user_types"]}]` |

> Note on modifiers: These can be arrays of strings or objects with the fields `method` and `params` if you need to pass parameters to the modifier. For example, passing the table name in the constrained modifier.

#### `dbsync_column_table`

Example `users` columns:

| id | table_id | column_id | order |
|----|----------|-----------|-------|
| 1  | 1        | 1         | 1     |
| 2  | 1        | 2         | 2     |
| 2  | 1        | 3         | 3     |
| 2  | 1        | 4         | 4     |

---

### 3. Run the sync

Run all tables:

```bash
php artisan dbsync:run
```

Run a specific connection:

```bash
php artisan dbsync:run --connection=1
```

Run a specific table:

```bash
php artisan dbsync:run --table=2
```

Priority order when filtering:

1. table
2. connection

---

## Synchronization strategies

Each table defines **how it should be synchronized**.

### Drop & Recreate

Drops the destination table and recreates it. Downtime occurs during the data insertion phase.

**Pros**

* Simple
* Fast

**Cons**

* Data is unavailable during the sync

Used when: `dbsync_tables.use_temporal_table = false`

---

### Temporal Table (recommended for large tables)

* Creates a temporary table
* Loads all data into the temporary table
* Drops the original table
* Renames the temporary table

> Oracle Compatibility: This package automatically generates short, unique names (max 12 chars) for all indexes and constraints (e.g., unq_a1b2c3d4). This prevents naming collisions and "Identifier too long" errors during the rename process in Oracle.

**Pros**

* Minimizes downtime
* Safer for large datasets

**Cons**

* It does not support self-referential fks

Used when: `dbsync_tables.use_temporal_table = true`

---

## Memory & Performance Optimization (copy Strategy)

The package uses **streaming and chunk-based data processing** instead of loading entire collections into memory. This allows synchronizing very large tables even in memory-constrained environments (e.g., Docker containers).

Depending on the table structure and configuration, the package automatically selects the most efficient strategy to read data from the source.

>⚠️ If, when populating the package's databases, you find large tables without primary keys or auto-incrementing values, you should consider filling the `dbsync_tables.copy_strategy` field to improve loading performance.

### Copy Execution Strategy

Data extraction is driven by a **strategy** system, which determines how rows are read from the source database.

The strategy is defined in the `dbsync_tables.copy_strategy` column as a JSON object:

| Key      | Type   | Description                                                                    |
|----------|--------|--------------------------------------------------------------------------------|
| `type`   | string | Execution strategy: `chunkById`, `chunk`, or `cursor`.                         |
| `column` | string | Column used for _ordering/chunking_ (only required for chunk-based strategies) |

### Available Strategies

#### 1. `chunkById` (Recommended)
  * Uses incremental queries: `WHERE column > last_value`
  * Requires a unique, non-null, indexed column
  * Best balance between:
    * performance
    * scalability
    * reliability
  * Example: `{ "type": "chunkById", "column": "id_user" }`

#### 2. `chunk`
  * Uses `LIMIT + OFFSET` pagination with `ORDER BY`
  * Works with any sortable column
  * Slower on large datasets due to offset cost
  * Example: `{ "type": "chunk", "column": "created_at" }`

#### 3. `cursor`
  * Streams rows one by one using a database cursor
  * Minimal memory usage
  * No ordering or chunking required
  * Example: `{ "type": "cursor"}`
    > ⚠️ This strategy keeps a long-lived database connection open during the entire process.
    > 
    > It is very fast but may be less reliable in environments with strict timeouts, firewalls, or heavy transactional load.

### Strategy Resolution (Default Behavior)

The `copy_strategy` field is fully optional and flexible. Both `type` and `column` can be omitted, partially defined, or fully specified.

Depending on what is provided, the package resolves the execution strategy using the following rules:

#### 1. Explicit Strategy

If `type` is explicitly set to `cursor`, it is always used:

```json
{ "type": "cursor" }
```

#### 2. Fully Defined Chunk Strategy

If both `type` and `column` are provided, the package uses them directly:

```json
{ "type": "chunkById", "column": "id_user" }
```

```json
{ "type": "chunk", "column": "created_at" }
```

> ⚠️ No validation is performed here — ensure the column is compatible with the selected strategy.

#### 3. Automatic Resolution

If the configuration is partial or not defined, the package applies automatic resolution.

> ##### 3.1 No configuration (`null`)
> 
> If `copy_strategy` is `null`, the system uses full auto-detection:
> 1. **Primary / Auto-increment / Unique key** → `chunkById`
> 2. **Fallback** → `cursor`
> 
> ##### 3.2 Only `type` is defined
> 
> ###### 3.2.1 `type = chunkById`
> 
> The package attempts to resolve the best column using:
> 1. Primary / auto-increment column
> 2. Unique non-null column
> 3. If none is found, it falls back to `cursor`
> 
> ###### 3.2.2 `type = chunk`
> 
> The package resolves a column using:
> 1. Timestamp columns (e.g., `created_at`)
> 2. First column of a composite primary key (if defined)
> 3. First column in the table definition
> 
> ##### 3.2 Only `column` is defined
> 
> The package evaluates the column and determines the best strategy:
> * If the column is `unique and non-null` → `chunkById`
> * Otherwise → `cursor`

##### Summary

| Configuration                        | Result                                           |
|--------------------------------------|--------------------------------------------------|
| `{ "type": "cursor" }`               | Always uses `cursor`                             |
| `{ "type": "...", "column": "..." }` | Fully manual                                     |
| `null`                               | Auto (`chunkById` → `cursor`)                    |
| `{ "type": "chunkById" }`            | Auto column for `chunkById` or fallback `cursor` |
| `{ "type": "chunk" }`                | Auto column for `chunk`                          |
| `{ "column": "..." }`                | Auto strategy based on column                    |


### Recommendation

* Use `chunkById` + **column** when possible (best performance and stability)
* Use `cursor` when:
  * no suitable column exists
  * working with complex queries
* Use partial configs only if you understand the fallback behavior

### When to Configure the Strategy Manually

In most cases, the automatic resolution works well. However, manual configuration is recommended in the following scenarios:
* The table has no primary key or suitable unique index → Use `cursor` or explicitly define a column
* You know a specific column that provides optimal performance → Define both `type` and `column` to avoid auto-detection
* You are working with complex queries or subqueries → Use `cursor` to avoid unreliable ordering or chunking issues
* You want to **control how data is processed** (performance vs reliability trade-offs)→ Override the default behavior with a specific strategy
* You experience **timeouts, long-running connections, or instability** → Switch between `cursor` and chunk-based strategies depending on your environment

---

## Column Sources & Virtual Columns (Advanced)

Each column can define **where its value comes from** using the `source` and `source_config` fields.

This allows you to mix:
- Data coming from the source database
- Values generated at runtime

### `source` column

Defines the origin of the column value:

| Value   | Description                                                                 |
|---------|-----------------------------------------------------------------------------|
| table   | Value is read from the source database (default behavior)                   |
| virtual | Value is generated during the sync process and not selected from the source |

### `source_config` column

Optional JSON field used when `source = virtual`.

Currently supported:

```json
{ "type": "uuid" }
````

```json
{ "type": "ulid" }
```

### Example

| method | parameters       | source  | source_config    |
|--------|------------------|---------|------------------|
| id     | null             | table   | null             |
| string | ["name"]         | table   | null             |
| uuid   | ["virtual_id"]   | virtual | null             |
| uuid   | ["virtual_uuid"] | virtual | {"type": "uuid"} |


### Behavior

* Columns with `source = table`:
  * Are included in the SELECT query
  * Must exist in the source table or query
* Columns with `source = virtual`:
  * Are NOT included in the SELECT query
  * Are generated during row processing
  * If `source_config` is null, the column will be ignored during insertion. This means that the database must have a default value, such as an auto-incrementing ID. 
  * If `source_config.type` is defined, the system will attempt to generate the value at runtime based on the specified type (e.g., `uuid` or `ulid`).

### Important Notes

* Virtual columns are generated **per row during sync**
* If a column is not selected and not generated, it will not be inserted
* Virtual values **do not overwrite existing values** if already present in the dataset (e.g. when using `source_query`)
* This mechanism allows defining **columns that exist only in the destination schema**

### When to use this

Use virtual columns when:
* You need to generate UUID/ULID identifiers or other columns with default values (like auto-increment IDs or timestamps) that do not exist in the source
* The source system does not provide a required column
* You want to enrich incoming data without modifying the source query

---

## Data Insertion Mode

By default, the package uses **bulk inserts** for maximum performance.
This is the fastest and recommended approach in virtually all cases.

However, when synchronizing to **Oracle**, you might encounter specific errors if very large text values are present in `text`, `mediumText`, or `longText` columns.

To handle those edge cases, you can enable row-by-row insertion for a specific table using the `has_large_text_values_in_oracle` field in `dbsync_tables`.

| Value           | Behavior                                                             |
|-----------------|----------------------------------------------------------------------|
| false (default) | Uses bulk inserts (fastest option).                                  |
| true            | Forces row-by-row insertion inside a transaction (safer but slower). |

> ⚠️ This option should only be enabled if you experience Oracle errors during data insertion.
>
> It is not recommended for normal usage because it reduces insertion performance.

---

## Important Constraints

### 1. Self-Referencing Foreign Keys

The `temporal_table` strategy is not available if a table has self-referential foreign keys. For example, if the `comments` table has the foreign key `comment_id`.
* You must set `self_referencing = true` in the `dbsync_columns` record.
* Otherwise, the system will attempt to check the table name based on the column data to detect if it is a self-referential foreign key.
* If it is detected as a self-referencing foreign key (either automatically or by the `self_referencing` field) and the use_temporal_table field is `true`, the synchronization will throw an error.

### 2. Forbidden Methods in Columns

In `dbsync_columns`, the method field must only contain data types (_string_, _integer_, etc.).
* Do not use `primary`, `unique`, `index`, or `foreign` as a `method`.
* Use modifiers for single-column constraints or the `dbsync_tables` fields for composite constraints.

### 3. Oracle Data Types and ORA-01790

When synchronizing to Oracle, you might encounter the following error during the data copy phase:

```SQL
ORA-01790: expression must have same datatype as corresponding expression
-- OR
ORA-01704: string literal too long
```

This happens when Laravel generates a bulk insert and Oracle internally interprets some values as `CLOB` while others are treated as `VARCHAR2`, typically when very large text values are involved.

If you are certain that:
* The schema is correct
* The affected columns are defined as `text`, `mediumText`, or `longText`
* The error occurs during the data copy phase

Then you can enable row-by-row insertion for that specific table:

```php
dbsync_tables.has_large_text_values_in_oracle = true
```

This forces each record to be inserted individually inside a transaction, ensuring proper bind variable handling and avoiding Oracle type mismatch issues.

> ⚠️ This setting should only be used when necessary, as it reduces insertion performance compared to bulk inserts.

---

## Package tables and their meaning

### `dbsync_connections`

Defines **source and target Laravel connections**.

| Field             | Description                         | Type       | Example  |
|-------------------|-------------------------------------|------------|----------|
| source_connection | Connection name for the origin      | `(string)` | _oracle_ |
| target_connection | Connection name for the destination | `(string)` | _mysql_  |
| active            | Enables or disables this connection | `(bool)`   | _true_   |

---

### `dbsync_tables`

Defines **what to sync and how**.

| Field                           | Description                                                                                    | Type     | Example                                      |
|---------------------------------|------------------------------------------------------------------------------------------------|----------|----------------------------------------------|
| source_table                    | Source table name                                                                              | (string) | _user_                                       |
| target_table                    | Destination table name                                                                         | (string) | _user_                                       |
| min_records                     | Minimum number of records required for the sync to be considered successful                    | (int)    | _1_                                          |
| active                          | Enables or disables synchronization for this table                                             | (bool)   | _true_                                       |
| source_query                    | Optional custom SELECT                                                                         | (string) | _select..._                                  |
| use_temporal_table              | Enables temporal strategy                                                                      | (bool)   | _true_                                       |
| batch_size                      | Insert chunk size                                                                              | (int)    | _500_                                        |
| copy_strategy                   | Optional JSON to force a specific copy strategy.                                               | (int)    | `{"type": "chunkById", "column": "id_user"}` |
| has_large_text_values_in_oracle | Forces row-by-row insertion instead of bulk (use only if needed, mainly for Oracle edge cases) | (bool)   | _false_                                      |
| primary_key                     | * Primary key definition                                                                       | (array)  | `["user_id", "rol_id"]`                      |
| unique_keys                     | * Unique constraints                                                                           | (array)  | `[["name", "type"]]`                         |
| indexes                         | * Index definitions                                                                            | (array)  | `[["name", "description"]]`                  |
| connection_id                   | Reference to the connection used by this table                                                 | (int)    | _1_                                          |


> The `primary_key`, `unique_keys`, and `indexes` fields are only required when using composite keys. Otherwise, they must be defined in the `modifiers` field of the `dbsync_columns` table.
> 
> #### IMPORTANT: The format of these fields (`unique_keys`, and `indexes`) is an "array of arrays". Otherwise, the execution will throw an error.

---

### `dbsync_columns`

Defines **table structure using Laravel schema semantics**.

| Field            | Description                                                                                                                             | Type     | Example                                                                                        |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------|----------|------------------------------------------------------------------------------------------------|
| method           | Blueprint method                                                                                                                        | (string) | _string_, _integer_, _decimal_, _foreignId_, _etc_.                                            |
| parameters       | Method parameters                                                                                                                       | (array)  | `["name", 100]` \|\| `["user_id"]`, _etc_.                                                     |
| modifiers        | Column modifiers                                                                                                                        | (array)  | `["nullable", "unique"]` \|\| `[{"method": "constrained", "parameters": ["user_id"]}]`, _etc_. |
| source           | Defines where the column value comes from (`table` or `virtual`)                                                                        | (string) | _table_ / _virtual_                                                                            |
| source_config    | Optional JSON configuration for virtual columns (e.g. `{ "type": "uuid" }`)                                                             | (json)   | _{"type":"uuid"}_                                                                              |
| self_referencing | Indicates whether the foreign key references the table itself. For example, `comment_id` in `comments`.                                 | (bool)   | _true_                                                                                         |
| case_transform   | Indicate whether copying the data will convert it to uppercase or lowercase.                                                            | (string) | _upper_ \| _lower_                                                                             |
| code             | This column does nothing during synchronization. It's only there to help populate the `dbsync_column_table` table with IDs more easily. | (string) | _user1_                                                                                        |

---

### `dbsync_column_table`

Defines the **relationship and ordering between tables and their columns**.

This pivot table determines **which columns belong to each synchronized table and in what order they are created**.

| Field     | Description                                               |
|-----------|-----------------------------------------------------------|
| table_id  | Reference to the synchronized table (`dbsync_tables`)     |
| column_id | Reference to the column definition (`dbsync_columns`)     |
| order     | Position of the column within the table schema definition |

---

## Logs and failure handling

### `dbsync_table_runs`

Every execution is logged. You can monitor:

* **Status:** `running`, `success`, or `failed`
* **Rows copied:** Precise count of processed records.
* **Times:** Start and finish timestamps
* **Error:** Full stack trace and error message in case of failure.

Key behaviors:

* Each table runs independently
* A failure does **not** stop other tables

This makes the process safe for long-running and large imports.

---

## Schema Utilities

This package provides a `DbsyncSchema` facade, allowing you to perform structural operations safely across different database engines by automatically handling foreign key constraints and driver-specific behaviors.

### Basic Usage

```php
use Thehouseofel\Dbsync\Facades\DbsyncSchema;

// Safely drop a table (handles CASCADE in Oracle/Postgres/SQL Server)
DbsyncSchema::forceDrop('users');

// Truncate one or multiple tables and reset auto-incrementing IDs/Sequences
DbsyncSchema::truncate(['users', 'profiles', 'posts']);
```

### Working with Connections

If you are working with multiple databases, you can switch the connection fluently:

```php
use Thehouseofel\Dbsync\Facades\DbsyncSchema;

DbsyncSchema::connection('oracle_external')->forceDrop('legacy_table');
```

### Important Note on Truncate & Foreign Keys

When truncating tables with active relationships, you must include all related tables in the same array.

The `truncate` method disables foreign key constraints before the process and re-enables them after all specified tables have been cleared. If you truncate a child table but leave data in the parent table (or vice-versa), the database will throw an error when re-enabling constraints due to referential integrity violations.
* Correct: `DbsyncSchema::truncate(['users', 'comments'])`; (Both sides of the FK are cleared).
* Incorrect: `DbsyncSchema::truncate(['comments'])`; (If users table still has data, re-enabling keys may fail).

### Supported Methods

| Method                                       | Description                                                                                                                                                             |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `forceDrop(string $table)`                   | Drops the table ignoring integrity constraints. It uses `CASCADE CONSTRAINTS` in _Oracle_, **CASCADE** in _PostgreSQL_, and manual foreign key cleanup in _SQL Server_. |
| `truncate(array $tables)`                    | Vacuums the specified tables and resets identity counters. It manages the disabling/enabling of constraints globally for the provided set of tables.                    |
| `connection(string\|Connection $connection)` | Sets the database connection for the subsequent operations.                                                                                                             |


## Driver Compatibility

The package is currently in **Beta**. While the logic is implemented for all major drivers, the level of testing varies:

| Driver              | Status   | Notes                                                          |
|:--------------------|:---------|:---------------------------------------------------------------|
| **MySQL / MariaDB** | ✅ Tested | Fully functional.                                              |
| **SQLite**          | ✅ Tested | Fully functional.                                              |
| **Oracle (12c+)**   | ✅ Tested | Verified using Identity Columns (standard since 12c).          |
| **PostgreSQL**      | ⚠️ Beta  | Logic implemented but pending full integration tests.          |
| **SQL Server**      | ⚠️ Beta  | Logic implemented but pending full integration tests.          |

> **Beta Disclaimer:** While the core logic is implemented for all drivers, please proceed with caution when using this package in production environments with `Postgres` or `SQL Server`, as they are still undergoing full verification. 
> We highly encourage testing in these environments! If you encounter any issues or wish to contribute, please open an issue or submit a PR.

---

## License

`laravel-db-sync` is an open-sourced software licensed under the **[MPL-2.0](https://opensource.org/licenses/MPL-2.0)**.
