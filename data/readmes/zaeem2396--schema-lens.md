<p align="center">
  <img src="assets/logo.png" alt="Schema Lens" width="400">
</p>

<p align="center">
  <strong>Preview Laravel migrations before execution with destructive change detection</strong>
</p>

<p align="center">
  <a href="https://packagist.org/packages/zaeem2396/schema-lens"><img src="https://img.shields.io/packagist/v/zaeem2396/schema-lens.svg" alt="Latest Version"></a>
  <a href="https://packagist.org/packages/zaeem2396/schema-lens"><img src="https://img.shields.io/packagist/dt/zaeem2396/schema-lens.svg" alt="Total Downloads"></a>
  <a href="https://github.com/zaeem2396/schema-lens/blob/main/LICENSE"><img src="https://img.shields.io/packagist/l/zaeem2396/schema-lens.svg" alt="License"></a>
</p>

---

A Laravel package that extends the default Artisan CLI with commands to preview a single migration file against the current database schema before execution. It provides comprehensive schema diff analysis, destructive change detection, automatic data export, and rollback simulation.

**Release highlights:** **v1.8.0** adds PostgreSQL schema introspection and paired `pgsql` support for `schema:diff`. **v1.7.0** adds optional full-database backup before safe migrations (`migrate:safe --backup`), `schema-lens.backup` configuration, and `schema:restore` for restore hints. **v1.6.0** adds `schema:diff` across two MySQL connections. Details: [CHANGELOG.md](CHANGELOG.md).

## Features

- 🔍 **Schema Diff Analysis**: Compare migration operations against the current database schema (MySQL/MariaDB or PostgreSQL when connected)
- ⚠️ **Destructive Change Detection**: Automatically flags dangerous operations
- 🔄 **Interactive Mode**: Step-by-step confirmation for destructive changes
- 📄 **Single Migration Support**: Run a specific migration file with full analysis
- 💾 **Automatic Data Export**: Exports affected data to CSV/JSON when destructive changes are detected
- 🔄 **Rollback Simulation**: Preview rollback impact and SQL statements
- 📊 **Line-by-Line Mapping**: Maps each database change back to exact lines in migration file
- 🎨 **Clean CLI Output**: Human-readable formatted output
- 📄 **SQL Preview**: Generate raw SQL statements from migrations
- ⚙️ **Configurable SQL engine**: Set table engine (InnoDB, MyISAM, etc.) for generated SQL via config
- 📊 **Migration Dependency Graph**: Visualize migration dependencies (foreign keys) as ASCII tree or JSON
- 🔀 **Schema diff between environments**: Compare two Laravel connections (`mysql`/`mariadb` or `pgsql` pairs; missing tables/columns, type mismatches)
- 📦 **Full database backup**: Optional `mysqldump` before `migrate:safe` (`--backup`, `--backup-path`, config auto backup and retention)
- 📄 **JSON Export**: Optional JSON report for CI/CD integration
- 🗜️ **Compression**: Automatic compression of exported data
- 📦 **Versioning**: Automatic versioning of exports with restore metadata

## Quick Start

```bash
composer require zaeem2396/schema-lens
php artisan schema:preview database/migrations/your_migration.php
# Compare two MySQL connections (optional): php artisan schema:diff mysql mysql_staging
# Optional full SQL backup before safe migrate (MySQL client tools required): php artisan migrate:safe --backup
```

📖 **For detailed usage instructions, testing scenarios, and examples, see [USAGE.md](USAGE.md)**

## Installation

```bash
composer require zaeem2396/schema-lens
```

The package supports:
- **PHP 8.1+**
- **Laravel 10.x through 13.x**

**Schema introspection** (`schema:preview`, `migrate:safe`, destructive detection, `schema:diff`) supports **MySQL / MariaDB** and **PostgreSQL** using each engine’s catalogs (`information_schema` and `pg_catalog` where needed). SQLite and other Laravel drivers cannot run introspection-only flows here; use `schema:preview migration.php --sql` to inspect generated SQL offline, or run tests against MySQL or PostgreSQL (see CI workflow).

**Error output:** When a command fails, only the error message is shown by default. Use `-v` / `--verbose` to see the full stack trace (e.g. for debugging).

## Configuration

Publish the configuration file (optional):

```bash
php artisan vendor:publish --tag=schema-lens-config
```

This will create `config/schema-lens.php` with the following options:

```php
return [
    'export' => [
        'row_limit' => env('SCHEMA_LENS_EXPORT_ROW_LIMIT', 1000),
        'storage_path' => 'app/schema-lens/exports',
        'compress' => env('SCHEMA_LENS_COMPRESS_EXPORTS', true),
    ],
    'output' => [
        'format' => env('SCHEMA_LENS_OUTPUT_FORMAT', 'cli'),
        'show_line_numbers' => env('SCHEMA_LENS_SHOW_LINE_NUMBERS', true),
    ],
    'sql' => [
        'engine' => env('SCHEMA_LENS_SQL_ENGINE'), // e.g. InnoDB, MyISAM; falls back to DB connection engine
    ],
    'backup' => [
        'auto' => env('SCHEMA_LENS_BACKUP_AUTO', false),
        'driver' => env('SCHEMA_LENS_BACKUP_DRIVER', 'mysqldump'),
        'directory' => env('SCHEMA_LENS_BACKUP_DIRECTORY', 'app/schema-lens/backups'),
        'retention_days' => (int) env('SCHEMA_LENS_BACKUP_RETENTION_DAYS', 7),
        'mysqldump_binary' => env('SCHEMA_LENS_MYSQLDUMP_PATH'),
    ],
];
```

The **SQL engine** (`schema-lens.sql.engine` or `SCHEMA_LENS_SQL_ENGINE`) is used in generated `CREATE TABLE` statements when using `schema:preview --sql`. If not set, the default database connection's engine is used (typically InnoDB).

The **`backup`** block configures optional logical backups before `migrate:safe` runs: `SCHEMA_LENS_BACKUP_AUTO` runs a dump automatically when destructive changes are detected (unless `--no-backup`), `SCHEMA_LENS_BACKUP_DRIVER` is `mysqldump` (default) or `spatie` (placeholder when `spatie/laravel-backup` is present), `SCHEMA_LENS_BACKUP_DIRECTORY` is relative to `storage_path()`, `SCHEMA_LENS_BACKUP_RETENTION_DAYS` prunes old `schema-lens-db-*.sql` files (0 disables pruning), and `SCHEMA_LENS_MYSQLDUMP_PATH` points to the `mysqldump` binary if it is not on `PATH`.

## Usage

### Basic Usage

Preview a migration file:

```bash
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php
```

Or use a relative path from the migrations directory:

```bash
php artisan schema:preview 2024_01_01_000000_create_users_table.php
```

### SQL Preview

Generate raw SQL statements that would be executed:

```bash
# Display SQL in terminal
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --sql

# Save SQL to file
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --sql --output=migration.sql

# Or use format option
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --format=sql
```

The table engine in generated SQL (e.g. `ENGINE=InnoDB`) is configurable via `config/schema-lens.php` → `sql.engine` or the `SCHEMA_LENS_SQL_ENGINE` env variable.

### Migration Dependency Graph

Visualize which migrations depend on others (e.g. foreign key relationships):

```bash
# Default: ASCII tree (uses database/migrations)
php artisan schema:graph

# Custom path
php artisan schema:graph --path=database/migrations

# JSON output
php artisan schema:graph --format=json
```

The graph is derived from `CREATE TABLE` and foreign key operations in each migration. Edges are deduplicated (at most one edge per migration pair). Circular dependencies are detected and reported.

**Exit codes:** If you pass `--path` and that directory is empty or contains no migration files, the command exits with code 1. With the default path, an empty directory yields a warning but exit code 0.

**Options:** `--path` — custom migrations directory; `--format=json` — machine-readable graph. See TESTING-SCENARIOS.md scenario 21 for manual verification steps.

**Example output (CLI):**

```
Migration Dependency Graph

├── 2024_01_01_000000_create_users_table
│   └── 2024_01_06_000000_create_posts_with_foreign_key
└── 2024_01_06_000000_create_posts_with_foreign_key
```

### Schema diff between environments

Compare live MySQL schemas from two Laravel database connections (for example local vs staging). Both connections must use the `mysql` driver and exist in `config/database.php`.

```bash
php artisan schema:diff mysql mysql_staging

# Named options (same as positional arguments)
php artisan schema:diff --from=mysql --to=mysql_staging

# Machine-readable output
php artisan schema:diff mysql mysql_staging --format=json

# Suggested migration-style hints for gaps (review before using)
php artisan schema:diff mysql mysql_staging --stubs
```

**Exit codes:** The command exits with code **1** when any structural difference is found (missing/extra tables or columns, type or nullable mismatches). Use `--exit-zero` if you only need output in scripts without a failing exit code. It exits **0** when schemas match or when `--exit-zero` is set.

**Example output (CLI):**

```
Schema differences: mysql → mysql_staging
(Reference = mysql; missing below means absent on mysql_staging)

MISSING TABLES ON mysql_staging:
  ✗ Table: user_preferences

TYPE MISMATCH:
  ⚠ posts.body: text (mysql) vs longtext (mysql_staging)
```

**Example output:**

```
╔══════════════════════════════════════════════════════════════╗
║               📄 GENERATED SQL STATEMENTS                    ║
╚══════════════════════════════════════════════════════════════╝

🟢 [1] table::create
CREATE TABLE `users` (...) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

🟢 [2] column::add
ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255);

─────────────────────────────────────────────────────────────────
📊 Summary:
   Total statements: 2
   Operations: 🟢 1 create, 🟢 1 add
```

When using `--output`, the SQL file includes:
- Header comments with migration name and timestamp
- `SET FOREIGN_KEY_CHECKS=0/1` wrappers
- Operation comments for each statement

### JSON Output

Generate a JSON report for CI/CD:

```bash
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --format=json
```

The JSON report will be saved to `storage/app/schema-lens/report.json` by default.

### Skip Data Export

If you want to preview without exporting data (even if destructive changes are detected):

```bash
php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --no-export
```

### Safe Migration (with auto-backup)

Run migrations with automatic destructive change detection and data backup:

```bash
php artisan migrate:safe
```

**Arguments:**
- `path` - (Optional) Path to a specific migration file to run

**Options:**
- `--force` - Force the operation to run in production
- `--seed` - Run seeders after migration
- `--step` - Run migrations one at a time
- `--pretend` - Dump the SQL queries that would be run
- `--no-backup` - Skip data backup for destructive changes (row exports and full `mysqldump` when applicable)
- `--interactive` - Confirm each destructive change individually
- `--backup` - Always create a full database SQL dump via `mysqldump` before migrations (skipped with `--pretend`)
- `--backup-path=` - Write the dump to this path (otherwise uses `schema-lens.backup.directory`)

This command:
1. Analyzes all pending migrations for destructive changes
2. Automatically backs up affected data before proceeding
3. Asks for confirmation if destructive changes are detected
4. Runs the actual migration

### Single Migration File

Run a specific migration file instead of all pending migrations:

```bash
# Using relative path
php artisan migrate:safe database/migrations/2024_01_15_drop_column.php

# Using absolute path
php artisan migrate:safe /var/www/app/database/migrations/2024_01_15_drop_column.php
```

This is useful when you:
- Want to analyze and run just one migration
- Need fine-grained control over which migration to execute
- Are testing a specific migration before deploying

You can combine it with other options:

```bash
# Single file with interactive mode
php artisan migrate:safe database/migrations/2024_01_15_drop_column.php --interactive

# Single file without backup
php artisan migrate:safe database/migrations/2024_01_15_drop_column.php --no-backup

# Single file with pretend mode (just show SQL)
php artisan migrate:safe database/migrations/2024_01_15_drop_column.php --pretend
```

The command validates that:
- The file exists
- It has a `.php` extension
- It hasn't already been executed

### Interactive Mode

For granular control over destructive migrations, use interactive mode:

```bash
php artisan migrate:safe --interactive
```

This prompts you to review each migration with destructive changes individually:

```
📋 Migration: 2024_01_15_drop_email_column.php
   Destructive changes:
   🔴 [CRITICAL] column::drop
      Tables: users
      Columns: users.email

   Approve '2024_01_15_drop_email_column.php'? [y/n/a/s/q] 
```

**Options during review:**

| Key | Action |
|-----|--------|
| `y` | Approve this migration |
| `n` | Skip this migration |
| `a` | Approve all remaining migrations |
| `s` | Skip all remaining migrations |
| `q` | Quit and cancel everything |

Only approved migrations will be executed, giving you full control over which destructive changes to apply.

### Full database backup (`mysqldump`)

In addition to per-table CSV/JSON exports for destructive operations, you can take a **full logical backup** of the default MySQL database before migrations run:

```bash
php artisan migrate:safe --backup
php artisan migrate:safe --backup --backup-path=/var/backups/app-pre-migrate.sql
```

With `SCHEMA_LENS_BACKUP_AUTO=true` (or `schema-lens.backup.auto`), a dump is created automatically when destructive changes are detected, unless you pass `--no-backup`. `--pretend` never writes a dump file.

Dumps default to `storage_path()` + `schema-lens.backup.directory`, with filenames like `schema-lens-db-YYYY-mm-dd_His.sql`. Old files matching `schema-lens-db-*.sql` in that directory are pruned according to `retention_days`.

### Restore hint (`schema:restore`)

Schema Lens does not execute restores for you. After generating a `.sql` file (from this package or any `mysqldump`), print the suggested `mysql` client invocation:

```bash
php artisan schema:restore /path/to/dump.sql
php artisan schema:restore storage/app/schema-lens/backups/schema-lens-db-2026-04-02_120000.sql --connection=mysql
```

## What It Detects

### Schema Changes

- **Tables**: Create, modify, drop
- **Columns**: Add, modify, drop, rename
- **Indexes**: Add, drop
- **Foreign Keys**: Add, drop
- **Engine**: Changes
- **Charset**: Changes
- **Collation**: Changes

### Destructive Operations

The following operations are flagged as destructive:

- `dropTable()` / `dropIfExists()`
- `dropColumn()` — single `dropColumn('col')` or multiple `dropColumn(['col1','col2'])`
- `dropIndex()`
- `dropForeign()`
- `renameColumn()`
- Constraint removals

## Data Export

When destructive changes are detected, Schema Lens automatically:

1. Exports affected table/column data to CSV and JSON
2. Compresses exports (if enabled)
3. Versions the export with metadata
4. Creates restore instructions

### Export Structure

```
storage/app/schema-lens/exports/
└── 2024_01_01_000000_create_users_table_2024-01-15_10-30-45_v0001/
    ├── users.json
    ├── users.csv
    ├── users.zip (if compression enabled)
    └── restore_metadata.json
```

### Restore Metadata

Each export includes a `restore_metadata.json` file with:

- Export version and timestamp
- Migration file reference
- Affected tables and columns
- Restore instructions
- File paths for all exported data

## Output Examples

### CLI Output

```
╔══════════════════════════════════════════════════════════════╗
║          Schema Lens - Migration Preview Report            ║
╚══════════════════════════════════════════════════════════════╝

📊 SUMMARY
────────────────────────────────────────────────────────────
Tables:        1
Columns:       5
Indexes:       2
Foreign Keys:  1
Engine:        0
Charset:       0
Collation:     0

⚠️  DESTRUCTIVE CHANGES: 1

⚠️  DESTRUCTIVE CHANGES DETECTED
════════════════════════════════════════════════════════════

  Risk Level: HIGH
  Operation:  column:drop
  Line:       45
  Tables:     users
  Columns:    users.email

📋 DETAILED CHANGES
────────────────────────────────────────────────────────────

📦 TABLES:
  ➕ [Line 12] Will create new table 'users'

📝 COLUMNS:
  ➕ [Line 15] Will add new column 'users.id'
  ➕ [Line 16] Will add new column 'users.name'
  🔴 [Line 45] Will DROP column 'users.email' (DESTRUCTIVE)

🔄 ROLLBACK SIMULATION
────────────────────────────────────────────────────────────
  Risk Level: HIGH
  Columns Affected: users.email
```

### JSON Output

```json
{
    "timestamp": "2024-01-15T10:30:45+00:00",
    "summary": {
        "tables": 1,
        "columns": 5,
        "indexes": 2,
        "foreign_keys": 1,
        "destructive_changes_count": 1,
        "has_destructive_changes": true
    },
    "diff": {
        "tables": [...],
        "columns": [...],
        "indexes": [...],
        "foreign_keys": [...]
    },
    "destructive_changes": [...],
    "rollback": {...},
    "exports": [...]
}
```

## Rollback Simulation

Schema Lens analyzes the `down()` method of migrations to:

- Show rollback SQL statements
- Identify dependency break risks
- Warn about foreign key constraints
- Highlight affected tables and columns

## Requirements

- PHP 8.1+
- Laravel 10.x–13.x (Laravel 13 requires PHP 8.3+)
- **MySQL 5.7+ or MariaDB 10.2+**, or **PostgreSQL 13+**, for commands that introspect the live schema
- Catalog access (`information_schema` / `pg_catalog` as implemented)

## Environment Variables

You can configure Schema Lens using environment variables:

```env
SCHEMA_LENS_EXPORT_ROW_LIMIT=1000
SCHEMA_LENS_COMPRESS_EXPORTS=true
SCHEMA_LENS_OUTPUT_FORMAT=cli
SCHEMA_LENS_SHOW_LINE_NUMBERS=true
SCHEMA_LENS_BACKUP_AUTO=false
SCHEMA_LENS_BACKUP_DRIVER=mysqldump
SCHEMA_LENS_BACKUP_DIRECTORY=app/schema-lens/backups
SCHEMA_LENS_BACKUP_RETENTION_DAYS=7
SCHEMA_LENS_MYSQLDUMP_PATH=
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Preview Migration
  run: |
    php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --format=json
    cat storage/app/schema-lens/report.json | jq '.destructive_changes'
```

### GitLab CI Example

```yaml
migration-preview:
  script:
    - php artisan schema:preview database/migrations/2024_01_01_000000_create_users_table.php --format=json
    - |
      if [ $(cat storage/app/schema-lens/report.json | jq '.summary.has_destructive_changes') = "true" ]; then
        echo "⚠️ Destructive changes detected!"
        exit 1
      fi
```

## Troubleshooting

- **“Schema Lens schema introspection requires MySQL, MariaDB, or PostgreSQL”** — Point the default Laravel DB connection (or `--connection` flows) at MySQL/MariaDB/PostgreSQL, or use `--sql`-only preview on unsupported drivers locally.
- **Debugging command failures** — Use `-v` or `--verbose` to see the full stack trace.
- **Custom table engine in generated SQL** — Set `SCHEMA_LENS_SQL_ENGINE` or `config/schema-lens.sql.engine` (e.g. `MyISAM`) to override the engine in `CREATE TABLE` output.
- **`schema:diff`** — Both connections must be **mysql/mariadb** or both **pgsql** (same driver family). Define them in `config/database.php`. For PostgreSQL, set `'schema'` (e.g. `public`) on each connection when not using defaults.
- **`schema:diff` exits 1 on drift** — Use `--exit-zero` in CI if you only want logs without failing the job.
- **`mysqldump` not found** — Install MySQL client tools on the host or set `SCHEMA_LENS_MYSQLDUMP_PATH` to the full path of the `mysqldump` binary.

## Limitations

- `schema:diff` compares **structure** only (tables/columns/types), not row data or triggers
- **SQL preview (`--sql`)** and **table `ENGINE=` hints** remain MySQL-oriented; PostgreSQL is supported for **live introspection**, `schema:diff`, and safer rollback hints when connected to Postgres
- `migrate:safe --backup` / `mysqldump` applies to MySQL-compatible connections only (not PostgreSQL dumps in this release)
- Requires direct database connection (no cloud proxies that hide catalog access)
- Migration parser supports standard Laravel migration syntax

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Author

**zaeem2396**

GitHub: [@zaeem2396](https://github.com/zaeem2396)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

