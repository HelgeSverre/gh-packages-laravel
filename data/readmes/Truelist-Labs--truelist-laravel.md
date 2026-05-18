# truelist/laravel

[![Free tier](https://img.shields.io/badge/free_plan-100_validations-4A7C59?style=flat-square)](https://truelist.io/pricing)
Email validation for Laravel, powered by [Truelist.io](https://truelist.io).

[![CI](https://github.com/Truelist-io-Email-Validation/truelist-laravel/actions/workflows/ci.yml/badge.svg)](https://github.com/Truelist-io-Email-Validation/truelist-laravel/actions/workflows/ci.yml)
[![Latest Stable Version](https://poser.pugx.org/truelist/laravel/v/stable)](https://packagist.org/packages/truelist/laravel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Validate email deliverability in your Laravel forms with a single line:

```php
$request->validate([
    'email' => ['required', 'email', new Deliverable],
]);
```

Truelist checks whether an email address actually exists and can receive mail, catching typos, disposable addresses, and invalid mailboxes before they hit your database.

> **Start free** — 100 validations + 10 enhanced credits, no credit card required.
> [Get your API key →](https://app.truelist.io/signup?utm_source=github&utm_medium=readme&utm_campaign=free-plan&utm_content=truelist-laravel)

## Installation

```bash
composer require truelist/laravel
```

The service provider is auto-discovered. To publish the config file:

```bash
php artisan vendor:publish --tag=truelist-config
```

Add your API key to `.env`:

```
TRUELIST_API_KEY=your_api_key_here
```

## Quick Start

```php
use Truelist\Rules\Deliverable;

// In a FormRequest or controller:
$request->validate([
    'email' => ['required', 'email', new Deliverable],
]);
```

That's it. Invalid emails will now fail validation with a clear error message.

## Configuration

Publish the config file to customize settings:

```bash
php artisan vendor:publish --tag=truelist-config
```

This creates `config/truelist.php`:

```php
return [
    // Your Truelist API key (required).
    'api_key' => env('TRUELIST_API_KEY'),

    // API base URL. Change only for testing or proxying.
    'base_url' => env('TRUELIST_BASE_URL', 'https://api.truelist.io'),

    // Request timeout in seconds.
    'timeout' => env('TRUELIST_TIMEOUT', 10),

    // When true, raises exceptions on API failures.
    // When false (default), returns "unknown" on errors (fail open).
    // Note: Auth errors (401) always throw regardless of this setting.
    'raise_on_error' => env('TRUELIST_RAISE_ON_ERROR', false),

    // Cache settings to avoid redundant API calls.
    'cache' => [
        'enabled' => env('TRUELIST_CACHE_ENABLED', false),
        'ttl'     => env('TRUELIST_CACHE_TTL', 3600),
        'prefix'  => 'truelist:',
    ],
];
```

## Validation Rule

### Using the rule object (recommended)

```php
use Truelist\Rules\Deliverable;

$request->validate([
    'email' => ['required', 'email', new Deliverable],
]);
```

### Using the string shorthand

```php
$request->validate([
    'email' => ['required', 'email', 'deliverable'],
]);
```

### Behavior on errors

The validation rule **fails open** by design. If the Truelist API is unreachable (timeout, 500, rate limit), the email passes validation so your forms keep working.

Authentication errors (invalid API key) always throw an exception -- you want to know immediately if your credentials are wrong.

## Using the Client Directly

```php
use Truelist\TruelistClient;

$client = app(TruelistClient::class);
$result = $client->validate('user@example.com');

$result->state;       // "ok", "email_invalid", "accept_all", or "unknown"
$result->subState;    // "email_ok", "is_disposable", "is_role", etc.
$result->isValid();   // true when state is "ok"
$result->isInvalid(); // true when state is "email_invalid"
$result->isAcceptAll(); // true when state is "accept_all"
$result->isUnknown(); // true when state is "unknown"

$result->domain;      // Domain part of the email address
$result->canonical;   // Local part of the email address
$result->mxRecord;    // MX record for the domain, if available
$result->firstName;   // First name, if available
$result->lastName;    // Last name, if available
$result->verifiedAt;  // Timestamp of verification
$result->suggestion;  // Suggested correction, if available

$result->isDisposable(); // true when sub-state is "is_disposable"
$result->isRole();       // true when sub-state is "is_role"
```

## Facade Usage

```php
use Truelist\Facades\Truelist;

$result = Truelist::validate('user@example.com');

if ($result->isValid()) {
    // Good to go
}
```

## States

| State | Meaning |
|-------|---------|
| `ok` | Email is valid and deliverable |
| `email_invalid` | Email is invalid or undeliverable |
| `accept_all` | Domain accepts all emails (risky) |
| `unknown` | Could not determine status |

## Sub-states

| Sub-state | Meaning |
|-----------|---------|
| `email_ok` | Email is valid and deliverable |
| `is_disposable` | Disposable/temporary email |
| `is_role` | Role-based address (info@, admin@) |
| `accept_all` | Domain accepts all emails |
| `failed_mx_check` | Domain has no mail server |
| `failed_spam_trap` | Known spam trap address |
| `failed_no_mailbox` | Mailbox does not exist |
| `failed_greylisted` | Server temporarily rejected (greylisting) |
| `failed_syntax_check` | Email format is invalid |
| `unknown` | Could not determine status |

## Caching

Enable caching to avoid redundant API calls for recently validated emails:

```env
TRUELIST_CACHE_ENABLED=true
TRUELIST_CACHE_TTL=3600
```

Caching uses Laravel's default cache driver. Only successful results are cached -- unknowns and errors are never cached, so a subsequent request can get the real result.

The cache key is based on the lowercase, trimmed email address.

## Error Handling

By default, API errors (timeouts, rate limits, server errors) return an `unknown` result with `isError()` returning `true`. This prevents your forms from breaking when the API is unreachable.

To raise exceptions instead:

```env
TRUELIST_RAISE_ON_ERROR=true
```

Exception classes:

| Exception | Trigger |
|-----------|---------|
| `Truelist\Exceptions\TruelistException` | Base exception class |
| `Truelist\Exceptions\AuthenticationException` | Invalid API key (401) -- **always thrown** |
| `Truelist\Exceptions\RateLimitException` | Rate limit exceeded (429) |
| `Truelist\Exceptions\ApiException` | Other API errors (500, timeouts, etc.) |

## Testing

Mock the HTTP client in your tests to avoid real API calls:

```php
use Illuminate\Support\Facades\Http;

Http::fake([
    'api.truelist.io/*' => Http::response([
        'emails' => [[
            'address' => 'user@example.com',
            'domain' => 'example.com',
            'canonical' => 'user',
            'mx_record' => null,
            'first_name' => null,
            'last_name' => null,
            'email_state' => 'ok',
            'email_sub_state' => 'email_ok',
            'verified_at' => '2026-02-21T10:00:00.000Z',
            'did_you_mean' => null,
        ]],
    ]),
]);
```

Or mock the client directly:

```php
use Truelist\TruelistClient;
use Truelist\ValidationResult;

$this->mock(TruelistClient::class, function ($mock) {
    $mock->shouldReceive('validate')
        ->andReturn(new ValidationResult(
            email: 'user@example.com',
            state: 'ok',
        ));
});
```

## Requirements

- PHP >= 8.1
- Laravel 10, 11, or 12

## Development

```bash
git clone https://github.com/Truelist-io-Email-Validation/truelist-laravel.git
cd truelist-laravel
composer install
vendor/bin/phpunit
```


## Getting Started

Sign up for a [free Truelist account](https://app.truelist.io/signup?utm_source=github&utm_medium=readme&utm_campaign=free-plan&utm_content=truelist-laravel) to get your API key. The free plan includes 100 validations and 10 enhanced credits — no credit card required.
## License

Released under the [MIT License](LICENSE).
