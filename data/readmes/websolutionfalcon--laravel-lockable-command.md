# Laravel Lockable Command

[![Latest Version on Packagist](https://img.shields.io/packagist/v/websolutionfalcon/lockable-command.svg?style=flat-square)](https://packagist.org/packages/websolutionfalcon/lockable-command)
[![Total Downloads](https://img.shields.io/packagist/dt/websolutionfalcon/lockable-command.svg?style=flat-square)](https://packagist.org/packages/websolutionfalcon/lockable-command)

A simple Laravel package that allows you to lock and unlock command execution. Perfect for scenarios where you have commands running via cronjobs and need to temporarily disable them without deploying code changes. For example, if your server is overloaded by a scheduled command, you can simply lock it to prevent further executions until the issue is resolved.

## Installation

You can install the package via composer:

```bash
composer require websolutionfalcon/lockable-command
```

Optionally, you can publish the config file with:

```bash
php artisan vendor:publish --tag="lockable-command-config"
```

This will create a `config/lockable-command.php` file where you can customize the lock file path and extension.

## Usage

### 1. Creating a Lockable Command

To make your command lockable, extend the `LockableCommand` class instead of the default Laravel `Command` class:

```php
<?php

namespace App\Console\Commands;

use Websolutionfalcon\LockableCommand\Commands\LockableCommand;

class ProcessReports extends LockableCommand
{
    protected $signature = 'reports:process';
    protected $description = 'Process pending reports';

    public function handle()
    {
        $this->info('Processing reports...');
        // Your command logic here
    }
}
```

### 2. Locking and Unlocking Commands

Use the `command:locker` command to lock or unlock any lockable command:

**Lock a command:**
```bash
php artisan command:locker lock reports:process
```

**Unlock a command:**
```bash
php artisan command:locker unlock reports:process
```

When a command is locked, attempting to run it will display an error message and prevent execution:

```bash
php artisan reports:process
# Output: Command reports:process is locked and cannot be executed.
```

### 3. Configuration

The package uses a configuration file to customize behavior. Publish it to modify:

```php
return [
    // Directory where lock files are stored
    'lock_path' => env('LOCKABLE_COMMAND_LOCK_PATH', storage_path('app/tmp')),

    // File extension for lock files
    'lock_extension' => env('LOCKABLE_COMMAND_LOCK_EXTENSION', '.lock'),
];
```

You can also set these values in your `.env` file:

```env
LOCKABLE_COMMAND_LOCK_PATH=/var/lock/laravel-commands
LOCKABLE_COMMAND_LOCK_EXTENSION=.locked
```

## How It Works

When you lock a command, the package creates a lock file in the configured directory. Before executing, any `LockableCommand` checks for the existence of its lock file. If found, execution is prevented. Unlocking simply removes the lock file, allowing the command to run normally.

The lock files are named based on the command signature with colons replaced by underscores (e.g., `reports:process` becomes `reports_process.lock`).

## Use Cases

- **Overloaded Server**: Temporarily disable resource-intensive scheduled commands during high traffic
- **Maintenance**: Prevent specific commands from running during database migrations or system updates
- **Debugging**: Lock commands while investigating issues without modifying cron schedules
- **Gradual Rollout**: Control which commands run in different environments without code changes

## Testing

The package includes comprehensive tests. First, install dependencies:

```bash
composer install
```

Then run the tests:

```bash
composer test
```

Run tests with coverage:

```bash
composer test-coverage
```

Run code quality checks:

```bash
composer lint
```

## Requirements

- PHP 8.1 or higher
- Laravel 11.0 or higher

## API Reference

### LockableCommand

Your commands should extend this class to make them lockable.

**Methods:**

- `isLocked(): bool` - Check if the command is currently locked
- `isEnabled(): bool` - Check if the command can be executed (returns false if locked)
- `getLockPath(): string` - Get the lock file path for this command

### CommandLocker

The artisan command for locking/unlocking commands.

**Signature:**
```
command:locker {action} {target}
```

**Arguments:**
- `action` - Either "lock" or "unlock"
- `target` - The name of the command to lock/unlock

**Example:**
```bash
php artisan command:locker lock reports:process
php artisan command:locker unlock reports:process
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email websolution.falcon@gmail.com instead of using the issue tracker.

## Credits

- [Slava Mehovich](https://github.com/websolutionfalcon)
- [All Contributors](https://github.com/websolutionfalcon/lockable-command/contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
