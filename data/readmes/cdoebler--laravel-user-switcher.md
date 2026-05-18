# Laravel User Switcher

> **⚠️ DEVELOPMENT TOOL - NOT FOR PRODUCTION USE ⚠️**
>
> This package is designed for **local development and staging environments only**.
> It allows developers to quickly switch between user accounts for testing and debugging purposes.
>
> **DO NOT enable this package in production environments** unless you have a specific, well-understood use case and have implemented additional security measures.

This package provides [Laravel](https://laravel.com) integration for the [Generic User Switcher](https://github.com/cdoebler/php-generic-user-switcher) library. It includes a user provider implementation that fetches users from your Laravel database and an impersonator implementation using Laravel's session and authentication system.

## Features

- **Seamless Integration**: Automatically binds `UserProviderInterface` and `ImpersonatorInterface` to Laravel implementations.
- **Configurable**: Easily configure which User model to use.
- **Environment Control**: Restrict user switching to specific environments (e.g., `local`, `staging`) to prevent accidents in production.
- **Session-based Impersonation**: Securely impersonates users by maintaining the original user's ID in the session.

## Installation

Install as a development dependency:

```bash
composer require cdoebler/laravel-user-switcher --dev
```

For staging environments that use production dependencies, install normally:

```bash
composer require cdoebler/laravel-user-switcher
```

The service provider is auto-discovered by Laravel.

## ⚠️ Enable Only in Development

The package is **disabled by default**. Enable it in your development `.env`:

```dotenv
USER_SWITCHER_ENABLED=true
```

## Configuration

### Publish Configuration

Publish the configuration file to `config/user-switcher.php` using the following command:

```bash
php artisan vendor:publish --provider="Cdoebler\LaravelUserSwitcher\Providers\UserSwitcherServiceProvider" --tag="config"
```

### Options

The configuration file allows you to customize the package behavior.

| Option | Description | default |
| :--- | :--- | :--- |
| `user_model` | The Eloquent model class for your users. | `App\Models\User` |
| `enabled` | master switch to enable/disable the functionality. | `env('USER_SWITCHER_ENABLED', false)` |
| `environments` | Comma-separated list of allowed environments. | `env('USER_SWITCHER_ENVIRONMENTS', 'local,testing')` |
| `auto_inject` | Automatically inject the switcher widget into rendered pages. | `env('USER_SWITCHER_AUTO_INJECT', true)` |
| `authorization_callback` | Callback function to determine if user switching is allowed. | `null` |

### Environment Variables

```dotenv
USER_SWITCHER_ENABLED=true
USER_SWITCHER_ENVIRONMENTS="local,testing"
USER_SWITCHER_AUTO_INJECT=true
```

## Usage

This package is intended to be used with the **Generic User Switcher** frontend or logic. Once installed, it handles the backend logic for:

1.  **Retrieving Users**: It uses your configured Eloquent model to list available users for switching.
2.  **Impersonation**: It handles the `loginUsingId` logic and stores the original user in the session to allow switching back.

### Programmatic Usage

If you need to use the interfaces directly in your code, you can inject them:

```php
use Cdoebler\GenericUserSwitcher\Interfaces\UserProviderInterface;
use Cdoebler\GenericUserSwitcher\Interfaces\ImpersonatorInterface;

public function index(UserProviderInterface $userProvider, ImpersonatorInterface $impersonator)
{
    // Get all users
    $users = $userProvider->getUsers();

    // Check if currently impersonating
    if ($impersonator->isImpersonating()) {
        // ...
    }
}
```

## Authorization

By default, user switching is disabled (`enabled` defaults to `false`) and restricted to `local` and `testing` environments. You can customize this using the `enabled` and `environments` config options, or implement custom authorization logic using the `authorization_callback` configuration option.

### Using Authorization Callback

The `authorization_callback` allows you to define custom logic to determine whether user switching should be allowed. This is useful when you want to restrict switching based on user roles, permissions, or other criteria.

#### Example: Only Allow Admins to Switch Users

```php
// config/user-switcher.php

return [
    // ... other config options

    'authorization_callback' => function (\Illuminate\Http\Request $request) {
        // Only allow switching if the authenticated user is an admin
        return $request->user()?->isAdmin() ?? false;
    },
];
```

#### Example: Check User Permission

```php
// config/user-switcher.php

return [
    // ... other config options

    'authorization_callback' => function (\Illuminate\Http\Request $request) {
        // Check if user has the 'switch-users' permission
        return $request->user()?->can('switch-users') ?? false;
    },
];
```

#### Example: Combine Environment and Role Checks

```php
// config/user-switcher.php

return [
    // ... other config options

    'authorization_callback' => function (\Illuminate\Http\Request $request) {
        // Allow in local/staging OR if user is admin in production
        if (app()->environment(['local', 'staging'])) {
            return true;
        }

        return $request->user()?->isAdmin() ?? false;
    },
];
```

#### Example: Use Laravel Gates

```php
// config/user-switcher.php

return [
    // ... other config options

    'authorization_callback' => function (\Illuminate\Http\Request $request) {
        return Gate::allows('switch-users');
    },
];
```

Then define the gate in your `AuthServiceProvider`:

```php
use Illuminate\Support\Facades\Gate;

Gate::define('switch-users', function ($user) {
    return $user->hasRole('admin') || $user->hasRole('developer');
});
```

### How Authorization Works During Impersonation

**Important:** When you're impersonating another user, authorization checks are based on the **original user** (the one who started impersonation), not the currently impersonated user.

This means:
- If an admin (ID: 1) switches to a regular user (ID: 5), the switcher widget remains visible
- The admin can continue switching to other users
- Authorization is always checked against the original admin, not the impersonated user

This prevents the common issue where the switcher disappears after switching to an unauthorized user.

#### Example Scenario

```php
// config/user-switcher.php
'authorization_callback' => function (\Illuminate\Http\Request $request) {
    return $request->user()?->isAdmin() ?? false;
},
```

1. Admin (authorized) logs in → Widget appears ✅
2. Admin switches to Regular User (unauthorized) → Widget **still appears** ✅
3. Admin can switch back or to other users ✅
4. Regular User logs in directly → Widget does **not** appear ✅

### Fallback Behavior

If `authorization_callback` is `null` or not set, the package uses the `enabled` and `environments` config options to determine if user switching is allowed.

## Security

The package includes built-in security measures:

- **Session Fixation Protection**: Regenerates session ID after impersonation actions
- **Input Validation**: Validates user identifiers (trims whitespace, rejects empty/overly long values)

**Recommendations:**
- Restrict to non-production environments using the `environments` config
- Implement authorization checks using the `authorization_callback`
- Consider audit logging for compliance (see base package documentation)

## Testing

```bash
composer test
```

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
