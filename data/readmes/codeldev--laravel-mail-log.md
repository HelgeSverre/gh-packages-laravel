# Laravel Mail Log

[![Latest Version on Packagist](https://img.shields.io/packagist/v/codeldev/laravel-mail-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-mail-log)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-mail-log/run-tests.yml?branch=master&label=tests&style=flat-square)](https://github.com/codeldev/laravel-mail-log/actions?query=workflow%3Arun-tests+branch%3Amaster)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/codeldev/laravel-mail-log/fix-php-code-style-issues.yml?branch=master&label=code%20style&style=flat-square)](https://github.com/codeldev/laravel-mail-log/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amaster)
[![Total Downloads](https://img.shields.io/packagist/dt/codeldev/laravel-mail-log.svg?style=flat-square)](https://packagist.org/packages/codeldev/laravel-mail-log)

A simple Laravel package that automatically logs every email sent by your application to the database. It listens to Laravel's built-in `MessageSending` event to record information without wrapping or modifying the mailer itself. Ships with configurable table names, a swappable Eloquent model, and a built-in prune command to manage retention.

---

## Requirements

- PHP 8.4+
- Laravel 13+

---

## Installation

You can install the package via composer:

```bash
composer require codeldev/laravel-mail-log
```

You can publish and run the migrations with:

```bash
php artisan vendor:publish --tag="mail-log-migrations"
php artisan migrate
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="mail-log-config"
```

This is the contents of the published config file:

```php
return [
    'prune_days' => (int) env('MAIL_LOG_PRUNE_DAYS', 365),
    'model' => CodelDev\LaravelMailLog\Models\LaravelMailLog::class,
    'table' => env('MAIL_LOG_TABLE', 'mail_log'),
];
```

### Environment Variables

The following env variables are available to configure the package using your env file.

```dotenv
MAIL_LOG_PRUNE_DAYS=365
MAIL_LOG_TABLE=mail_log
```

---

## Usage

Once installed, the package automatically logs every outgoing email. No additional setup is required.

### Pruning Old Records

Add to your `routes/console.php` file:

```php
Schedule::command('mail-log:prune')
    ->weeklyOn(1, '02:30')
    ->withoutOverlapping();
```

Run manually:

```bash
php artisan mail-log:prune
```

---

## Querying the Data

The package provides an Eloquent model you can use directly:

```php
use CodelDev\LaravelMailLog\Models\LaravelMailLog;

// Get all logged emails
$emails = LaravelMailLog::all();

// Get emails sent to a specific address (not available for SQLite)
$emails = LaravelMailLog::query()
    ->whereJsonContains('to', 'user@example.com')
    ->latest()
    ->get();

// Get emails sent today
$emails = LaravelMailLog::query()
    ->whereDate('created_at', today())
    ->get();

// Search by subject
$emails = LaravelMailLog::query()
    ->where('subject', 'like', '%Welcome%')
    ->latest()
    ->get();
```

---

### Available Fields

**LaravelMailLog**

| Field         | Type                           |
|---------------|--------------------------------|
| `id`          | `string` (UUID)                |
| `from`        | `string\|null`                 |
| `to`          | `array<int, string>\|null`     |
| `cc`          | `array<int, string>\|null`     |
| `bcc`         | `array<int, string>\|null`     |
| `subject`     | `string`                       |
| `body`        | `string`                       |
| `headers`     | `string\|null`                 |
| `attachments` | `array<int, string>\|null`     |
| `created_at`  | `CarbonImmutable`              |
| `updated_at`  | `CarbonImmutable`              |

---

## Using a Custom Model

You can extend the package model to add your own behaviour, scopes, or relationships. Create your custom model, extend the package model, then update the config:

```php
use CodelDev\LaravelMailLog\Models\LaravelMailLog as BaseMailLog;

class MailLog extends BaseMailLog
{
    public function scopeToRecipient($query, string $email)
    {
        return $query->whereJsonContains('to', $email);
    }
}
```

Then in `config/mail-log.php`:

```php
'model' => \App\Models\MailLog::class,
```

---

## Testing

```bash
composer test
```

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

---

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

---

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

---

## Credits

- [CodelDev](https://github.com/CodelDev)

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
