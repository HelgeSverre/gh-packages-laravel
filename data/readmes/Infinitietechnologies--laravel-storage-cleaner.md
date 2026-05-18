# Laravel Storage Cleaner

A Laravel 10+ package for scheduled storage cleanup with file retention, optional path size caps, and database pruning policies.

Compatible with Laravel 10, 11, and 12 on PHP 8.1+.

This package is a safety net. It does not replace log rotation. For Laravel logs, use the daily log driver first:

```dotenv
LOG_CHANNEL=daily
LOG_DAYS=14
```

## Installation

```bash
composer require infinitietechnologies/laravel-storage-cleaner
```

Publish the config:

```bash
php artisan vendor:publish --tag=storage-cleaner-config
```

## Usage

Run cleanup manually:

```bash
php artisan storage:clean
```

You can also use the more explicit alias:

```bash
php artisan storage:clean-old
```

Preview deletes without changing anything:

```bash
php artisan storage:clean --dry-run
php artisan storage:clean --pretend
```

Limit to a driver:

```bash
php artisan storage:clean --driver=file
php artisan storage:clean --driver=disk
php artisan storage:clean --driver=database
```

Output JSON for monitoring:

```bash
php artisan storage:clean --json
```

Skip the interactive confirmation prompt:

```bash
php artisan storage:clean --force
```

## Scheduling

The package registers its own scheduler entry when enabled. You do not need to add `Schedule::command(...)` manually in `app/Console/Kernel.php` or `routes/console.php`.

```dotenv
STORAGE_CLEANER_ENABLED=true
STORAGE_CLEANER_SCHEDULE_ENABLED=true
STORAGE_CLEANER_FREQUENCY=daily
```

After the package is installed, Laravel's normal scheduler runner is enough:

```bash
php artisan schedule:run
```

The package schedules `storage:clean --force` internally, so scheduled runs will not wait for an interactive confirmation prompt.

For production, keep Laravel's scheduler running on the server:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

Supported frequencies:

- `daily`
- `weekly`
- `custom`, using `STORAGE_CLEANER_CRON`

## Safety Options

By default, interactive runs ask for confirmation before deleting anything. Scheduled runs and non-interactive runs do not block on prompts.

```dotenv
STORAGE_CLEANER_CONFIRM_BEFORE_DELETE=true
STORAGE_CLEANER_SAMPLE_LIMIT=10
```

Log deleted files for audit trails:

```dotenv
STORAGE_CLEANER_LOG_DELETED_FILES=true
STORAGE_CLEANER_LOG_CHANNEL=stack
```

The command reports counts and sample paths. Use `--dry-run --json` before enabling new policies in production.

## Configuration

Default file cleanup paths:

- `storage/logs`
- `storage/framework/cache`
- `storage/framework/sessions`

Set retention:

```dotenv
STORAGE_CLEANER_FILE_RETENTION_DAYS=15
```

Set a path size cap:

```dotenv
STORAGE_CLEANER_FILE_MAX_SIZE_MB=1024
```

When the cap is enabled, the oldest files in each configured path are deleted until the path is under the cap.

You can define named local targets with their own retention, recursion, and exclusion rules:

```php
'file' => [
    'enabled' => true,
    'paths' => [
        'temp-pdf-exports' => [
            'path' => storage_path('app/temp/pdf-exports'),
            'retention_days' => 3,
            'recursive' => true,
            'exclude' => ['important-*.pdf'],
        ],
        'old-upload-staging' => [
            'path' => storage_path('app/uploads/staging'),
            'retention_days' => 14,
            'recursive' => false,
        ],
    ],
],
```

String paths are still supported:

```php
'paths' => [
    storage_path('logs'),
],
```

## Laravel Disk Cleanup

Use the `disk` driver for paths managed through Laravel's filesystem disks:

```php
'disk' => [
    'enabled' => true,
    'disks' => [
        'local' => [
            'temp-images' => [
                'path' => 'temp/images',
                'retention_days' => 2,
                'recursive' => true,
                'exclude' => ['keep-*', '*.gitkeep'],
            ],
        ],
    ],
],
```

This also works with cloud disks supported by Flysystem, such as S3, but listing remote directories can be slow and may cost money because the disk must enumerate objects before deleting them. Keep cloud targets narrow, avoid cleaning whole buckets, and test with `--dry-run --driver=disk` first.

## Exclusion Rules

Exclusions support exact names and Laravel wildcard matching:

```php
'exclude' => [
    '.gitignore',
    '*.gitkeep',
    'important-file-*.pdf',
    'avatars/*',
],
```

Patterns are checked against both the filename and the relative path inside the cleanup target.

## Common Use Cases

Clean temporary PDF exports:

```php
'pdf-exports' => [
    'path' => storage_path('app/exports/pdf'),
    'retention_days' => 2,
],
```

Clean temporary image uploads but keep user avatars elsewhere:

```php
'image-temp' => [
    'path' => storage_path('app/uploads/temp'),
    'retention_days' => 1,
],
```

Clean only top-level old files in a staging directory:

```php
'staging-root' => [
    'path' => storage_path('app/staging'),
    'retention_days' => 7,
    'recursive' => false,
],
```

For files linked to database records, prefer deleting through your domain model first. For example, use Laravel model pruning, observers, or a custom command that deletes the model and its file together. This package is best for disposable files that are not the source of truth.

## Database Cleanup

Database cleanup is disabled by default. Enable it only after reviewing your configured tables:

```dotenv
STORAGE_CLEANER_DATABASE_ENABLED=true
```

Example config:

```php
'database' => [
    'enabled' => env('STORAGE_CLEANER_DATABASE_ENABLED', false),
    'tables' => [
        'failed_jobs' => 30,
        'sessions' => [
            'retention_days' => 7,
            'date_column' => 'last_activity',
            'date_type' => 'unix',
        ],
    ],
],
```

Simple numeric values use `created_at` as the date column. Array policies support `datetime` and `unix` date types.

## Recommended Production Setup

1. Use Laravel daily logs with `LOG_DAYS=7` or `LOG_DAYS=14`.
2. Keep `php artisan schedule:run` active every minute through cron or your process manager.
3. Run `php artisan storage:clean --dry-run` before enabling database cleanup.
4. Add server disk monitoring. Cleanup helps, but alerts prevent surprises.
5. Keep cleanup targets narrow. Avoid broad paths such as `storage/app` unless every child path is disposable.

## License

MIT
