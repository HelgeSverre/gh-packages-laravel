# Laravel Authorization Logger

[![Latest Version on Packagist](https://img.shields.io/packagist/v/marventhieme/laravel-authorization-logger.svg?style=flat-square)](https://packagist.org/packages/marventhieme/laravel-authorization-logger)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/marventhieme/laravel-authorization-logger/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/marventhieme/laravel-authorization-logger/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/marventhieme/laravel-authorization-logger/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/marventhieme/laravel-authorization-logger/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/marventhieme/laravel-authorization-logger.svg?style=flat-square)](https://packagist.org/packages/marventhieme/laravel-authorization-logger)

A Laravel package that automatically logs authorization denials (failed `Gate::allows()` and policy checks) with comprehensive context including user information, policy details, request data, and the referrer URL. Perfect for security auditing, debugging authorization issues, and monitoring unauthorized access attempts.

## Features

- **Automatic Logging**: Hooks into Laravel's Gate system to automatically log all authorization denials
- **Rich Context**: Captures user, policy, and request information including:
  - User ID, IP address, and roles (Spatie Laravel Permission compatible)
  - Policy class, method, and ability being checked
  - Model class and ID (if applicable)
  - Request method, URL, endpoint, route name, and referrer
  - Sanitized request body with sensitive field filtering
- **Multiple Handlers**: Built-in handlers for Ray, Laravel Log, and Database storage
- **Flexible Configuration**: Fine-tune what gets logged and what gets ignored
- **Database Pruning**: Automatic cleanup of old logs with configurable retention periods
- **Security Focused**: Automatically filters sensitive fields like passwords and tokens
- **Custom Handlers**: Easy to create your own log handlers for any destination

## Installation

Install the package via Composer:

```bash
composer require marventhieme/laravel-authorization-logger
```

### Database Setup

Publish and run the migrations:

```bash
php artisan vendor:publish --tag="laravel-authorization-logger-migrations"
php artisan migrate
```

This creates an `authorization_denials` table to store authorization denial logs.

### Configuration

Publish the config file:

```bash
php artisan vendor:publish --tag="laravel-authorization-logger-config"
```

This will create `config/authorization-logger.php` with the following options:

```php
return [
    // Enable/disable logging globally
    'enabled' => env('AUTHORIZATION_LOGGING_ENABLED', true),

    // Log handlers pipeline - data flows through each handler
    'handlers' => [
        \MarvenThieme\LaravelAuthorizationLogger\Handlers\DebugToRay::class,
        \MarvenThieme\LaravelAuthorizationLogger\Handlers\WriteToDatabase::class,
        // \MarvenThieme\LaravelAuthorizationLogger\Handlers\WriteToLog::class,
    ],

    // HTTP methods to skip logging (e.g., ['GET', 'HEAD'])
    'http_methods_to_ignore' => [],

    // Classes to ignore in the stack trace
    'classes_to_ignore' => [
        \Illuminate\Http\Resources\Json\JsonResource::class,
    ],

    // Sensitive fields filtered from request bodies
    'sensitive_fields' => [
        'password', 'password_confirmation', 'token', 'api_token',
        'secret', 'private_key', 'card_number', 'cvv', 'ssn',
        // ... see config file for full list
    ],

    // Maximum request body size in bytes
    'max_body_size' => env('AUTHORIZATION_LOGGING_MAX_BODY_SIZE', 10240),

    // Log channel for WriteToLog handler
    'log_channel' => env('AUTHORIZATION_LOGGING_CHANNEL', 'daily'),

    'database' => [
        // Days to keep logs before pruning
        'prunable_after_days' => env('AUTHORIZATION_LOGGING_PRUNABLE_AFTER_DAYS', 30),
    ],
];
```

## Usage

Once installed, the package works automatically. Any authorization denial will be logged according to your configuration.

### Example Scenarios

**Policy denial:**
```php
// In your controller
$this->authorize('update', $post); // Fails if user can't update

// Automatically logs:
// - User: ID, IP, roles
// - Policy: PostPolicy::update
// - Model: App\Models\Post #123
// - Request: POST /posts/123, referrer, body
```

**Gate denial:**
```php
Gate::authorize('admin-only-feature'); // Fails for non-admins

// Automatically logs:
// - User: ID, IP, roles
// - Ability: admin-only-feature
// - Request: Current request context
```

### Available Handlers

#### DebugToRay
Sends authorization denials to [Ray](https://myray.app/) for real-time debugging.

```php
'handlers' => [
    \MarvenThieme\LaravelAuthorizationLogger\Handlers\DebugToRay::class,
],
```

#### WriteToDatabase
Stores denials in the `authorization_denials` table.

```php
'handlers' => [
    \MarvenThieme\LaravelAuthorizationLogger\Handlers\WriteToDatabase::class,
],
```

Query the database:
```php
use MarvenThieme\LaravelAuthorizationLogger\Models\AuthorizationDenial;

// Recent denials for a user
$denials = AuthorizationDenial::where('user_id', $userId)
    ->orderBy('logged_at', 'desc')
    ->get();

// Denials for a specific ability
$denials = AuthorizationDenial::where('ability', 'update')
    ->where('model_class', Post::class)
    ->get();
```

#### WriteToLog
Writes denials to Laravel's log system.

```php
'handlers' => [
    \MarvenThieme\LaravelAuthorizationLogger\Handlers\WriteToLog::class,
],
```

Configure the log channel:
```php
'log_channel' => env('AUTHORIZATION_LOGGING_CHANNEL', 'daily'),
```

### Creating Custom Handlers

Create your own handler by implementing the `LogHandler` contract:

```php
namespace App\Handlers;

use MarvenThieme\LaravelAuthorizationLogger\Contracts\LogHandler;
use MarvenThieme\LaravelAuthorizationLogger\Objects\LogData;

class SendToSlack implements LogHandler
{
    public function handle(LogData $logData): void
    {
        // Send to Slack, email, external API, etc.
        // Access data: $logData->userContext, $logData->policyContext, $logData->requestContext
    }
}
```

Register it in config:
```php
'handlers' => [
    \App\Handlers\SendToSlack::class,
],
```

### LogData Structure

The `LogData` object passed to handlers contains:

```php
// Event info
$logData->event;      // "Authorization Denied"
$logData->timestamp;  // ISO8601 timestamp

// User context
$logData->userContext->type;        // "authenticated" or "anonymous"
$logData->userContext->userId;      // User ID or null
$logData->userContext->ipAddress;   // IP address
$logData->userContext->roles;       // Array of role names (if using Spatie Permission)

// Policy context
$logData->policyContext->ability;       // "update", "delete", etc.
$logData->policyContext->policyClass;   // "App\Policies\PostPolicy"
$logData->policyContext->policyMethod;  // "update"
$logData->policyContext->modelClass;    // "App\Models\Post"
$logData->policyContext->modelId;       // 123

// Request context
$logData->requestContext->method;     // "POST"
$logData->requestContext->url;        // "https://example.com/posts/123"
$logData->requestContext->endpoint;   // "/posts/123"
$logData->requestContext->routeName;  // "posts.update"
$logData->requestContext->referrer;   // Previous URL or null
$logData->requestContext->body;       // Sanitized request body
```

## Database Pruning

The package uses Laravel's model pruning to automatically clean up old logs. Configure retention in your config:

```php
'database' => [
    'prunable_after_days' => env('AUTHORIZATION_LOGGING_PRUNABLE_AFTER_DAYS', 30),
],
```

Schedule the pruning command in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('model:prune')->daily();
}
```

## Advanced Configuration

### Ignoring Specific HTTP Methods

Skip logging for GET requests (useful for reducing noise from UI checks):

```php
'http_methods_to_ignore' => ['GET', 'HEAD'],
```

### Ignoring Specific Classes

By default, authorization checks from JSON Resources are ignored:

```php
'classes_to_ignore' => [
    \Illuminate\Http\Resources\Json\JsonResource::class,
    // Add your own classes here
],
```

### Custom Sensitive Fields

Add your own fields to filter from request bodies:

```php
'sensitive_fields' => [
    'password',
    'api_key',
    'your_custom_secret_field',
],
```

## Environment Variables

Available environment variables for quick configuration:

```env
AUTHORIZATION_LOGGING_ENABLED=true
AUTHORIZATION_LOGGING_MAX_BODY_SIZE=10240
AUTHORIZATION_LOGGING_CHANNEL=daily
AUTHORIZATION_LOGGING_PRUNABLE_AFTER_DAYS=30
```

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Marven Thieme](https://github.com/marventhieme)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
