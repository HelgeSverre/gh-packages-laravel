# Laravel Excel Importer

[![Latest Version](https://img.shields.io/packagist/v/sazzadbinashique/laravel-excel-importer.svg?style=flat-square)](https://packagist.org/packages/sazzadbinashique/laravel-excel-importer)
[![Total Downloads](https://img.shields.io/packagist/dt/sazzadbinashique/laravel-excel-importer.svg?style=flat-square)](https://packagist.org/packages/sazzadbinashique/laravel-excel-importer)
[![License](https://img.shields.io/packagist/l/sazzadbinashique/laravel-excel-importer.svg?style=flat-square)](https://packagist.org/packages/sazzadbinashique/laravel-excel-importer)

Import any Laravel model from Excel/CSV with preview, progress tracking, validation errors, and a built-in dashboard.

## Requirements

- PHP 8.2+
- Laravel 11+
- Livewire 3+
- maatwebsite/excel 3.1+

## Installation

```bash
composer require sazzadbinashique/laravel-excel-importer
```

Publish package assets:

```bash
php artisan vendor:publish --provider="SazzadBinAshique\LaravelExcelImporter\ExcelImporterServiceProvider"
```

Run migrations:

```bash
php artisan migrate
```

## Dashboard (Built-In)

The package registers a ready-to-use dashboard route (protected by `auth` by default):

- `/excel-importer` (name: `excel-importer.dashboard`)
- `/excel-importer/{type}` (name: `excel-importer.dashboard.type`)

Add a button anywhere in your app:

```blade
<a href="{{ route('excel-importer.dashboard') }}">Open Import Dashboard</a>
```

## Configure Import Types

Define your import types in the published config:

```php
// config/excel-importer.php
'import_types' => [
    'users' => \App\Imports\UsersImport::class,
    'products' => \App\Imports\ProductsImport::class,
],
```

## Create an Import Class

Extend the base import to get validation, batching, and progress updates:

```php
<?php

namespace App\Imports;

use App\Models\User;
use SazzadBinAshique\LaravelExcelImporter\Imports\BaseImport;
use SazzadBinAshique\LaravelExcelImporter\Models\Import;
use Illuminate\Support\Facades\Hash;

class UsersImport extends BaseImport
{
    public function __construct(Import $import)
    {
        parent::__construct($import);
    }

    public function model(array $row)
    {
        return new User([
            'name' => $row['name'],
            'email' => $row['email'],
            'password' => Hash::make($row['password'] ?? 'password'),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
        ];
    }
}
```

## Queue Setup

The import job runs on the queue. Set your queue connection and run a worker:

```env
QUEUE_CONNECTION=database
```

```bash
php artisan queue:work
```

## Cleanup Command

Old imports and error files can be cleaned up automatically:

```bash
php artisan excel-importer:cleanup --days=7
```

Schedule it (optional):

```php
// app/Console/Kernel.php
$schedule->command('excel-importer:cleanup')->dailyAt(config('excel-importer.cleanup_time'));
```

## Configuration

Key settings in `config/excel-importer.php`:

- `storage_disk` (default `local`)
- `import_path` and `error_path`
- `batch_size`, `chunk_size`, `preview_rows`
- `route_prefix` and `middleware`
- `recent_imports`

## Testing the Package

From the package root:

```bash
composer install
vendor/bin/phpunit
```

Manual test inside a Laravel app:

1. Publish config, migrations, and views.
2. Add at least one import type in `config/excel-importer.php`.
3. Run `php artisan migrate`.
4. Start the queue worker: `php artisan queue:work`.
5. Visit `route('excel-importer.dashboard')` and import a sample CSV.

## Troubleshooting

- If the dashboard route returns 404, ensure the package service provider is discovered.
- If progress never updates, ensure the queue worker is running.
- If files are missing, check the configured `storage_disk` and `import_path`.
    {
        return config('excel-importer.batch_size', 100);
    }

    public function chunkSize(): int
    {
        return config('excel-importer.chunk_size', 100);
    }

    public function registerEvents(): array
    {
        return [
            AfterBatch::class => function(AfterBatch $event) {
                $batchSize = $event->getConcernable()->batchSize();
                $currentFailures = $this->failures()->count();
                
                $this->processedRows += $batchSize;
                $this->successfulRows = $this->processedRows - $currentFailures;
                
                // Update import progress
                $this->import->update([
                    'processed_rows' => $this->processedRows,
                    'successful_rows' => $this->successfulRows,
                    'failed_rows' => $currentFailures,
                ]);
            },
        ];
    }
}
```

## Configuration

Edit `config/excel-importer.php`:

```php
return [
    // Storage disk for files
    'storage_disk' => 'local',
    
    // File retention period (days)
    'retention_days' => 1,
    
    // Daily cleanup time (24-hour format)
    'cleanup_time' => '12:00',
    
    // Batch and chunk sizes
    'batch_size' => 100,
    'chunk_size' => 100,
    
    // Max file upload size (KB)
    'max_file_size' => 10240, // 10MB
    
    // Progress update interval (seconds)
    'progress_interval' => 2,
    
    // Queue settings
    'queue_connection' => null,
    'queue_name' => 'default',
];
```

## Artisan Commands

### Clean Up Old Files

Manually clean up import and error files:

```bash
# Clean files older than 1 day (default)
php artisan imports:cleanup

# Clean files older than 7 days
php artisan imports:cleanup --days=7

# Clean files older than 30 days
php artisan imports:cleanup --days=30
```

This command removes:
- Import files from `storage/app/imports`
- Error files from `storage/app/errors`
- Associated database records

### Automatic Cleanup

The package automatically schedules cleanup daily at 12:00 PM (configurable). The scheduler runs:

```bash
php artisan imports:cleanup --days=1
```

**Change cleanup time in config:**

```php
'cleanup_time' => '02:00', // Run at 2:00 AM
```

**Or via environment variable:**

```env
EXCEL_IMPORTER_CLEANUP_TIME=02:00
```

## File Format

### Required Excel Format

| name          | email              | password   |
|---------------|-------------------|------------|
| John Doe      | john@example.com  | secret123  |
| Jane Smith    | jane@example.com  | pass1234   |

### Sample Files

The package includes sample file generators:

```bash
# Generate 10,000 row sample file
php generate-sample.php
```

This creates `public/sample-10k.csv` with unique, valid test data.

## Customization

### Customize Livewire Component

Publish and modify the Livewire component:

```bash
php artisan vendor:publish --tag=excel-importer-views
```

Edit: `resources/views/vendor/excel-importer/livewire/excel-importer.blade.php`

### Customize Validation Rules

Update your import class's `rules()` method:

```php
public function rules(): array
{
    return [
        'email' => ['required', 'email', 'unique:users,email'],
        'name' => ['required', 'string', 'max:255'],
        'phone' => ['nullable', 'regex:/^[0-9]{10}$/'],
        'age' => ['nullable', 'integer', 'min:18', 'max:100'],
    ];
}
```

### Customize Error Messages

Override `customValidationMessages()`:

```php
public function customValidationMessages()
{
    return [
        'email.unique' => 'This email is already registered.',
        'phone.regex' => 'Phone number must be 10 digits.',
        'age.min' => 'User must be at least 18 years old.',
    ];
}
```

### Change Batch Size

Adjust performance by changing batch and chunk sizes:

```php
public function batchSize(): int
{
    return 500; // Process 500 rows at a time
}

public function chunkSize(): int
{
    return 500; // Read 500 rows at a time
}
```

**Or in config:**

```env
EXCEL_IMPORTER_BATCH_SIZE=500
EXCEL_IMPORTER_CHUNK_SIZE=500
```

## How It Works

### 1. Upload & Preview
- User uploads Excel/CSV file (up to 10MB)
- System validates file format
- Shows preview of first 10 rows
- Displays total row count

### 2. Background Processing
- User clicks "Start Import"
- File stored in `storage/app/imports`
- Import job dispatched to queue
- Job processes file in batches

### 3. Real-time Progress
- Livewire polls every 2 seconds
- Statistics update after each batch:
  - Total rows
  - Processed rows
  - Successful rows
  - Failed rows
- Progress bar shows completion percentage

### 4. Error Handling
- Invalid rows are collected
- Validation errors tracked per row
- Error report generated as Excel file
- Stored in `storage/app/errors`
- User can download detailed error report

### 5. Automatic Cleanup
- Scheduler runs daily at configured time
- Deletes files older than retention period
- Removes associated database records
- Keeps storage clean automatically

## Troubleshooting

### Queue Not Processing

**Check queue is running:**
```bash
php artisan queue:work
```

**Check queue connection in .env:**
```env
QUEUE_CONNECTION=database
```

### File Upload Errors

**Increase PHP limits in php.ini:**
```ini
upload_max_filesize = 20M
post_max_size = 20M
max_execution_time = 300
```

**Check storage permissions:**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Progress Not Updating

**Clear config cache:**
```bash
php artisan config:clear
php artisan cache:clear
```

**Restart queue worker:**
```bash
php artisan queue:restart
php artisan queue:work
```

### Scheduler Not Running

**Verify crontab entry:**
```bash
crontab -l
```

**Test scheduler manually:**
```bash
php artisan schedule:run
```

**Check scheduled tasks:**
```bash
php artisan schedule:list
```

## Testing

Create test files to verify functionality:

**Valid data (sample-import.csv):**
```csv
name,email,password
John Doe,john@example.com,password123
Jane Smith,jane@example.com,secret456
```

**Invalid data (sample-with-errors.csv):**
```csv
name,email,password
,missing@name.com,pass
John,,short
Duplicate,john@example.com,test
```

## Performance Tips

1. **Increase batch size** for faster processing of large files
2. **Use queue workers** with multiple processes: `--queue=default --sleep=3 --tries=3`
3. **Index database columns** used in validation (especially unique checks)
4. **Disable timestamps** temporarily for bulk inserts
5. **Use chunk reading** to manage memory efficiently

## Security

- Files are stored in private storage directory
- File size limited by configuration
- File type validation (only xlsx, xls, csv)
- Queue jobs have timeout protection
- Automatic cleanup prevents storage abuse

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Credits

- Built with [Laravel](https://laravel.com)
- [Livewire](https://livewire.laravel.com) for reactive components
- [Maatwebsite/Laravel-Excel](https://laravel-excel.com) for Excel processing
- [Tailwind CSS](https://tailwindcss.com) for styling

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/yourvendor/laravel-excel-importer).
