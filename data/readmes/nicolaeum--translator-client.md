# Translator Client for Laravel

Laravel package for [LangSyncer](https://langsyncer.com) - live translation management without deployments.

## Features

- **Live Updates**: Translation changes appear in your app within seconds
- **Static Mode**: Traditional file-based translations for full control
- **Code Scanner**: Find hardcoded strings in your codebase
- **Multi-Project**: Manage multiple translation projects in one app
- **Webhooks**: Auto-sync when translations change in LangSyncer

## Requirements

- PHP 8.2+
- Laravel 10, 11, or 12

## Installation

```bash
composer require headwires/translator-client
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=translator-client-config
```

## Quick Start

Add to your `.env`:

```env
CLI_TRANSLATOR_API_KEY=your-api-key-from-langsyncer
```

Sync translations:

```bash
php artisan translator:sync
```

Done! Use Laravel's translation helpers as usual:

```php
{{ __('messages.welcome') }}
{{ __('messages.greeting', ['name' => $user->name]) }}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLI_TRANSLATOR_API_KEY` | Your project API key from LangSyncer | required |
| `CLI_TRANSLATOR_CLIENT_MODE` | `static`, `live`, or `auto` | `static` |
| `CLI_TRANSLATOR_SYNC_STRATEGY` | `overwrite` or `merge` | `overwrite` |
| `CLI_TRANSLATOR_CLIENT_CACHE_TTL` | Cache TTL in seconds (live mode) | `3600` |
| `CLI_TRANSLATOR_CLIENT_WEBHOOK_ENABLED` | Enable webhook endpoint | `true` |

### Client Modes

#### Static Mode (Default)

Translations saved as PHP files in `resources/lang/`. Best for production.

```env
CLI_TRANSLATOR_CLIENT_MODE=static
```

#### Live Mode

Translations loaded from cache, updated instantly via webhooks. Uses your project's configured cache driver.

```env
CLI_TRANSLATOR_CLIENT_MODE=live
```

#### Auto Mode

Automatically selects live mode for serverless (Vapor) or static mode otherwise.

```env
CLI_TRANSLATOR_CLIENT_MODE=auto
```

### Sync Strategies

#### Overwrite (Default)

Replaces local files completely. Use when LangSyncer is your source of truth.

```env
CLI_TRANSLATOR_SYNC_STRATEGY=overwrite
```

#### Merge

Preserves local-only keys while updating from LangSyncer. CDN values take precedence for existing keys.

```env
CLI_TRANSLATOR_SYNC_STRATEGY=merge
```

## Commands

### translator:sync

Download translations from LangSyncer:

```bash
php artisan translator:sync

# Sync specific project (if using multi-project)
php artisan translator:sync --project=main

# Force sync (ignore checksums)
php artisan translator:sync --force
```

### translator:warmup

Pre-cache translations for live mode. Run during deployment:

```bash
php artisan translator:warmup
```

### translator:status

Check configuration and connection status:

```bash
php artisan translator:status
```

Output:
```
Project Name
   API Key: 019bd1c2-... (configured)
   Path: /var/www/app/resources/lang
   Mode: live
   Cache TTL: 3600s
   Webhook: configured
```

### translator:scan

Scan your codebase for hardcoded strings:

```bash
php artisan translator:scan
```

Scans `.blade.php` and `.php` files for text that should be translated.

### translator:apply

Apply approved scanner suggestions and activate translations:

```bash
php artisan translator:apply
```

## Multi-Project Setup

Configure multiple projects in `config/translator-client.php`:

```php
'projects' => [
    [
        'name' => 'main',
        'api_key' => env('CLI_TRANSLATOR_API_KEY'),
        'path' => resource_path('lang'),
        'scan_paths' => ['resources/views', 'app'],
    ],
    [
        'name' => 'package',
        'api_key' => env('CLI_TRANSLATOR_PACKAGE_API_KEY'),
        'path' => base_path('vendor/your-package/resources/lang'),
        'scan_paths' => ['vendor/your-package/resources/views'],
    ],
],
```

Sync specific project:

```bash
php artisan translator:sync --project=package
```

## Webhooks

The package automatically registers a webhook endpoint at `/api/translator/webhook`. Configure this URL in your LangSyncer project settings.

When translations are published in LangSyncer, the webhook triggers an automatic sync.

Customize the route:

```env
CLI_TRANSLATOR_CLIENT_WEBHOOK_ROUTE=/custom/webhook/path
```

Disable webhooks:

```env
CLI_TRANSLATOR_CLIENT_WEBHOOK_ENABLED=false
```

## Deployment

Add to your deployment script:

```bash
php artisan translator:sync
php artisan translator:warmup  # if using live mode
```

### Laravel Scheduler

Auto-sync translations:

```php
// app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->command('translator:sync')
        ->hourly()
        ->withoutOverlapping();
}
```

## File Structure

After syncing (static mode):

```
resources/lang/
├── en/
│   ├── messages.php      # Managed by LangSyncer
│   ├── auth.php          # Managed by LangSyncer
│   └── custom.php        # Your local translations (safe)
└── es/
    ├── messages.php
    ├── auth.php
    └── custom.php
```

> **Note**: Synced files include a warning header. Create separate files for local-only translations.

## License

MIT

## Support

- Documentation: [langsyncer.com/documentation](https://langsyncer.com/documentation)
- Issues: [GitHub Issues](https://github.com/headwires/translator-client/issues)
