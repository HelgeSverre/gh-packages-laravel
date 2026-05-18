# Laravel Log Compress

Automatically compress daily-rotated Laravel log files to tar.gz archives with optional AES-256 password encryption. Reduce storage costs and simplify log management.

## Features

- ✅ **Auto-discover daily channels** from logging configuration
- ✅ **Smart file detection** finds logs matching `{base}-YYYY-MM-DD.log` pattern
- ✅ **Optional encryption** AES-256-CBC via OpenSSL with PBKDF2 hashing
- ✅ **Configurable retention** skip logs newer than N days (default: 1)
- ✅ **Safe deletion** remove originals only after successful compression
- ✅ **Auto-scheduled** runs daily automatically, zero config needed
- ✅ **Manual & scheduled** Artisan command + custom scheduler support
- ✅ **Error resilience** continue processing on individual file errors, report all issues
- ✅ **Secure passwords** passed via environment variables, never exposed in process list

## Requirements

| Component | Version |
|---|---|
| PHP | 8.1+ |
| Laravel | 10.x, 11.x, 12.x, 13.x |
| System Tools | `tar`, `openssl` (for encryption) |

Typical Linux/macOS installations have both tools. Windows requires GNU tar/openssl.

## Installation

### Via Composer

```bash
composer require vocweb/laravel-log-compress
```

The package auto-registers via Laravel's package discovery.

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=log-compress-config
```

This creates `config/log-compress.php` in your Laravel project.

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# Optional: Set encryption password
LOG_COMPRESS_PASSWORD=your_secure_password_here

# Optional: Disable auto-schedule (default: true)
LOG_COMPRESS_AUTO_SCHEDULE=true

# Optional: Change schedule time (default: 00:00)
LOG_COMPRESS_SCHEDULE_TIME=00:00
```

### Configuration File

Edit `config/log-compress.php`:

```php
return [
    // Encryption password (overrides env if set)
    'password' => env('LOG_COMPRESS_PASSWORD', null),

    // Delete original log files after successful compression
    'delete_after_compress' => true,

    // Only compress logs older than N days (prevents active log compression)
    'older_than_days' => 1,

    // Automatically schedule daily compression (default: true)
    'auto_schedule' => env('LOG_COMPRESS_AUTO_SCHEDULE', true),

    // Time of day for auto-scheduled compression (24h format)
    'schedule_time' => env('LOG_COMPRESS_SCHEDULE_TIME', '00:00'),
];
```

## Usage

### Manual Compression

Compress all eligible daily log files:

```bash
php artisan log:compress
```

### With Password Override

Encrypt archives with a specific password (overrides config):

```bash
php artisan log:compress --password=my_secure_password
```

### Auto-Scheduled Execution

By default, the package **automatically registers** a daily scheduled task to compress logs. No manual setup required — just ensure your Laravel scheduler is running:

```bash
# Add to crontab (if not already configured)
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

#### Configure Auto-Schedule

Via `.env`:

```env
# Disable auto-schedule (default: true)
LOG_COMPRESS_AUTO_SCHEDULE=false

# Change schedule time (default: 00:00)
LOG_COMPRESS_SCHEDULE_TIME=02:00
```

#### Manual Schedule (if auto-schedule is disabled)

If you set `LOG_COMPRESS_AUTO_SCHEDULE=false`, register the schedule manually:

**Laravel 10** — `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('log:compress')->dailyAt('02:00');
}
```

**Laravel 11** — `routes/console.php`:

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('log:compress')->dailyAt('02:00');
```

**Laravel 12 / 13** — `bootstrap/app.php`:

```php
use Illuminate\Console\Scheduling\Schedule;

->withSchedule(function (Schedule $schedule) {
    $schedule->command('log:compress')->dailyAt('02:00');
})
```

## How It Works

### Discovery
1. Scans all channels in `config/logging.php`
2. Identifies channels with `driver: daily`

### Selection
3. For each daily channel, finds log files:
   - Pattern: `{base_path}-YYYY-MM-DD.log`
   - Age: older than `older_than_days` setting
   - Status: not already compressed

### Compression
4. Creates tar.gz archive using system `tar` command
5. If password configured: encrypts with OpenSSL AES-256-CBC
6. Cleans up partial files on failure

### Cleanup
7. Deletes original log file (if `delete_after_compress: true`)
8. Reports count of compressed files and any errors

## Decrypting Encrypted Archives

If you encrypted logs with a password, decrypt them:

```bash
# Decrypt to stdout
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:your_password -in laravel-2024-01-15.log.tar.gz | tar xz

# Or extract directly to a directory
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:your_password -in laravel-2024-01-15.log.tar.gz | tar xz -C /path/to/extract

# Save decrypted archive (unencrypted tar.gz)
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:your_password -in laravel-2024-01-15.log.tar.gz -out laravel-2024-01-15.log.tar.gz.decrypted
tar xzf laravel-2024-01-15.log.tar.gz.decrypted
```

## Example Workflow

### Setup
```bash
# 1. Install package
composer require vocweb/laravel-log-compress

# 2. Set encryption password in .env
echo "LOG_COMPRESS_PASSWORD=MySecurePass123" >> .env

# 3. Publish config (optional)
php artisan vendor:publish --tag=log-compress-config

# 4. Auto-schedule is enabled by default (runs daily at 00:00)
# To customize: set LOG_COMPRESS_SCHEDULE_TIME=02:00 in .env
```

### Daily Operation
```
2024-01-14 23:59:59 - Laravel writes to storage/logs/laravel-2024-01-14.log
2024-01-15 00:00:00 - New day, Laravel creates laravel-2024-01-15.log
2024-01-15 02:00:00 - Scheduled: php artisan log:compress
  ✓ Finds laravel-2024-01-14.log (older than 1 day)
  ✓ Creates laravel-2024-01-14.log.tar.gz (encrypted)
  ✓ Deletes laravel-2024-01-14.log
  → storage/logs/laravel-2024-01-14.log.tar.gz (encrypted, ~1% of original size)
```

### Retrieve Old Logs
```bash
# List encrypted archive contents
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:MySecurePass123 -in laravel-2024-01-14.log.tar.gz | tar tzf -

# Extract specific log
openssl enc -d -aes-256-cbc -pbkdf2 -pass pass:MySecurePass123 -in laravel-2024-01-14.log.tar.gz | tar xzOf - laravel-2024-01-14.log | grep "error"
```

## Logging Configuration

Ensure you have a `daily` channel in `config/logging.php`:

```php
'channels' => [
    'daily' => [
        'driver' => 'daily',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'debug'),
        'days' => 14,
    ],
    // other channels...
],
```

Multiple daily channels are supported and will all be compressed.

## Output & Status Codes

### Successful Compression
```
Scanning for daily log files to compress...
Compressed 5 log file(s).
```
Exit code: 0

### No Files Found
```
Scanning for daily log files to compress...
No log files found to compress.
```
Exit code: 0

### With Errors
```
Scanning for daily log files to compress...
Compressed 3 log file(s).
[error] Failed to compress /path/to/laravel-2024-01-10.log: Permission denied
[error] Failed to delete original /path/to/laravel-2024-01-09.log: ...
```
Exit code: 1

## Security Notes

- **Passwords**: Never stored in config; use `.env` file only
- **Process safety**: Passwords passed via environment variables, hidden from `ps aux`
- **Encryption**: AES-256-CBC with PBKDF2 (10,000 iterations), industry-standard
- **Path safety**: Real path resolution prevents directory traversal attacks
- **File handling**: Atomic operations; partial files cleaned up on failure

## Troubleshooting

### "tar: command not found"
- Install tar: `apt-get install tar` (Debian/Ubuntu) or `brew install gnu-tar` (macOS)

### "openssl: command not found" (with encryption enabled)
- Install openssl: `apt-get install openssl` or `brew install openssl`

### Permission denied errors
- Ensure Laravel process has read access to log files
- Ensure write access to log directory (for deletion)

### Encrypted archives not decrypting
- Verify password: check `.env` matches password used at compression time
- Use `-pass pass:your_password` in openssl command (or `-pass stdin` to prompt)

## License

MIT License - see LICENSE file for details.

## Credits

Created by vocweb. Inspired by the need to manage large production log archives efficiently.
