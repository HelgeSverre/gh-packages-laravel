# Laravel DeepL Translation

[![Latest Version on Packagist](https://img.shields.io/packagist/v/cleargoal/laravel-deepl.svg?style=flat-square)](https://packagist.org/packages/cleargoal/laravel-deepl)
[![Total Downloads](https://img.shields.io/packagist/dt/cleargoal/laravel-deepl.svg?style=flat-square)](https://packagist.org/packages/cleargoal/laravel-deepl)

A Laravel package for DeepL translation with advanced features:

- **Multi-Key Management**: Automatic rotation between multiple DeepL API keys from different accounts to increase total quota
- **Quota Tracking**: Per-key character usage tracking with automatic key selection
- **Smart Caching**: 5-minute cache TTL for API keys to reduce database queries
- **Language Detection**: Automatic source language detection
- **Event-Driven**: Laravel events for quota exhaustion notifications
- **Graceful Degradation**: Handles database unavailability during installation
- **Filament Integration**: Optional beautiful admin UI (auto-enabled when Filament is installed)
- **Artisan Commands**: Full CLI management without requiring UI

## Requirements

- PHP 8.1 or higher
- Laravel 10.x, 11.x, or 12.x
- PostgreSQL, MySQL, or SQLite database

## Installation

Install the package via Composer:

```bash
composer require cleargoal/laravel-deepl
```

### Publish Configuration

Publish the configuration file:

```bash
php artisan vendor:publish --tag=deepl-config
```

This creates `config/deepl.php` where you can customize package behavior.

### Publish and Run Migration

Publish the migration:

```bash
php artisan vendor:publish --tag=deepl-migrations
```

Run the migration to create the `platform_settings` table:

```bash
php artisan migrate
```

## Configuration

### Add Your First API Key

Add your DeepL API key using the artisan command:

```bash
php artisan deepl:add-key "your-deepl-api-key-here" 1 --label="Production Key"
```

Parameters:
- `api-key`: Your DeepL API key
- `renewal-day`: Day of month when quota renews (1-31)
- `--label`: Optional friendly name for the key

That's it! The key is now stored in the database and ready to use.

### Optional: Customize Storage

If you want to use a different table or key name, add to your `.env`:

```env
DEEPL_SETTINGS_TABLE=platform_settings  # default
DEEPL_SETTINGS_KEY=deepl_api_keys       # default
```

## Usage

### Basic Translation

Translate text from one language to another:

```php
use Cleargoal\LaravelDeepL\Facades\DeepL;

// Translate English to German
$translated = DeepL::translate('Hello, world!', 'en', 'de');
// Result: "Hallo, Welt!"

// Translate Ukrainian to French
$translated = DeepL::translate('Доброго ранку', 'uk', 'fr');
// Result: "Bon matin"
```

### Translate to All Languages

Translate text to all supported languages at once:

```php
use Cleargoal\LaravelDeepL\Facades\DeepL;

$translations = DeepL::translateToAll('Welcome to our platform', 'en');

// Result:
// [
//     'en' => 'Welcome to our platform',
//     'uk' => 'Ласкаво просимо на нашу платформу',
//     'de' => 'Willkommen auf unserer Plattform',
//     'fr' => 'Bienvenue sur notre plateforme',
//     'es' => 'Bienvenido a nuestra plataforma'
// ]
```

### Language Detection

Automatically detect the language of text:

```php
use Cleargoal\LaravelDeepL\Facades\DeepL;

$detectedLang = DeepL::detectLanguage('Bonjour le monde');
// Result: 'fr'

$detectedLang = DeepL::detectLanguage('Hola mundo');
// Result: 'es'
```

### Using Dependency Injection

You can also inject the service directly:

```php
use Cleargoal\LaravelDeepL\Services\DeepLTranslationService;

class TranslationController extends Controller
{
    public function __construct(
        private DeepLTranslationService $deepl
    ) {}

    public function translate(Request $request)
    {
        $translated = $this->deepl->translate(
            $request->input('text'),
            $request->input('source'),
            $request->input('target')
        );

        return response()->json(['translation' => $translated]);
    }
}
```

## Managing API Keys

The package provides artisan commands for easy key management.

**Important**: To increase your total quota, each API key must be from a **different DeepL account**. Multiple keys from the same account share the same quota and won't increase your limit. Create separate DeepL Free accounts (different emails) to get 500,000 characters per account per month.

### Add a New Key

```bash
php artisan deepl:add-key "your-api-key" 15 --label="Production Key #2"
```

### List All Keys

```bash
php artisan deepl:list-keys
```

This displays a table with all keys, showing:
- Index number
- Label
- Masked API key
- Status (Active/Inactive)
- Remaining quota
- Usage percentage
- Renewal day

Tip: Use `--show-keys` to display full API keys (be careful in shared environments).

### Check Quota

Check all keys:

```bash
php artisan deepl:check-quota
```

Check a specific key:

```bash
php artisan deepl:check-quota --key=0
```

### Remove a Key

```bash
php artisan deepl:remove-key 0
```

The command will ask for confirmation. Use `--force` to skip confirmation.

### Advanced: Programmatic API

If you're building an admin panel or need programmatic access, you can use the `DeepLApiKeyManager` service directly:

```php
use Cleargoal\LaravelDeepL\Services\DeepLApiKeyManager;

$keyManager = app(DeepLApiKeyManager::class);

// Add key
$keyManager->addKey('your-api-key', 15, 'Production Key');

// Get all keys
$keys = $keyManager->getAllKeys();

// Check quota for specific key
$quota = $keyManager->checkQuota(0);

// Update key
$keyManager->updateKey(0, [
    'label' => 'Updated Label',
    'is_active' => false,
    'renewal_day' => 1
]);

// Delete key
$keyManager->deleteKey(0);
```

## Filament Admin Panel Integration

If you're using [Filament](https://filamentphp.com/) in your Laravel application, the package automatically provides a beautiful admin interface for managing DeepL API keys.

### Installation

The Filament integration is automatically enabled when Filament is detected in your application. No additional configuration required!

If you don't have Filament yet:

```bash
composer require filament/filament:"^3.0"
php artisan filament:install --panels
```

### Features

Once Filament is installed, you'll find a new "DeepL API Keys" page in your admin panel under the "Settings" navigation group. The interface provides:

**Key Management**:
- ➕ **Add API Keys** - Modal form with API key, label, and renewal day (use keys from different DeepL accounts to increase quota)
- 📋 **List Keys** - Table view with quota usage, status, and last check time
- ✏️ **Edit Keys** - Update label, renewal day, and active status
- 🗑️ **Delete Keys** - Remove keys with confirmation

**Quota Monitoring**:
- 🔄 **Refresh Quotas** - Bulk update all keys from DeepL API
- 📊 **Usage Indicators** - Color-coded quota usage (green/yellow/red)
- ⏰ **Next Renewal** - Shows when each key's quota will reset
- ⚠️ **Stale Data Warnings** - Alerts when local quota might be outdated

**Security**:
- 🔒 **Masked API Keys** - Keys are partially hidden by default
- 📋 **Copy to Clipboard** - Quick copy with visual confirmation
- 🔐 **Reveal Full Keys** - Optional full key display

### Customization

**Navigation Group**: The page appears under "Settings" by default. To change this, publish the views:

```bash
php artisan vendor:publish --tag=deepl-views
```

Then edit `resources/views/vendor/laravel-deepl/filament/pages/manage-deepl-keys.blade.php`.

You can also extend the `ManageDeepLKeys` class in your own Filament panel:

```php
use Cleargoal\LaravelDeepL\Filament\Pages\ManageDeepLKeys as BaseManageDeepLKeys;

class ManageDeepLKeys extends BaseManageDeepLKeys
{
    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 10;

    // Add custom logic here
}
```

**Access Control**: Use Filament's built-in policy system to restrict access:

```php
// In your FilamentPanelProvider or config
->authGuard('web')
->authMiddleware([
    Authenticate::class,
])
```

### Screenshots

The Filament interface provides:
- **Table view** with all your DeepL API keys
- **Add Key** button in the header
- **Quota usage** with color-coded indicators
- **Quick actions** (Check Quota, Edit, Delete) for each key
- **Refresh All Quotas** button to sync with DeepL API

### No Filament? No Problem!

If you don't use Filament, the artisan commands provide full functionality via CLI. The Filament integration is completely optional and adds zero overhead if not installed.

## Handling Quota Exhaustion

When all API keys are exhausted, the package fires a Laravel event that you can listen to:

### Option 1: Event Listener

Create an event listener:

```php
// app/Listeners/NotifyAdminsQuotaExhausted.php
<?php

namespace App\Listeners;

use App\Models\User;
use App\Notifications\DeepLQuotaExhausted;
use Illuminate\Support\Facades\Log;

class NotifyAdminsQuotaExhausted
{
    public function handle($event): void
    {
        Log::error('DeepL quota exhausted', [
            'source_locale' => $event['source_locale'],
            'target_locale' => $event['target_locale'],
            'keys_tried' => $event['keys_tried'],
            'next_renewal' => $event['next_renewal']?->format('Y-m-d'),
        ]);

        // Notify all administrators
        User::where('role', 'admin')->each->notify(
            new DeepLQuotaExhausted(
                $event['source_locale'],
                $event['target_locale'],
                $event['keys_tried'],
                $event['next_renewal']
            )
        );
    }
}
```

Register the listener in `EventServiceProvider`:

```php
use Illuminate\Support\Facades\Event;

Event::listen('deepl.quota.exhausted', NotifyAdminsQuotaExhausted::class);
```

### Option 2: Configuration Callback

Set a callback in `config/deepl.php`:

```php
'quota_exhausted_callback' => function($sourceLocale, $targetLocale, $keyCount, $nextRenewal) {
    \App\Models\User::where('role', 'admin')->each->notify(
        new \App\Notifications\DeepLQuotaExhausted($sourceLocale, $targetLocale, $keyCount, $nextRenewal)
    );
},
```

## Supported Languages

- English (`en`)
- Ukrainian (`uk`)
- German (`de`)
- French (`fr`)
- Spanish (`es`)

To add more languages, you can extend the `$deeplCodes` array in `DeepLTranslationService`.

## How It Works

### Automatic Key Rotation

The package automatically rotates between multiple API keys based on remaining quota:

1. Keys are sorted by remaining quota (most available first)
2. Each translation attempt tries keys in order
3. If a key's quota is exceeded, the next key is tried automatically
4. Character usage is tracked locally to minimize API calls

**Note**: Each API key must be from a different DeepL account. Keys from the same account share quota, so create separate free accounts (using different email addresses) to multiply your translation capacity. For example, 3 accounts = 1,500,000 characters/month (3 × 500,000).

### Smart Caching

API keys are cached for 5 minutes to reduce database queries while still allowing dynamic updates.

### Renewal Day Tracking

Each API key has a `renewal_day` (1-31) indicating when DeepL resets its monthly quota. The package uses this to:

- Calculate when exhausted keys will be available again
- Cache quota exhaustion notifications until the earliest renewal date
- Prevent spam notifications

## Testing

The package includes comprehensive tests. To run them:

```bash
composer test
```

For test coverage:

```bash
composer test-coverage
```

For static analysis:

```bash
composer analyse
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security

If you discover any security-related issues, please email cleargoal01@gmail.com instead of using the issue tracker.

## Credits

- [Volodymyr Yefremov](https://github.com/cleargoal)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
