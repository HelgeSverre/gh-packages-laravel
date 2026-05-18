# Laravel Logreader

This is the client package for [logreader.dev](https://logreader.dev). Install it on your Laravel application to allow the Logreader to remotely read your log files via a secure API.

## Installation

```bash
composer require mvd81/laravel-logreader
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=logreader-config
```

### Token

Add the token you received from the Logreader application to your `.env`:

```env
LOGREADER_TOKEN=your-token-here
```

You can find this token in the [logreader.dev](https://logreader.dev) dashboard after registering your application.

### Options

| Option | Env variable | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `LOGREADER_ENABLED` | `true` | Enable or disable the API |
| `token` | `LOGREADER_TOKEN` | `null` | Token provided by the Logreader app |
| `exclude_logs` | `LOGREADER_EXCLUDE_LOGS` | `''` | Comma-separated list of files/patterns to exclude |

To disable the logreader without removing the package:

```env
LOGREADER_ENABLED=false
```

To exclude specific log files or directories:

```env
LOGREADER_EXCLUDE_LOGS=passwords.log,private/*,*.tmp
```

## License

MIT
