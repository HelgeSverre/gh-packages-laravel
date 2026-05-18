![Screenshot](/art/pl.jpeg)

<p align="center">
   <a href="https://packagist.org/packages/spykapps/passwordless-login">
    <img src="https://img.shields.io/packagist/v/spykapps/passwordless-login.svg?style=for-the-badge" alt="Packagist Version">
   </a>
   <a href="https://packagist.org/packages/spykapps/passwordless-login">
    <img src="https://img.shields.io/packagist/dt/spykapps/passwordless-login.svg?style=for-the-badge" alt="Total Downloads">
   </a>
   <a href="https://laravel.com/docs/13.x"><img src="https://img.shields.io/badge/Laravel-13.x-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel 13"></a>
   <a href="https://php.net"><img src="https://img.shields.io/badge/PHP-8.3-777BB4?style=for-the-badge&logo=php" alt="PHP 8.3"></a>
   <a href="https://github.com/spykapps/passwordless-login/blob/main/LICENSE.md">
     <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License">
   </a>
</p>


# Passwordless Login for Laravel

A highly customizable, multilingual magic link authentication package for Laravel with bot/prefetch detection, rate limiting, conditional auth, and a comprehensive event system.

## Features

- 🔗 **Magic Link Authentication** : Secure, token-based passwordless login
- 🤖 **Bot/Prefetch Detection** : Detects Outlook, Apple Mail, SafeLinks and other prefetch scanners that consume one-time links
- 🌍 **Multilingual** : Full i18n support with publishable language files
- 🔒 **Configurable Token Security** : Token length, hashing algorithm (SHA-256, bcrypt, argon2), IP/UA binding
- 🔄 **Usage Control** : One-time, multi-use, or unlimited use links
- 🚦 **Rate Limiting** : Built-in throttling per user
- 📧 **Built-in Email Notification** : Laravel-style notification (like password reset) with queuing support
- 📋 **Conditional Authentication** : Allow login only when custom conditions are met (e.g. `is_active`, `!is_banned`)
- 🎯 **After Login Actions** : Run custom code after authentication
- 📡 **Comprehensive Events** : 8 events covering the full lifecycle
- ⚙️ **Everything Configurable** : Guard, model, table, routes, expiry, views, redirect, and more
- 🧹 **Auto Cleanup** : Scheduled cleanup of expired tokens

## Requirements

- PHP 8.1+
- Laravel 10, 11, 12, or 13

## Installation

```bash
composer require spykapps/passwordless-login
```

### Publish Config

```bash
php artisan vendor:publish --tag=passwordless-login-config
```

### Publish & Run Migrations

```bash
php artisan vendor:publish --tag=passwordless-login-migrations
php artisan migrate
```

### Publish Everything (optional)

```bash
php artisan vendor:publish --tag=passwordless-login
```

This publishes config, migrations, views, and language files.

---

## Upgrading from a Previous Version

If you already have the package installed and a `passwordless_login_tokens` table in your database, run the upgrade command to apply new schema changes introduced in this version (such as the `failure_url` column):

```bash
php artisan passwordless-login:upgrade
```

The command will:

1. Ask for your tokens table name (defaults to `passwordless_login_tokens`, or whatever is set in your config)
2. Show a disclaimer listing every column it intends to add
3. Ask for confirmation before touching your database
4. Add any missing columns — safely skipping columns that already exist

> The upgrade command is **non-destructive** and **idempotent** — it only adds new nullable columns and is safe to run multiple times.

---

## Quick Start

### 1. Add the Trait to Your User Model

```php
use SpykApp\PasswordlessLogin\Traits\HasMagicLogin;

class User extends Authenticatable
{
    use HasMagicLogin;
}
```

### 2. Send a Magic Link

```php
use SpykApp\PasswordlessLogin\Facades\PasswordlessLogin;

// Simple — generates link and sends email automatically
$user = User::where('email', $request->email)->first();

$result = PasswordlessLogin::forUser($user)->generate($request);
// $result['url']   → the magic link URL
// $result['token'] → the MagicLoginToken model

// Or use the trait
$result = $user->sendMagicLink($request);
```

### 3. That's It!

The package automatically:
- Registers the magic login route
- Handles bot/prefetch detection
- Authenticates the user
- Redirects to your configured URL

## Usage Examples

### Basic Usage

```php
use SpykApp\PasswordlessLogin\Facades\PasswordlessLogin;

// In a controller
public function sendLink(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        // Don't reveal if user exists (security best practice)
        return back()->with('status', __('passwordless-login::messages.link_sent_if_exists'));
    }

    try {
        PasswordlessLogin::forUser($user)->generate($request);
    } catch (\SpykApp\PasswordlessLogin\Exceptions\ThrottleException $e) {
        return back()->with('error', $e->getMessage());
    }

    return back()->with('status', __('passwordless-login::messages.link_sent'));
}
```

### Fluent Builder (Full Customization)

```php
$result = PasswordlessLogin::forUser($user)
    ->guard('admin')                              // Custom guard
    ->redirectTo('/admin/dashboard')              // Custom redirect
    ->expiresIn(60)                               // 60 minutes expiry
    ->maxUses(3)                                  // Usable 3 times
    ->remember()                                  // Remember the session
    ->tokenLength(64)                             // 128-char hex token
    ->withMetadata(['source' => 'api', 'ip' => $request->ip()])
    ->withoutNotification()                       // Don't send email (handle yourself)
    ->generate($request);

// Send the link your own way
Mail::to($user)->send(new MyCustomMail($result['url']));
```

### Using the Trait

```php
$user->sendMagicLink($request, [
    'guard' => 'admin',
    'redirect_url' => '/admin',
    'expiry_minutes' => 30,
    'max_uses' => 1,
    'remember' => true,
    'metadata' => ['reason' => 'password_reset'],
]);
```

### Get URL Without Sending Email

```php
$result = PasswordlessLogin::forUser($user)
    ->withoutNotification()
    ->generate($request);

$magicUrl = $result['url'];
// Use in SMS, WhatsApp, API response, etc.
```

### Possible ways to generate URLs

```php
// 1. Generate + auto-send email (most common)
$result = PasswordlessLogin::forUser($user)->generate($request);

// 2. Same thing via trait (identical to above)
$result = $user->sendMagicLink($request);

// 3. Generate only — NO email sent
$result = PasswordlessLogin::forUser($user)
    ->withoutNotification()
    ->generate($request);

// 4. Same via trait — NO email sent
$result = $user->generateMagicLink($request, [
    'send_notification' => false,
]);

// 5. Generate without email, send your own way
$result = PasswordlessLogin::forUser($user)
    ->withoutNotification()
    ->generate($request);

Mail::to($user)->send(new YourCustomMail($result['url']));
// or SMS, WhatsApp, etc.

// 6. Generate + send with custom notification class
$result = PasswordlessLogin::forUser($user)
    ->useNotification(\App\Notifications\MyMagicLink::class)
    ->generate($request);

// 7. Generate + send with custom mailable class
$result = PasswordlessLogin::forUser($user)
    ->useMailable(\App\Mail\MyMagicLinkMail::class)
    ->generate($request);

// 8. Full fluent example — no email
$result = PasswordlessLogin::forUser($user)
    ->guard('admin')
    ->redirectTo('/admin/dashboard')
    ->expiresIn(60)
    ->maxUses(3)
    ->remember()
    ->tokenLength(64)
    ->withMetadata(['source' => 'api'])
    ->withoutNotification()
    ->generate($request);

$magicUrl = $result['url'];
$tokenModel = $result['token'];
```


## Configuration

All options in `config/passwordless-login.php`:

| Option | Default | Description |
|--------|---------|-------------|
| `user_model` | `App\Models\User` | The authenticatable model |
| `email_column` | `email` | Column used to find users by email |
| `guard` | `null` (default) | Authentication guard |
| `remember` | `false` | Remember me flag |
| `token.length` | `32` | Token byte length (16–128) |
| `token.hash_algorithm` | `sha256` | `sha256`, `bcrypt`, or `argon2` |
| `expiry_minutes` | `15` | Minutes until link expires |
| `max_uses` | `1` | Max times a link can be used (`null` = unlimited) |
| `route.path` | `/magic-login/{token}` | The magic link route path |
| `route.name` | `passwordless.login` | Route name |
| `route.middleware` | `['web', 'guest']` | Route middleware |
| `route.prefix` | `''` | Route prefix |
| `redirect.on_success` | `/dashboard` | Redirect after login |
| `redirect.on_failure` | `/login` | Redirect on failure |
| `throttle.enabled` | `true` | Rate limiting |
| `throttle.max_attempts` | `5` | Max links per decay period |
| `throttle.decay_minutes` | `10` | Rate limit window |
| `bot_detection.enabled` | `true` | Bot/prefetch detection |
| `bot_detection.strategy` | `both` | `confirmation_page`, `javascript`, or `both` |
| `notification.enabled` | `true` | Auto-send email |
| `notification.queue` | `false` | Queue the notification |
| `notification.class` | built-in | Custom notification class |
| `notification.mailable` | `null` | Use a Mailable instead |
| `conditions` | `[]` | Callables/classes that must return true |
| `after_login_action` | `null` | Action to run after login |
| `table` | `passwordless_login_tokens` | Database table name |
| `security.invalidate_previous` | `true` | Invalidate old tokens on new generate |
| `security.invalidate_on_login` | `true` | Invalidate all tokens after login |
| `security.ip_binding` | `false` | Bind link to requester's IP |
| `security.user_agent_binding` | `false` | Bind link to requester's UA |
| `security.audit_log` | `true` | Log all activity |

## Bot/Prefetch Detection

Email clients like **Outlook**, **Apple Mail**, and security scanners like **SafeLinks** and **Barracuda** often visit links before the user clicks them. This can consume one-time magic links.

### How It Works

The package uses a multi-layered detection approach:

1. **User-Agent Detection** — Matches known bot/scanner patterns
2. **HTTP Method Detection** — Bots often use HEAD/OPTIONS requests
3. **Prefetch Header Detection** — Checks `X-Purpose`, `Sec-Purpose`, `Sec-Fetch-Dest` headers
4. **Suspicious Header Analysis** — Flags requests without browser-typical headers

### Strategies

```php
// config/passwordless-login.php
'bot_detection' => [
    'enabled' => true,
    'strategy' => 'both', // Options: 'confirmation_page', 'javascript', 'both'
],
```

- **`confirmation_page`** — Shows a "Click to continue" button (most compatible)
- **`javascript`** — Auto-redirects via JS (bots can't execute JS)
- **`both`** — JS auto-redirect with a button fallback (recommended)

## Conditional Authentication

Restrict who can log in with custom conditions:

```php
// config/passwordless-login.php
'conditions' => [
    // Closures
    fn($user) => $user->is_active,
    fn($user) => !$user->is_banned,
    fn($user) => $user->email_verified_at !== null,

    // Classes implementing LoginCondition
    \App\Auth\CheckSubscription::class,
],
```

### Custom Condition Class

```php
use SpykApp\PasswordlessLogin\Contracts\LoginCondition;
use Illuminate\Contracts\Auth\Authenticatable;

class CheckSubscription implements LoginCondition
{
    public function check(Authenticatable $user): bool
    {
        return $user->hasActiveSubscription();
    }

    public function message(): string
    {
        return 'Your subscription has expired.';
    }
}
```

## After Login Actions

Run custom code after successful authentication:

```php
// config/passwordless-login.php
'after_login_action' => \App\Actions\UpdateLastLogin::class,
```

```php
use SpykApp\PasswordlessLogin\Contracts\AfterLoginAction;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;

class UpdateLastLogin implements AfterLoginAction
{
    public function execute(Authenticatable $user, Request $request): void
    {
        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);
    }
}
```

## Events

| Event | Dispatched When | Payload |
|-------|----------------|---------|
| `MagicLinkGenerated` | Link is created | `$user`, `$token`, `$url`, `$ipAddress` |
| `MagicLinkSent` | Notification/email sent | `$user`, `$channel` |
| `MagicLinkClicked` | Link URL is visited | `$tokenModel`, `$request`, `$isBotDetected` |
| `MagicLinkAuthenticated` | User successfully logged in | `$user`, `$request`, `$guard` |
| `MagicLinkFailed` | Authentication failed | `$reason`, `$request`, `$token`, `$ipAddress` |
| `MagicLinkExpired` | Expired link accessed | `$tokenModel`, `$request` |
| `MagicLinkUsed` | Token use count incremented | `$tokenModel`, `$request` |
| `MagicLinkThrottled` | Rate limit exceeded | `$user`, `$availableInSeconds` |
| `BotDetected` | Bot/prefetch detected | `$request`, `$reason`, `$token` |

### Listening to Events

```php
// EventServiceProvider or listener
use SpykApp\PasswordlessLogin\Events\MagicLinkAuthenticated;
use SpykApp\PasswordlessLogin\Events\MagicLinkFailed;

Event::listen(MagicLinkAuthenticated::class, function ($event) {
    Log::info("User {$event->user->email} logged in via magic link");
});

Event::listen(MagicLinkFailed::class, function ($event) {
    Log::warning("Magic link failed: {$event->reason} from {$event->ipAddress}");
});
```

## Multilingual Support

Publish the language files:

```bash
php artisan vendor:publish --tag=passwordless-login-lang
```

This creates `lang/vendor/passwordless-login/en/messages.php`. Add translations by creating new locale folders (e.g. `es/messages.php`, `fr/messages.php`, `de/messages.php`).

### Example: Spanish Translation

```php
// lang/vendor/passwordless-login/es/messages.php
return [
    'email_subject' => 'Tu enlace de inicio de sesión',
    'email_greeting' => '¡Hola!',
    'email_intro' => 'Recibimos una solicitud de inicio de sesión para tu cuenta.',
    'email_action' => 'Iniciar Sesión',
    'email_expiry_notice' => 'Este enlace expirará en :minutes minutos.',
    'email_outro' => 'Si no solicitaste este enlace, no es necesario realizar ninguna acción.',
    // ... etc
];
```

## Custom Notification / Mailable

### Custom Notification

```php
// config/passwordless-login.php
'notification' => [
    'class' => \App\Notifications\CustomMagicLink::class,
],
```

Your notification receives: `$url`, `$expiryMinutes`, `$metadata`.

### Custom Mailable

```php
// config/passwordless-login.php
'notification' => [
    'mailable' => \App\Mail\CustomMagicLinkMail::class,
],
```

Your mailable receives: `$url`, `$expiryMinutes` in the constructor.

## Custom Views

Publish and customize views:

```bash
php artisan vendor:publish --tag=passwordless-login-views
```

Published to `resources/views/vendor/passwordless-login/`:
- `confirmation.blade.php` — Bot detection confirmation page
- `emails/magic-link.blade.php` — Email template (markdown)

## API / JSON Support

The controller automatically returns JSON when `Accept: application/json` is sent:

**Success:**
```json
{
    "message": "You have been logged in successfully.",
    "redirect": "/dashboard",
    "user": { "id": 1, "name": "..." }
}
```

**Failure:**
```json
{
    "message": "This login link has expired.",
    "error": true
}
```

## Security Best Practices

1. **Don't reveal user existence** — Use `link_sent_if_exists` message
2. **Keep expiry short** — 15 minutes is a good default
3. **Use one-time links** — Set `max_uses` to 1
4. **Enable `invalidate_previous`** — Only the latest link works
5. **Enable `invalidate_on_login`** — All links consumed after login
6. **Consider IP binding** for high-security applications


## Credits

- [Sanchit Patil](https://github.com/sanchitspatil)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
