# Laravel Workday Manager

A Laravel package for managing workday modifications - holidays moved to workdays and vice versa.

## Features

- Track days when weekends/holidays become working days
- Track days when working days become holidays
- Simple API for checking workday status
- Laravel auto-discovery support
- Comprehensive test coverage

## Installation

Install the package via Composer:

```bash
composer require aa-engineering/laravel-workday-manager
```

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="workday-manager-migrations"
php artisan migrate
```

Optionally, publish the config file:

```bash
php artisan vendor:publish --tag="workday-manager-config"
```

## Usage

### Creating Moved Workdays

```php
use AAEngineering\WorkdayManager\Models\MovedWorkday;
use Carbon\Carbon;

// A Saturday that becomes a working day
MovedWorkday::create([
    'day' => '2025-12-14',
    'type' => 'workday',
]);

// A Monday that becomes a holiday
MovedWorkday::create([
    'day' => '2025-12-24',
    'type' => 'holiday',
]);
```

### Checking Workday Status

```php
use AAEngineering\WorkdayManager\WorkdayManager;
use Carbon\Carbon;

$date = Carbon::parse('2025-12-14');

// Check if a date has been changed to a holiday
if (WorkdayManager::isChangedToHoliday($date)) {
    // This working day is now a holiday
}

// Check if a date has been changed to a workday
if (WorkdayManager::isChangedToWorkday($date)) {
    // This weekend/holiday is now a working day
}

// Get the modification type (null, 'holiday', or 'workday')
$type = WorkdayManager::getModificationType($date);
```

### Using the Factory

```php
use AAEngineering\WorkdayManager\Models\MovedWorkday;

// Create a random moved workday
$movedWorkday = MovedWorkday::factory()->create();

// Create a weekend moved to workday
$workday = MovedWorkday::factory()->workday()->create();

// Create a workday moved to holiday
$holiday = MovedWorkday::factory()->holiday()->create();
```

## Configuration

The package configuration file `config/workday-manager.php` allows you to customize:

- `load_migrations`: Whether to automatically load package migrations (default: `true`)

## Testing

Run the package tests:

```bash
composer test
```

## Laravel Compatibility

- Laravel 11.x
- Laravel 12.x

## PHP Compatibility

- PHP 8.2
- PHP 8.3
- PHP 8.4

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
