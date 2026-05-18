# Disposable Email Blocker for Laravel

Laravel integration for disposable/temporary email detection. Built on top of [`raul3k/disposable-email-blocker-core`](https://github.com/raul3k/disposable-email-blocker-core).

## Features

- **Validation Rule** - Easily validate emails in forms
- **Facade** - Simple API for checking emails anywhere
- **Database Checker** - Store and manage disposable domains in your database
- **Artisan Commands** - Update domains from multiple sources
- **Laravel Cache Integration** - Redis, File, Database, or any Laravel cache driver
- **Auto-discovery** - Works out of the box with Laravel 11 and 12

## Installation

```bash
composer require raul3k/disposable-email-blocker-laravel
```

The package uses Laravel's auto-discovery, so no manual service provider registration is needed.

### Publish Configuration (Optional)

```bash
php artisan vendor:publish --tag=disposable-blocker-config
```

### Publish Migrations (For Database Checker)

```bash
php artisan vendor:publish --tag=disposable-blocker-migrations
php artisan migrate
```

## Usage

### Validation Rule

```php
use Raul3k\DisposableBlocker\Laravel\Rules\NotDisposableEmail;

// In a Form Request
public function rules(): array
{
    return [
        'email' => ['required', 'email', new NotDisposableEmail()],
    ];
}

// With custom message
'email' => [new NotDisposableEmail('Temporary emails are not allowed')],

// In a Controller
$request->validate([
    'email' => ['required', 'email', new NotDisposableEmail()],
]);
```

### Facade

```php
use Raul3k\DisposableBlocker\Laravel\Facades\DisposableEmail;

// Simple check
if (DisposableEmail::isDisposable($email)) {
    return back()->withErrors(['email' => 'Disposable emails not allowed']);
}

// Get detailed result
$result = DisposableEmail::check($email);
$result->isDisposable();    // bool
$result->isSafe();          // bool
$result->getDomain();       // string
$result->getConfidence();   // float

// Check domain directly
DisposableEmail::isDomainDisposable('mailinator.com'); // true

// Batch checking
$results = DisposableEmail::checkBatch([
    'user1@gmail.com',
    'user2@mailinator.com',
]);

// Domain information
$info = DisposableEmail::info('user@mail.example.co.uk');
$info->domain();       // 'example.co.uk'
$info->subdomain();    // 'mail'
$info->publicSuffix(); // 'co.uk'
$info->isPrivate();    // false
```

### Artisan Commands

```bash
# List available sources
php artisan disposable:list-sources

# Update domains from all sources
php artisan disposable:update

# Update from a specific source
php artisan disposable:update --source=mailchecker

# Import from a specific source
php artisan disposable:import mailchecker

# Import with options
php artisan disposable:import mailchecker --clear --chunk=500
```

## Configuration

```php
// config/disposable-blocker.php

return [
    // Checker type: 'file', 'database', 'pattern', 'chain'
    'checker' => env('DISPOSABLE_CHECKER', 'file'),

    // Use bundled list from core package
    'use_bundled_list' => true,

    // Enable pattern-based detection
    'pattern_detection' => false,

    // Domains to whitelist (never block)
    'whitelist' => [
        // 'mycompany.com',
    ],

    // Cache settings
    'cache' => [
        'enabled' => true,
        'store' => env('DISPOSABLE_CACHE_STORE', 'default'),
        'ttl' => 3600,
        'prefix' => 'disposable_email:',
    ],

    // Database settings (when checker = 'database')
    'database' => [
        'table' => 'disposable_domains',
        'connection' => null,
    ],
];
```

## Checker Types

### File Checker (Default)

Uses the bundled list from the core package. Fast and requires no setup.

```php
'checker' => 'file',
'use_bundled_list' => true,
```

### Database Checker

Store domains in your database for custom management.

```bash
php artisan vendor:publish --tag=disposable-blocker-migrations
php artisan migrate
php artisan disposable:update
```

```php
'checker' => 'database',
```

### Chain Checker

Combine multiple checkers (database + bundled list).

```php
'checker' => 'chain',
'use_bundled_list' => true,
```

### Pattern Detection

Enable heuristic detection based on common patterns in disposable domain names.

```php
'pattern_detection' => true,
```

## Available Sources

The package can fetch domains from multiple sources:

| Source | Description |
|--------|-------------|
| `disposable-email-domains` | Large comprehensive list (~170k domains) |
| `burner-email-providers` | Curated list (~4k domains) |
| `mailchecker` | FGRibreau's mailchecker list |
| `ivolo-disposable` | Ivolo's disposable domains |
| `fakefilter` | 7c/fakefilter list |

## Testing

```bash
composer test
```

## Static Analysis

```bash
composer analyse
```

## License

MIT License. See [LICENSE](LICENSE) for details.
