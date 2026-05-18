# Laravel DevTools

> A simple, secure web interface for common Laravel development tasks. No more switching to terminal for cache clearing, migrations, or seeding!

[![Latest Version](https://img.shields.io/packagist/v/imran/devtools.svg)](https://packagist.org/packages/imran/devtools)
[![License](https://img.shields.io/packagist/l/imran/devtools.svg)](https://packagist.org/packages/imran/devtools)

## Why DevTools?

As Laravel developers, we constantly run the same Artisan commands during development:

```bash
php artisan migrate
php artisan db:seed
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

**DevTools gives you a simple web UI to run these commands with one click** — no need to switch between browser and terminal. Perfect for rapid development, testing, and demos.

## What You Get

- �️ **One-Click Interface** - Run migrations, seeders, and cache clearing from your browser
- 🔒 **Safe by Default** - Only works in local/dev environments (production-protected)
- ⚡ **Instant Feedback** - See command output immediately on screen
- 🎨 **Clean UI** - Beautiful Bootstrap interface that works with or without your app's layout
- 🛡️ **Configurable Security** - IP allowlisting and custom middleware support

## Screenshot

Visit `/dev` in your Laravel app to see:

![DevTools Interface](https://via.placeholder.com/800x400?text=Clean+UI+with+Run+Migrations+%7C+Run+Seeders+%7C+Clear+Caches+buttons)

*A simple, professional interface for your development workflow.*

## Installation

**Step 1:** Install via Composer

```bash
composer require imran/devtools
```

**Step 2:** That's it! 🎉

The package auto-registers with Laravel. Now visit:

```
http://your-app.test/dev
```

You'll see three buttons ready to use.

## How to Use

### Web Interface

Navigate to `/dev` in your browser (local environment only). You'll see:

- **Run Migrations** button - Executes `php artisan migrate --force`
- **Run Seeders** button - Executes `php artisan db:seed`
- **Clear Caches** button - Clears all caches and returns JSON

Click any button to run the command. Output appears on screen instantly.

### API Usage (Optional)

You can also call endpoints directly:

**Clear All Caches (JSON Response)**

```bash
curl http://your-app.test/dev/clean
```

Response:

```json
{
  "ok": true,
  "environment": "local",
  "results": [...]
}
```

**Run Migrations**

```bash
curl -X POST http://your-app.test/dev/migrate
```

**Run Seeders**

```bash
curl -X POST http://your-app.test/dev/seed
```

## Configuration (Optional)

DevTools works out of the box. But if you need custom settings:

```bash
php artisan vendor:publish --provider="Imran\DevTools\DevToolsServiceProvider" --tag="devtools-config"
```

This creates `config/devtools.php`:

```php
return [
    // Enable or disable (null = auto-enable in local/dev)
    'enabled' => env('DEVTOOLS_ENABLED', null),

    // Which environments to allow
    'environments' => ['local', 'development', 'dev'],

    // Add extra middleware (e.g., auth, IP checks)
    'middleware' => ['web'],

    // Optional: restrict by IP address
    'allowed_ips' => [],
];
```

### Common Configurations

**Disable DevTools temporarily:**

```bash
# .env
DEVTOOLS_ENABLED=false
```

**Add authentication:**

```php
// config/devtools.php
'middleware' => ['web', 'auth'],
```

**Restrict to specific IPs:**

```php
// config/devtools.php
'allowed_ips' => ['127.0.0.1', '192.168.1.100'],
```

## Security

**DevTools is safe by default:**

✅ Only loads in `local`, `development`, or `dev` environments  
✅ Returns 404 in production automatically  
✅ All routes protected by configurable middleware  
✅ Optional IP allowlisting  
✅ CSRF protection on all POST requests

**For production (not recommended):** If you must enable DevTools in staging/production, always add authentication:

```php
'middleware' => ['web', 'auth', 'can:admin'],
```

## Customizing the UI

Want to match your app's design?

```bash
php artisan vendor:publish --provider="Imran\DevTools\DevToolsServiceProvider" --tag="devtools-views"
```

Views will be published to `resources/views/vendor/devtools/`. Edit them as needed!

## Use Cases

- **Rapid Development** - Quickly reset and reseed your database while testing
- **Demos** - Show clients fresh data without leaving the browser
- **Team Onboarding** - New developers can set up the database with one click
- **Testing Workflows** - Easily test migration rollbacks and seeding logic
- **Local Development** - Avoid switching between terminal and browser constantly

## Troubleshooting

**"Page not found" when visiting `/dev`**

- Check your `APP_ENV` is set to `local`, `development`, or `dev`
- Run `php artisan config:clear` to refresh config cache

**"Access denied" error**

- Verify your IP is allowed in `config/devtools.php` (if `allowed_ips` is set)
- Check middleware requirements (e.g., authentication)

**Commands don't show output**

- Check your Laravel logs at `storage/logs/laravel.log`
- Ensure you have proper database permissions for migrations

## Requirements

- PHP 8.0 or higher
- Laravel 8.x, 9.x, 10.x, or 11.x

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on [GitHub](https://github.com/imranhasan871/devtools).

## Credits

Created by [Imran Hasan](https://github.com/imranhasan871)

## License

MIT License. See [LICENSE](LICENSE) for details.
