# Laravel Timer

![Packagist](https://img.shields.io/packagist/v/shawnlindstrom/laravel-timer.svg)
![Packagist](https://img.shields.io/packagist/l/shawnlindstrom/laravel-timer.svg)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)
![PHP](https://img.shields.io/badge/PHP-8.3%2B-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-12.x-red.svg)

A modern, high-resolution monotonic timer for Laravel applications. Perfect for benchmarking, performance measurement, and precise timing operations.

## Features

- 🚀 High-resolution timing using `hrtime()`
- ⏱️ Multiple time units (seconds, milliseconds, microseconds, nanoseconds)
- 🎯 Type-safe with PHP 8.3+ enums
- 📊 Laravel service provider & facade support
- ✅ 90%+ test coverage
- 🔒 Strict types throughout

## Requirements

- PHP 8.3 or higher
- Laravel 12.x

## Installation

Install via Composer:

```bash
composer require shawnlindstrom/laravel-timer
```

The package will automatically register itself via Laravel's package discovery.

## Usage

### Basic Usage

```php
use shawnlindstrom\LaravelTimer\Timer;
use shawnlindstrom\LaravelTimer\TimeUnit;

$timer = new Timer;
$timer->start();

// Your code to benchmark
sleep(2);

$timer->stop();

echo $timer->elapsed(); // Returns: 2 (default is seconds)
```

### Different Time Units

```php
$timer = new Timer;
$timer->start();

// Your code here...

$timer->stop();

// Get elapsed time in different units
$seconds = $timer->elapsed(TimeUnit::SECOND);           // 2
$microseconds = $timer->elapsed(TimeUnit::MICROSECOND); // 2000
$milliseconds = $timer->elapsed(TimeUnit::MILLISECOND); // 2000000
$nanoseconds = $timer->elapsed(TimeUnit::NANOSECOND);   // 2000000000
```

### Using the Facade

```php
use shawnlindstrom\LaravelTimer\TimerFacade as Timer;
use shawnlindstrom\LaravelTimer\TimeUnit;

Timer::start();

// Your code to benchmark...

Timer::stop();

echo Timer::elapsed(TimeUnit::MICROSECOND);
```

### Alias Usage

If you prefer, you can use the pre-configured alias:

```php
use Timer;
use shawnlindstrom\LaravelTimer\TimeUnit;

Timer::start();
// Your code...
Timer::stop();

echo Timer::elapsed(TimeUnit::MILLISECOND);
```

### Reusable Measurements

The timer can be reused for multiple measurements:

```php
$timer = new Timer;

// First measurement
$timer->start();
performTask1();
$timer->stop();
$time1 = $timer->elapsed();

// Second measurement
$timer->start();
performTask2();
$timer->stop();
$time2 = $timer->elapsed();
```

## Testing

Run the test suite:

```bash
composer test
```

Generate code coverage report:

```bash
composer test:coverage
```

Run static analysis:

```bash
composer analyse
```

Format code:

```bash
composer format
```

## Change Log

Please see [CHANGELOG.md](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Security

If you discover any security related issues, please email shawn@tenerant.com instead of using the issue tracker.

## Credits

- [Shawn Lindstrom](https://github.com/shawnlindstrom)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.
