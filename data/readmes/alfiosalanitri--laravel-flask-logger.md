# Laravel Flask Logger

A log handler for Laravel that sends logs to a Flask server running the [Flask Log Monitor](https://github.com/alfiosalanitri/flask-log-monitor) application.

> ⚠️ **Dependency:**
> This package requires a running instance of the Flask Log Monitor server.
> You can clone and start it from [https://github.com/alfiosalanitri/flask-log-monitor](https://github.com/alfiosalanitri/flask-log-monitor).

---

## Installation

```bash
composer require alfiosalanitri/laravel-flask-logger
```

## Configuration

You can publish the configuration file:

```bash
php artisan vendor:publish --tag=config
```

Or use the environment variables directly:

```env
LOG_CHANNEL=stack
LOG_STACK=flask,daily
LOG_FLASK_URL=http://localhost:5000
LOG_FLASK_TOKEN=secret
```

Make sure your Flask Log Monitor server is running and reachable at the URL defined in `LOG_FLASK_URL`.

---

## Usage

Send logs to your Flask server using the `flask` channel:

```php
Log::channel('flask')->info('Test log sent to Flask!', ['foo'=>'bar']);
```

If the Flask server is unavailable, logs will automatically fall back to the local `daily` channel.

---

## License

MIT License © Alfio Salanitri
