# laravel-audit-logs

## Requirements

- PHP ^8.2
- Laravel ^11.0 || ^12.0

### How to use

1. Install the package via composer:

```bash
composer require mnarushevich/laravel-audit-logs
```

2. Publish migrations:

```bash
php artisan vendor:publish --provider="MNarushevich\AuditLogs\AuditLogsServiceProvider" --tag="migrations"
```

3. Publish config (optional):

```bash
php artisan vendor:publish --provider="MNarushevich\AuditLogs\AuditLogsServiceProvider" --tag="config"
```

4. Run migrations:

```bash
php artisan migrate
```

5. In your model use `MNarushevich\AuditLogs\Traits\HasAuditLogs` trait:

```php
use MNarushevich\AuditLogs\Traits\HasAuditLogs;
```
