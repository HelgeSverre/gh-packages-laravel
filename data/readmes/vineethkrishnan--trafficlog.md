# TrafficLog

A Laravel package to log visitor information into database.

## Features

- Logs visitor IP address, browser information, and request data
- Built-in Facades support
- Auto-discovery for Laravel 5.5+

## Installation

```bash
composer require vineethkrishnan/trafficlog
```

## Configuration

Publish the config and migration files:

```bash
php artisan vendor:publish --provider="Vineethkrishnan\VisitLog\VisitLogServiceProvider"
php artisan migrate
```

## Usage

```php
use VisitLog;

// Log a visit
VisitLog::save();
```

## Credits

- [Vineeth Krishnan](https://github.com/vineethkrishnan)
- Original author: Sarfraz Ahmed

## License

MIT