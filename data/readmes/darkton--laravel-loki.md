# Laravel Loki

> ⚠️ Beta release  
> The API is considered stable for testing and production use, but may change before the first stable release (v1.0.0).

A Laravel logging package that ships logs to Grafana Loki via OTLP, built on top of Monolog.

It uses Redis buffering and queued jobs to ensure safe, asynchronous delivery without impacting application performance or creating logging feedback loops.

## Installation

You can install the package directly via Packagist using Composer:

```bash
composer require darkton/laravel-loki
```

After installation, you can optionally publish the configuration file (useful for customizing Grafana access, batch limits, and queues to be used):

```bash
php artisan vendor:publish --tag="loki-config"
```

## Basic Configuration (.env)

In your `.env` file, you will need to set up the following Grafana Loki credentials to be able to send logs:

```env
LOKI_OTLP_ENDPOINT="https://logs-prod-...grafana.net/otlp/v1/logs"
LOKI_USERNAME="your_stack_id"
LOKI_API_KEY="your_access_token"
```

## How to access / Basic Usage

To enable sending logs to `loki`, you must register this channel in Laravel's logging structure.
In your `config/logging.php` file, add it to the `channels` array:

```php
'channels' => [
    // ...

    'loki' => [
        'driver' => 'monolog',
        'handler' => \Darkton\Loki\Logging\LokiRedisHandler::class,
    ],
],
```

Now you can log normally and direct your default stack to "loki" or access the channel directly:

```php
use Illuminate\Support\Facades\Log;

Log::channel('loki')->info('This log will be saved in Redis and later dispatched to Loki!');
```

### The Dispatcher (Sync Command)

Monolog's `LokiRedisHandler` **does not** send HTTP requests immediately. Instead, it saves them in a secure Redis list (buffer).

To actually ship these logs to Grafana Loki, you need to call the sync command. It will read the buffer, split it into organized batches, and dispatch a Laravel `Job` to perform the OTLP async request:

You can call it manually:
```bash
php artisan loki:sync
```

Ideally, you should schedule it in your console infrastructure (`routes/console.php` or `app/Console/Kernel.php` depending on your Laravel version):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('loki:sync')->everyMinute();
```

> **Tip**: Make sure your `queue:work` supervisors or Horizon are running on your server, as the heavy pushing is offloaded to your application's queues!

## License

This package is distributed and licensed under the terms of the [MIT license](LICENSE).