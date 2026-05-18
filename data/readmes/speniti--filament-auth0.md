# Filament Auth0

This package provides seamless [Auth0](https://auth0.com/) authentication integration
for [Filament](https://filamentphp.com) admin panels. It handles the complete OAuth 2.0/OpenID Connect authentication
flow, including automatic token management, user provisioning, and secure session handling.

![GitHub License](https://img.shields.io/github/license/speniti/filament-auth0?style=flat-square)
![GitHub Release](https://img.shields.io/github/v/release/speniti/filament-auth0?style=flat-square)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/speniti/filament-auth0/ci.yml?style=flat-square)
![Codecov](https://img.shields.io/codecov/c/github/speniti/filament-auth0?style=flat-square)

## ✨ Features

- 🔐 **Complete OAuth 2.0/OpenID Connect Flow** – Secure authentication with PKCE support
- 🔄 **Automatic Token Management** – Refresh access tokens before expiration
- 👤 **User Provisioning** – Automatic user creation/updates from Auth0 profile data
- 🎯 **Flexible Authentication Modes** – Redirect to Auth0 or add a "Sign in with Auth0" button
- 💾 **Multiple Storage Backends** – Cache or database token storage
- 🚀 **High Performance** – Cached JWKS and OpenID discovery metadata
- 🛡️ **JWT Validation** – Verify ID token signatures and claims
- 📡 **Event System** – Listen to authentication events for custom logic
- 🎨 **Customizable UI** - Flexible login button styling and positioning
- 🧪 **Well Tested** – Comprehensive test coverage with Pest

## 📋 Requirements

- PHP 8.4 or higher
- Laravel 11.x or higher
- Filament 5.x or higher
- Auth0 account with a configured application

## 🚀 Installation

You can install the package via Composer:

```bash
composer require speniti/filament-auth0
```

You can publish the config file with:

```bash
php artisan vendor:publish --tag="filament-auth0-config"
```

This is the contents of the published config file:

```php
return [
    /*
    |--------------------------------------------------------------------------
    | Auth0 Domain
    |--------------------------------------------------------------------------
    */
    'domain' => env('AUTH0_DOMAIN'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Client ID
    |--------------------------------------------------------------------------
    */
    'client_id' => env('AUTH0_CLIENT_ID'),

    /*
    |--------------------------------------------------------------------------
    | Auth0 Client Secret
    |--------------------------------------------------------------------------
    */
    'client_secret' => env('AUTH0_CLIENT_SECRET'),

    // ... and many more options
];
```

## ⚙️ Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SCOPES="openid profile offline_access"
```

### User Provider Configuration ⚠️ Required

Configure the Auth0 user provider in your `config/auth.php` file. **This step is required for the package to work
properly:**

```php
'providers' => [
    'users' => [
        'driver' => 'auth0',
        // Your existing user model configuration
    ],
],
```

This tells Laravel to use the Auth0 user provider which handles user provisioning from Auth0 profile data.

### Filament Panel Setup

Register the plugin in your Filament panel provider:

```php
use Peniti\FilamentAuth0\Auth0Plugin;
use Peniti\FilamentAuth0\LoginBehavior;

public function panel(Panel $panel): Panel
{
    return $panel
        // ... other panel configuration
        ->plugin(
            Auth0Plugin::make()
                ->loginBehavior(LoginBehavior::REDIRECT) // or LoginBehavior::BUTTON
        );
}
```

### Login Behavior Options

The package supports two authentication modes:

- **`LoginBehavior::REDIRECT`** - Automatically redirects users to Auth0 when accessing the login page
- **`LoginBehavior::BUTTON`** - Adds a "Sign in with Auth0" button to the default Filament login form

### Token Storage

Choose between cache or database storage for access/refresh tokens:

```env
# Use cache (default - faster)
AUTH0_TOKEN_STORE_DRIVER=cache

# Use database (persistent across cache clears)
AUTH0_TOKEN_STORE_DRIVER=database
```

## 🎯 Usage

### Basic Setup

1. Configure your Auth0 application callback URLs:
    - Allowed Callback URLs: `https://your-app.com/auth0/callback`
    - Allowed Logout URLs: `https://your-app.com`

2. The package handles the complete authentication flow:
    - User clicks "Sign in with Auth0" (or is redirected)
    - Authenticated via Auth0
    - User automatically provisioned in your database
    - Tokens stored and managed automatically

### Accessing Auth0 Tokens

Use the `Auth0Tokens` facade to access stored tokens:

```php
use Peniti\FilamentAuth0\Facades\Auth0Tokens;

// Get access token
$accessToken = Auth0Tokens::getAccessToken();

// Get refresh token
$refreshToken = Auth0Tokens::getRefreshToken();

// Get raw token data
$tokenData = Auth0Tokens::get();
```

### Listening to Events

The package dispatches events you can listen for:

```php
// In a service provider
use Peniti\FilamentAuth0\Events\Auth0Authenticated;
use Peniti\FilamentAuth0\Events\Auth0TokenRefreshed;

Event::listen(Auth0Authenticated::class, function ($event) {
    // $event->token - The decoded ID token
    // $event->user - The authenticated user
    Log::info('User authenticated via Auth0', [
        'user_id' => $event->user->id,
        'sub' => $event->token->getSubject(),
    ]);
});
```

Available events:

- `Auth0Authenticated` - Fired when user successfully authenticates
- `Auth0TokenRefreshed` - Fired when access token is refreshed
- `Auth0AuthenticationFailed` - Fired when authentication fails

### Custom User Provisioning

You can customize how users are created/updated by implementing the `ProvisionsUser` contract:

```php
use Peniti\FilamentAuth0\Contracts\ProvisionsUser;
use Peniti\FilamentAuth0\Jwt\IdToken;

class CustomUserProvisioner implements ProvisionsUser
{
    public function __invoke(IdToken $token): Authenticatable
    {
        // Your custom user provisioning logic
        return User::updateOrCreate(
            ['auth0_id' => $token->getSubject()],
            [
                'name' => $token->getName(),
                'email' => $token->getEmail(),
            ]
        );
    }
}
```

## 🧪 Testing

Run the test suite:

```bash
composer test
```

Run Pint for code style:

```bash
composer lint
```

## 📚 Advanced Configuration

### Token Refresh Buffer

Configure when to refresh access tokens before expiration:

```env
# Refresh token 5 minutes before expiration (default)
AUTH0_TOKEN_REFRESH_BUFFER=5 minutes
```

### Cache Configuration

Control caching for JWKS and OpenID metadata:

```env
# Cache JWKS for 1 day (default)
AUTH0_JWKS_CACHE_TTL=1 day

# Cache metadata for 1 day (default)
AUTH0_METADATA_CACHE_TTL=1 day
```

### HTTP Configuration

Adjust HTTP client settings:

```env
# Request timeout in seconds (default: 30)
AUTH0_HTTP_TIMEOUT=30

# Number of retries (default: 3)
AUTH0_HTTP_RETRY_TIMES=3

# Retry delay in milliseconds (default: 100)
AUTH0_HTTP_RETRY_SLEEP=100
```

### Queue Configuration

Configure queue for token refresh jobs:

```env
# Use specific queue for token refresh
AUTH0_TOKEN_REFRESH_QUEUE=auth0-refresh
```

## 🎨 UI Customization

### Login Button Customization

When using `LoginBehavior::BUTTON`, you can customize the login button appearance and behavior using the available
methods:

```php
use Peniti\FilamentAuth0\Auth0Plugin;
use Peniti\FilamentAuth0\LoginBehavior;

Auth0Plugin::make()
    ->loginBehavior(LoginBehavior::BUTTON)
    ->loginButtonLabel('Sign in with Auth0') // Customize button text
    ->loginButtonTooltip('Use your Auth0 account to sign in') // Add tooltip
    ->showLoginButton(true) // Show/hide the button (default: true)
```

**Available methods:**

- `loginButtonLabel(string $label)` - Set the button label text
- `loginButtonTooltip(string $tooltip)` - Set the button tooltip text
- `showLoginButton(bool $show)` - Control button visibility

### Customizing the Sign-In Button View

You can publish the sign-in button view to customize its appearance:

```bash
php artisan vendor:publish --tag="filament-auth0-views"
```

This will publish the view to `resources/views/vendor/filament-auth0/components/sign-in-button.blade.php`. You can then
modify the blade template to match your design requirements.

## 🤝 Contributing

Contributions are welcome! Please review our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## 📄 License

The MIT License (MIT). Please see [LICENSE.md](LICENSE.md) for more information.

