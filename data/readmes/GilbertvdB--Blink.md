# gvdbiezen/blink

`blink/blink` is a Laravel dev-focused debugging package that sends structured payloads to the Blink desktop receiver over HTTP.

## Requirements

- PHP 8.4+
- Laravel 11+

## Install

```bash
composer require gvdbiezen/blink --dev
php artisan vendor:publish --tag=blink-config
```

## Add middleware for per-request run IDs

Add `\Blink\Blink\Http\Middleware\BlinkRunIdMiddleware::class` to your `web` and/or `api` middleware group in `app/Http/Kernel.php`.

This middleware:
- generates a request-scoped run id,
- stores it in the container as `blink.run_id`,
- and writes it to `X-Blink-RunId` (configurable).

## Usage

### Global helper

```php
blink($value);
blink($value, 'label');
blink($value, 'label', 'info'); // info|warn|error|debug
```

Returns the original value.

### Fluent builder

```php
blink()
    ->label('checkpoint')
    ->level('debug')
    ->send($value);
```

### Facade

```php
Blink::label('checkpoint')->level('warn')->send($value);
```

### Exceptions

```php
try {
    // ...
} catch (Throwable $e) {
    blink_exception($e, 'failed operation');
}
```

### Stop execution

```php
blink_die($value, 'fatal state');
```

## Default message schema

Messages are POSTed to `BLINK_URL` (`http://127.0.0.1:23517/message` by default):

```json
{
  "run_id": "uuid",
  "ts": "ISO8601",
  "app": "MyApp",
  "env": "local",
  "level": "info",
  "label": "optional",
  "caller": {"file":"...","line":123,"function":"..."},
  "data": {}
}
```

## Configuration overview

Published at `config/blink.php`:

- `enabled`
- `url`
- `run_id_header`
- `timeout_seconds`
- `connect_timeout_seconds`
- `max_payload_bytes`
- `truncate_preview_bytes`
- `capture_caller`
- `max_depth`
- `max_items`
- `redact_keys`

## Troubleshooting

- **Receiver down**: package fails silently by design and won’t throw.
- **Wrong port / URL**: set `BLINK_URL` to your receiver endpoint.
- **Payload truncated**: increase `BLINK_MAX_PAYLOAD_BYTES` or inspect the `preview` data.

## Security note

The default URL points to localhost. Keep it local unless you explicitly trust your remote endpoint.
