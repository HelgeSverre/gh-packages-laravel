# Laravel API Debugger

A Laravel package for debugging API requests and responses with session-based logging, multi-tenancy support, and an AdminLTE/Bootstrap UI.

## Features

- **Session-based debugging** - Enable/disable logging per tenant, user, or globally
- **Auto-expiring sessions** - Sessions automatically expire after a configurable duration
- **Full request/response capture** - Headers, body, query parameters, status codes
- **Multi-tenancy support** - Works with Stancl/Tenancy, Spatie, or custom implementations
- **Token-based debugging** - Use `X-Debug-Token` header for targeted logging
- **Performance metrics** - Duration, memory usage, response sizes
- **Exception tracking** - Captures exception details and stack traces
- **Sensitive data redaction** - Automatically redacts passwords, tokens, etc.
- **AdminLTE UI** - Beautiful dashboard with filtering, search, and detail views
- **Artisan commands** - Enable/disable debugging from the command line
- **Queue support** - Optionally process logs via queue for better performance

## Requirements

- PHP 8.1+
- Laravel 10.x or 11.x
- AdminLTE 3.x / Bootstrap 4.x (for UI)

## Installation

### 1. Install via Composer

```bash
composer require indiesystems/laravel-api-debugger
```

### 2. Publish Configuration (optional)

```bash
php artisan vendor:publish --tag=api-debugger-config
```

### 3. Run Migrations

```bash
php artisan migrate
```

### 4. Add Middleware to API Routes

In `app/Http/Kernel.php`, add the middleware to your `api` group:

```php
protected $middlewareGroups = [
    'api' => [
        // ... other middleware
        \IndieSystems\ApiDebugger\Middleware\ApiDebuggerMiddleware::class,
    ],
];
```

### 5. Enable in Environment

Add to your `.env` file:

```env
API_DEBUGGER_ENABLED=true
```

## Usage

### Web UI

Access the debugger dashboard at `/api-debugger` (configurable).

### Creating Debug Sessions

#### Via Web UI

1. Navigate to `/api-debugger/sessions`
2. Select session type:
   - **All Requests** - Logs every API request
   - **Tenant** - Logs requests from a specific tenant
   - **User** - Logs requests from an authenticated user
3. Set duration and optional label
4. Click "Start Debugging"

#### Via Artisan Commands

```bash
# Enable for a tenant
php artisan api-debugger:enable --tenant=acme-corp --duration=60

# Enable for a user
php artisan api-debugger:enable --user=1 --duration=30

# Check status
php artisan api-debugger:status

# Disable for a tenant
php artisan api-debugger:disable --tenant=acme-corp

# Disable for a user
php artisan api-debugger:disable --user=1
```

#### Via Code

```php
use IndieSystems\ApiDebugger\Services\ApiDebuggerService;

$debugger = app(ApiDebuggerService::class);

// Enable for tenant (60 minutes)
$session = $debugger->enableForTenant('acme-corp', 60);

// Enable for user
$session = $debugger->enableForUser($userId, 30);

// Enable global logging
$session = $debugger->enableGlobal(60);

// Disable
$debugger->disable($session);
```

### Token-Based Debugging

Each session gets a unique token. Pass it in requests to log them to that session:

```bash
curl -H "X-Debug-Token: your-session-token" https://api.example.com/endpoint
```

This is useful for:
- Debugging unauthenticated API routes
- Testing from external tools (Postman, curl)
- Sharing tokens with team members for targeted debugging

### Capturing 404s

To log 404 responses, add a fallback route in `routes/api.php`:

```php
Route::fallback(fn () => response()->json(['error' => 'Not Found'], 404));
```

## Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag=api-debugger-config
```

### Key Options

```php
return [
    // Master switch
    'enabled' => env('API_DEBUGGER_ENABLED', false),

    // Database connection (null = default)
    'connection' => env('API_DEBUGGER_CONNECTION', null),

    // Logging driver: 'sync' or 'queue'
    'driver' => env('API_DEBUGGER_DRIVER', 'sync'),

    // Session settings
    'session' => [
        'default_duration' => 30,  // minutes
        'max_duration' => 120,     // minutes
        'cache_ttl' => 60,         // seconds
    ],

    // Route filtering
    'routes' => [
        'exclude' => [
            'api-debugger/*',
            'health',
            'up',
        ],
        'include' => [], // Empty = all routes
    ],

    // Sensitive data redaction
    'redact' => [
        'headers' => ['authorization', 'cookie', 'x-api-key'],
        'fields' => ['password', 'password_confirmation', 'secret', 'token'],
        'replacement' => '[REDACTED]',
    ],

    // Body storage
    'body' => [
        'store' => true,
        'max_size' => null, // null = no limit
    ],

    // Log retention
    'retention' => [
        'hours' => 24,
        'cleanup_interval' => 60, // minutes
    ],

    // Multi-tenancy
    'tenancy' => [
        'enabled' => true,
        'detector' => null, // Custom detector class
        'header' => 'X-Tenant-ID',
    ],

    // UI settings
    'ui' => [
        'prefix' => 'api-debugger',
        'middleware' => ['web', 'auth'],
        'per_page' => 25,
        'date_format' => 'Y-m-d H:i:s',
    ],

    // Authorization
    'authorization' => [
        'gate' => null, // e.g., 'access-api-debugger'
    ],
];
```

## Multi-Tenancy

The package auto-detects tenancy from:
1. Stancl/Tenancy's `tenant()` helper
2. Spatie's `Tenant::current()`
3. `X-Tenant-ID` header
4. Subdomain extraction

### Custom Tenant Detection

Create a custom detector:

```php
namespace App\Services;

use Illuminate\Http\Request;
use IndieSystems\ApiDebugger\Services\TenancyDetector;

class CustomTenancyDetector extends TenancyDetector
{
    public function detect(Request $request): ?string
    {
        // Your custom logic
        return $request->header('X-Organization-ID');
    }
}
```

Register in config:

```php
'tenancy' => [
    'detector' => \App\Services\CustomTenancyDetector::class,
],
```

## Authorization

### Using Gates

Define a gate in `AuthServiceProvider`:

```php
Gate::define('access-api-debugger', function ($user) {
    return $user->hasRole('admin');
});
```

Set in config:

```php
'authorization' => [
    'gate' => 'access-api-debugger',
],
```

### Using Middleware

Add custom middleware in config:

```php
'ui' => [
    'middleware' => ['web', 'auth', 'role:admin'],
],
```

## Artisan Commands

| Command | Description |
|---------|-------------|
| `api-debugger:enable` | Enable debugging for tenant/user |
| `api-debugger:disable` | Disable debugging for tenant/user |
| `api-debugger:status` | Show active sessions |
| `api-debugger:prune` | Delete old logs |
| `api-debugger:test` | Make test API requests |

### Test Command Examples

```bash
# List available test endpoints
php artisan api-debugger:test

# Run all test endpoints
php artisan api-debugger:test --all

# Run specific endpoint
php artisan api-debugger:test --endpoint=ping

# Run with token
php artisan api-debugger:test --all --token=your-token

# Run multiple times
php artisan api-debugger:test --all --count=5
```

## Queue Support

For high-traffic APIs, use queue-based logging:

```env
API_DEBUGGER_DRIVER=queue
API_DEBUGGER_QUEUE_CONNECTION=redis
API_DEBUGGER_QUEUE_NAME=api-debugger
```

## Customizing Views

Publish views:

```bash
php artisan vendor:publish --tag=api-debugger-views
```

Views will be copied to `resources/views/vendor/api-debugger/`.

## API

### ApiDebuggerService

```php
$debugger = app(ApiDebuggerService::class);

// Session management
$debugger->enableForTenant(string $tenantId, ?int $minutes, ?int $createdBy);
$debugger->enableForUser(string|int $userId, ?int $minutes, ?int $createdBy);
$debugger->enableGlobal(?int $minutes, ?int $createdBy);
$debugger->disable(ApiDebugSession $session);
$debugger->getActiveSession(Request $request);
$debugger->getActiveSessions();

// Cleanup
$debugger->deactivateExpiredSessions();
$debugger->pruneOldLogs();
```

### ApiDebugSession Model

```php
$session->isActive();
$session->isExpired();
$session->remainingMinutes();
$session->extend(int $minutes);
$session->stop();
$session->logs(); // HasMany relationship
```

### ApiLog Model

```php
$log->session;
$log->user;
$log->method_color;      // Bootstrap color class
$log->status_color;      // Bootstrap color class
$log->formatted_duration;
$log->formatted_request_size;
$log->formatted_response_size;
$log->parsed_request_body;
$log->parsed_response_body;
$log->has_exception;
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please submit a Pull Request.

## Credits

- [Chris Dimas](https://indie.systems)
- [All Contributors](../../contributors)
