# Laravel DB Export

A Laravel package for database exports with profile-based exclusions, anonymization, and zero-impact exports.

## Features

- **Profile-based exports** - Predefined configurations for different use cases
- **Zero-impact exports** - Uses `--single-transaction` and `--quick` for minimal database load
- **Compression** - Automatic gzip compression with streaming for large databases
- **Size estimation** - Pre-flight disk space validation
- **Structure-only tables** - Export schema without data for large tables
- **Anonymization** - Mask or fake sensitive data (PII)
- **Cleanup** - Automatically remove old exports

## Installation

```bash
composer require xve/laravel-db-export
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=db-export-config
```

## Configuration

### MySQL/MariaDB Binary Path

If `mysqldump` is not in your PATH, set it in `config/db-export.php` or `.env`:

```php
'mysql_options' => [
    'dump_binary_path' => env('DB_EXPORT_DUMP_BINARY_PATH'),
    // ...
],
```

```env
DB_EXPORT_DUMP_BINARY_PATH=/usr/local/mysql/bin
# or for Herd/MariaDB:
DB_EXPORT_DUMP_BINARY_PATH=/Users/Shared/Herd/services/mariadb/10.11.6/bin
```

### MariaDB Compatibility

For MariaDB, ensure MySQL-specific options are disabled:

```php
'mysql_options' => [
    'set_gtid_purged' => null,      // MySQL-only
    'column_statistics' => null,     // MySQL 8+ only
],
```

### Cleanup Old Exports

Automatically delete old exports before creating new ones:

```php
'cleanup' => [
    'enabled' => true,
    'keep_recent' => 0,  // 0 = delete all, or set number to keep
],
```

## Commands

### Setup / Find mysqldump

Find the mysqldump binary and get configuration instructions:

```bash
php artisan db:export:setup
```

This command searches common locations for `mysqldump` and displays:
- Found binary paths with versions
- Configuration instructions for `.env` or `config/db-export.php`
- Current configuration status

### List Profiles

```bash
php artisan db:export:list-profiles
php artisan db:export:list-profiles --detailed
```

### Estimate Export Size

```bash
php artisan db:export:estimate
php artisan db:export:estimate --detailed
```

### Export Database

```bash
# Export with default profile
php artisan db:export

# Skip confirmation prompt
php artisan db:export --force

# Dry run (show what would be exported)
php artisan db:export --dry-run

# Export only telescope/audits for debugging
php artisan db:export --profile=inspection
```

### Prune Exports

Delete all export files:

```bash
php artisan db:export:prune
```

## Export Profiles

| Profile | Description |
|---------|-------------|
| `default` | Clean export with structure-only for logs/cache/sessions and anonymized PII |
| `inspection` | Only telescope and audits (for debugging) |

## Command Options

### Table Selection

```bash
# Exclude specific tables
--exclude=large_table --exclude=another_table

# Only include specific tables
--include-only=users --include-only=orders

# Export structure only (no data)
--structure-only=audits --structure-only=logs

# Override structure-only (include data)
--include-data=audits
```

### Output Options

```bash
# Custom output path
--path=/backups/db

# Custom filename
--filename=backup_2024.sql.gz

# Disable compression
--no-compress

# Use different database connection
--connection=mysql_replica
```

### Other Options

```bash
# Exclude views
--no-views

# Disable foreign key wrapper
--no-fk-wrapper

# Dry run
--dry-run

# Skip confirmation
--force
```

## Examples

### Standard Export

```bash
php artisan db:export --force
```

Exports everything with structure-only for logs/cache/sessions and anonymized PII.

### Include Audit Data

```bash
php artisan db:export --include-data=audits --force
```

Override structure-only to include audit data.

### Debug Export

```bash
php artisan db:export --profile=inspection --force
```

Exports only telescope and audit tables for debugging.

### Specific Tables

Export only the tables you need — no profile required:

```bash
# Single table
php artisan db:export --include-only=users --force

# Multiple tables
php artisan db:export --include-only=bunkering --include-only=klant --include-only=facturen --force
```

### Structure Only (No Data)

```bash
php artisan db:export --structure-only="*" --force
```

## Profiles Configuration

Define custom profiles in `config/db-export.php`:

```php
'profiles' => [
    'my-profile' => [
        'description' => 'My custom export profile',
        'exclude' => [
            'telescope_*',
            '*_logs',
        ],
        'structure_only' => [
            'audits',
            'activity_log',
        ],
        'include_only' => null,  // null = all tables
        'anonymize' => [
            'users' => [
                'email' => ['strategy' => 'faker', 'method' => 'safeEmail'],
                'password' => ['strategy' => 'hash', 'value' => 'password'],
            ],
        ],
    ],
],
```

## Anonymization Strategies

Anonymization works with or without `fakerphp/faker`. If faker is installed, you get realistic fake data. Without it, simple fallbacks are used (e.g., `User_a1b2c3d4`, `user_a1b2c3d4@example.com`).

```bash
# Optional: Install faker for realistic fake data
composer require fakerphp/faker
```

```php
'anonymize' => [
    'users' => [
        // Faker - generate fake data (or fallback if faker not installed)
        'name' => ['strategy' => 'faker', 'method' => 'name'],
        'email' => ['strategy' => 'faker', 'method' => 'safeEmail'],
        'phone' => ['strategy' => 'faker', 'method' => 'phoneNumber'],

        // Hash - bcrypt hash a value
        'password' => ['strategy' => 'hash', 'value' => 'password'],

        // Mask - partially hide value
        'credit_card' => ['strategy' => 'mask', 'keep_last' => 4],

        // Null - set to null
        'remember_token' => ['strategy' => 'null'],

        // Fixed - set to specific value
        'status' => ['strategy' => 'fixed', 'value' => 'active'],
    ],
],
```

### Preserve Admin/Developer Accounts

Skip anonymization for rows where specific columns match certain email domains:

```php
// config/db-export.php
'preserve_rows' => [
    'users' => [
        'column' => 'email',
        'domains' => ['xve.be', 'company.com'],
    ],
    'customers' => [
        'column' => 'contact_email',
        'domains' => ['xve.be'],
    ],
],
```

Users with `@xve.be` or `@company.com` emails will keep their original data while all other users are anonymized. Each table can specify which column to check.

## Production Usage

### Zero-Impact Exports

**The Problem:** Traditional `mysqldump` commands can severely impact production databases:
- Table locks block all writes during export
- Large result sets consume server memory
- Long-running exports cause timeouts and slow queries

**The Solution:** This package uses mysqldump options that eliminate these issues:

| Option | Problem Solved |
|--------|----------------|
| `--single-transaction` | Creates a consistent snapshot using InnoDB's MVCC. No table locks, writes continue normally. |
| `--quick` | Streams rows directly to output instead of buffering in memory. Handles multi-GB tables without memory issues. |
| `--skip-lock-tables` | Prevents `LOCK TABLES` command that would block all writes. |

With these options, you can safely export a production database while the application continues serving requests with no degradation.

### Best Practices

1. **Use a read replica** for exports when possible:
   ```bash
   php artisan db:export --connection=replica
   ```

2. **Schedule during low-traffic hours**

3. **Use structure-only** for large tables like audits:
   ```php
   'structure_only' => ['audits', 'activity_log'],
   ```

4. **Monitor during export**:
   ```bash
   watch -n1 "mysql -e \"SHOW GLOBAL STATUS LIKE 'Threads_running';\""
   ```

## Output Location

Default: `storage/app/db-exports/`

Files are named: `{database}_{date}_{time}_{profile}.sql.gz`

Example: `my_app_2026-01-15_14h30_default.sql.gz`

## See Also

- [Package Comparison](docs/comparison.md) - SWOT analysis vs other Laravel backup packages

## License

MIT
