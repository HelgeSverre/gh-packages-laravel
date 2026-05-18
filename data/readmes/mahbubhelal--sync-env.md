# SyncEnv

A highly opinionated Laravel package to sync environment variables between different `.env` files and view differences between them. Ensures all your `.env` files are consistent, clean, and strictly follow best practices for key/value formatting.

## Features
- **Strict .env key rules:** Only allows keys that are upper snake case, starting with an uppercase letter and containing only uppercase letters, numbers, or underscores (minimum 2 characters).
- **No leading/trailing spaces:** No line in any `.env` file may have leading or trailing spaces. Values must not have leading or trailing spaces.
- **Identical structure:** The synced `.env` files will have the exact same structure, order, comments, and blank lines as `.env.example`, differing only in values where present.
- **Sync .env files:** Synchronize keys from `.env.example` to all other `.env*` files, preserving existing values and creating backups.
- **Show diffs:** View differences between `.env.example` and other `.env` files, including options to show all keys or include backup files.
- **Backup management:** Automatically create backups before syncing, and remove old backups with options.

## Key Format Rules
- Keys must be in **UPPER_SNAKE_CASE**.
- Keys must start with an uppercase letter (`A-Z`).
- Keys must be at least 2 characters long.
- Keys may only contain uppercase letters (`A-Z`), numbers (`0-9`), and underscores (`_`).
- No leading or trailing spaces are allowed in any line.
- Values must not have leading or trailing spaces.

### Examples
**Valid keys:**
```
APP_NAME
DB_CONNECTION
FOO_BAR_123
```
**Invalid keys:**
```
app_name        # not uppercase
A               # single character not allowed
_DB_CONNECTION  # cannot start with underscore
 APP_NAME       # leading space
APP-NAME        # dash not allowed
APP NAME        # space not allowed
APP@NAME        # special char not allowed
```
**Invalid values:**
```
APP_NAME= MyApp     # leading space in value
APP_NAME=MyApp      # trailing space in value
```

## Installation

```bash
composer require mahbubhelal/sync-env
```

## Usage

### 1. Sync .env files

Synchronize `.env.example` to all other `.env*` files:

```bash
php artisan sync-env:example-to-envs
```

#### Options:
- `--no-backup` (`-N`): Do not create a backup of the target `.env` file before syncing.
- `--remove-backups` (`-r`): Remove previously created backup files before syncing.
- `-v` (verbose): Show detailed warnings about comment differences, key position differences, and additional keys in target files.

### 2. Show differences between .env files

Display differences between `.env.example` and other `.env` files:

```bash
php artisan sync-env:show-diffs
```

#### Options:
- `--all` (`-a`): Show all keys, including identical ones.
- `--include-backup` (`-b`): Include backup files in the diff view.
- `--only=`: Only show specific env files (comma-separated, e.g., `--only=.env,.env.staging`).
- `--exclude=`: Exclude specific env files (comma-separated, e.g., `--exclude=.env.testing`).

Note: At least 2 env files are required. If `--only` or `--exclude` results in fewer than 2 files, `.env.example` is automatically included.

## Example Workflow
1. Update your `.env.example` file with new keys or changes, following the strict key/value rules above.
2. Run the sync command to propagate changes to all `.env` files:
   ```bash
   php artisan sync-env:example-to-envs
   ```
3. Use the show-diffs command to review differences:
   ```bash
   php artisan sync-env:show-diffs
   ```

## Testing

Run tests with Pest:

```bash
vendor/bin/pest
```

## License

MIT

---

**Author:** Md Mahbub Helal (<mdhelal00@gmail.com>)
