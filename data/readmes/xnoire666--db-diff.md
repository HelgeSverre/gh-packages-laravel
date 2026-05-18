# xnoire666/db-diff

[![Latest Version on Packagist](https://img.shields.io/packagist/v/xnoire666/db-diff.svg?style=flat-square)](https://packagist.org/packages/xnoire666/db-diff)
[![Tests](https://img.shields.io/github/actions/workflow/status/xnoire666/db-diff/tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/xnoire666/db-diff/actions/workflows/tests.yml)
[![Total Downloads](https://img.shields.io/packagist/dt/xnoire666/db-diff.svg?style=flat-square)](https://packagist.org/packages/xnoire666/db-diff)
[![License](https://img.shields.io/packagist/l/xnoire666/db-diff.svg?style=flat-square&cacheSeconds=300)](https://packagist.org/packages/xnoire666/db-diff)

Laravel artisan command that diffs two MySQL databases and generates SQL files describing what the second one is missing — perfect for syncing a staging schema against production.

## Install

```bash
composer require xnoire666/db-diff
```

Laravel auto-discovers the service provider — no manual registration needed.

## Configure

Publish the config file:

```bash
php artisan vendor:publish --tag=db-diff-config
```

This creates `config/db-diff.php`. Then set the connection details in your application's `.env`:

```env
DB_DIFF_MYSQL1_HOST=
DB_DIFF_MYSQL1_DATABASE=
DB_DIFF_MYSQL1_USERNAME=
DB_DIFF_MYSQL1_PASSWORD=

DB_DIFF_MYSQL2_HOST=
DB_DIFF_MYSQL2_DATABASE=
DB_DIFF_MYSQL2_USERNAME=
DB_DIFF_MYSQL2_PASSWORD=
```

- **mysql1** = the *source* (source of truth)
- **mysql2** = the *target* being compared against the source

Optional keys: `DB_DIFF_MYSQL{1,2}_CHARSET`, `DB_DIFF_MYSQL{1,2}_COLLATION`, and `DB_DIFF_OUTPUT_DISK` (defaults to `local`).

## Run

```bash
php artisan db:diff
```

Generates the following SQL files in `storage/app/` (or whichever disk you configured):

| File | What it contains |
|---|---|
| `missing_tables.sql` | `CREATE TABLE IF NOT EXISTS` for tables that exist in mysql1 but not mysql2 |
| `missing_views.sql` | `CREATE OR REPLACE VIEW` for views missing in mysql2 |
| `missing_columns.sql` | `ALTER TABLE ... ADD COLUMN` for columns missing in mysql2 |
| `mismatch_column_props.sql` | `ALTER TABLE ... MODIFY COLUMN` for columns whose type, nullability, default, or extra differs |

Review the generated SQL before running it against mysql2.

## Requirements

- PHP ^8.0
- Laravel 9, 10, 11, or 12
- Both connections must be MySQL (the command uses `SHOW TABLES` / `SHOW CREATE TABLE`)

## License

MIT
