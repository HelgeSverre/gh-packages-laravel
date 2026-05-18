# Laravel Email Verifier

[![Tests](https://img.shields.io/badge/tests-125%20passing-brightgreen)](.)
[![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen)](.)
[![Type Coverage](https://img.shields.io/badge/type--coverage-100%25-brightgreen)](.)
[![PHPStan](https://img.shields.io/badge/phpstan-level%209-brightgreen)](.)
[![GitHub Actions](https://github.com/willvincent/laravel-email-verifier/actions/workflows/tests.yml/badge.svg)](https://github.com/willvincent/laravel-email-verifier/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/willvincent/laravel-email-verifier/branch/master/graph/badge.svg?token=J5FKNPT2EM)](https://codecov.io/gh/willvincent/laravel-email-verifier)

A comprehensive email verification package for Laravel 11/12 that validates email addresses through multiple layers of checks including format validation, domain sanity, MX records, disposable domain detection, and optional integration with external email verification providers.

## Features

- **Multi-layered Validation**: Format, domain sanity, MX records, disposable domains, role-based addresses, plus addressing
- **Score-based System**: Each email receives a quality score (0-100) based on multiple checks
- **External Provider Support**: Optional integration with 8 major email verification APIs
  - <a href="https://abstractapi.com" target="_blank" rel="noopener">Abstract API</a>
  - <a href="https://usebouncer.com" target="_blank" rel="noopener">Bouncer</a>
  - <a href="https://emailable.com" target="_blank" rel="noopener">Emailable</a>
  - <a href="https://kickbox.io" target="_blank" rel="noopener">Kickbox</a>
  - <a href="https://neverbounce.com" target="_blank" rel="noopener">NeverBounce</a>
  - <a href="https://quickemailverification.com" target="_blank" rel="noopener">QuickEmailVerification</a>
  - <a href="https://verified.email" target="_blank" rel="noopener">VerifiedEmail</a>
  - <a href="https://zerobounce.com" target="_blank" rel="noopener">ZeroBounce</a>
- **Fail-Open Design**: External provider failures don't block email validation
- **Configurable Rules**: Enable/disable specific validation rules
- **Laravel Validation Integration**: Use as custom validation rule or extension
- **Artisan Command**: Fetch and update disposable domain lists
- **Fully Typed**: 100% type coverage with strict types
- **Well Tested**: 98.8% test coverage with 125 passing tests

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x

## Installation

```bash
composer require willvincent/laravel-email-verifier
```

### Publish Configuration

```bash
php artisan vendor:publish --tag=email-verifier-config
```

### Publish Translations (Optional)

```bash
php artisan vendor:publish --tag=email-verifier-lang
```

## Configuration

The package comes with sensible defaults. Key configuration options in `config/email-verifier.php`:

```php
return [
    // Minimum acceptable score (0-100)
    'min_score' => env('EMAIL_VERIFIER_MIN_SCORE', 70),

    // Require MX records (strict mode)
    'mx_strict' => env('EMAIL_VERIFIER_MX_STRICT', true),

    // Normalization settings
    'normalize' => [
        'enabled' => true,
        'lowercase_local' => false,  // Most providers are case-sensitive
    ],

    // Disposable domain detection
    'disposable' => [
        'file' => storage_path('app/disposable_email_domains.txt'),
        'source_url' => 'https://raw.githubusercontent.com/disposable/disposable-email-domains/master/domains.txt',
        'extra_domains' => [],
        'timeout_seconds' => 10,
        'max_bytes' => 2_000_000,
    ],

    // External verification provider
    'external' => [
        'driver' => env('EMAIL_VERIFIER_EXTERNAL_DRIVER'), // abstract, bouncer, emailable, kickbox, neverbounce, quickemailverification, verifiedemail, zerobounce
        'timeout_seconds' => 5,

        'bouncer' => [
            'api_key' => env('BOUNCER_API_KEY'),
            'endpoint' => 'https://api.usebouncer.com/v1.1/email/verify',
        ],

        // ... other providers
    ],
];
```

## Usage

### Basic Usage

```php
use WillVincent\EmailVerifier\Facades\EmailVerifier;

$result = EmailVerifier::verify('user@example.com');

if ($result->accepted) {
    echo "Email is valid! Score: {$result->score}";
} else {
    echo "Email rejected: " . implode(', ', $result->reasons);
}
```

### As Validation Rule (Object Style)

```php
use WillVincent\EmailVerifier\Validation\VerifiedEmail;

$request->validate([
    'email' => ['required', new VerifiedEmail()],
]);

// With custom minimum score
$request->validate([
    'email' => ['required', new VerifiedEmail(minScore: 90)],
]);

// Disable external verification for this validation
$request->validate([
    'email' => ['required', new VerifiedEmail(allowExternal: false)],
]);
```

### As Validation Rule (String Style)

```php
$request->validate([
    'email' => 'required|verified_email',
]);

// With minimum score
$request->validate([
    'email' => 'required|verified_email:90',
]);

// With minimum score and no external verification
$request->validate([
    'email' => 'required|verified_email:90,no_external',
]);
```

### Understanding Results

```php
$result = EmailVerifier::verify('info@example.com');

// Core properties
$result->accepted;         // bool: Overall pass/fail
$result->score;           // int: Quality score (0-100)
$result->normalizedEmail; // string: Normalized email address
$result->reasons;         // array: Reasons for score reduction/rejection
$result->meta;           // array: Additional metadata

// Common reasons
// - invalid_format
// - invalid_domain
// - no_mx_records
// - disposable_domain
// - role_based_local_part (info@, admin@, etc.)
// - plus_addressing (user+tag@)
// - external_rejected:*
```

### Scoring System

- **100**: Perfect email (valid format, good domain, MX records exist)
- **95**: Plus addressing detected (user+tag@domain.com)
- **85**: Role-based address (info@, admin@, support@)
- **85**: Catch-all domain (external provider detected)
- **80**: Unknown status from external provider
- **75**: Risky (external provider flagged)
- **0**: Hard rejection (invalid format, disposable, no MX in strict mode)

## External Providers

### Setup Example (Kickbox)

1. Sign up at [Kickbox](https://kickbox.com)
2. Add to `.env`:
```env
EMAIL_VERIFIER_EXTERNAL_DRIVER=kickbox
KICKBOX_API_KEY=your_api_key_here
```

3. The package will automatically use Kickbox for additional verification

### Supported Providers

All providers follow the same pattern:

```env
# Abstract
EMAIL_VERIFIER_EXTERNAL_DRIVER=abstract
ABSTRACT_API_KEY=your_key

# Bouncer
EMAIL_VERIFIER_EXTERNAL_DRIVER=bouncer
BOUNCER_API_KEY=your_key

# Emailable
EMAIL_VERIFIER_EXTERNAL_DRIVER=emailable
EMAILABLE_API_KEY=your_key

# Kickbox
EMAIL_VERIFIER_EXTERNAL_DRIVER=kickbox
KICKBOX_API_KEY=your_key

# NeverBounce
EMAIL_VERIFIER_EXTERNAL_DRIVER=neverbounce
NEVERBOUNCE_API_KEY=your_key

# QuickEmailVerification
EMAIL_VERIFIER_EXTERNAL_DRIVER=quickemailverification
QUICKEMAILVERIFICATION_API_KEY=your_key

# VerifiedEmail
EMAIL_VERIFIER_EXTERNAL_DRIVER=verifiedemail
VERIFIEDEMAIL_API_KEY=your_key

# ZeroBounce
EMAIL_VERIFIER_EXTERNAL_DRIVER=zerobounce
ZEROBOUNCE_API_KEY=your_key
```

### Creating a Custom Provider

You can create your own external verification driver by implementing the `ExternalEmailVerifier` interface:

```php
namespace App\EmailVerification;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Http\Client\Factory as HttpFactory;
use WillVincent\EmailVerifier\Contracts\ExternalEmailVerifier;
use WillVincent\EmailVerifier\Results\EmailVerificationResult;

class CustomEmailVerifier implements ExternalEmailVerifier
{
    public function __construct(
        private HttpFactory $http,
        private ConfigRepository $config,
    ) {}

    public function verify(string $email): EmailVerificationResult
    {
        $apiKey = $this->config->get('email-verifier.external.custom.api_key', '');
        $endpoint = $this->config->get('email-verifier.external.custom.endpoint', '');
        $timeout = $this->config->get('email-verifier.external.timeout_seconds', 5);

        // Return accepted with reduced score if not configured
        if ($apiKey === '' || $endpoint === '') {
            return new EmailVerificationResult(
                accepted: true,
                score: 100,
                normalizedEmail: $email,
                reasons: [],
                meta: ['provider' => 'custom', 'configured' => false],
            );
        }

        try {
            $response = $this->http
                ->timeout($timeout)
                ->retry(1, 250)
                ->post($endpoint, [
                    'email' => $email,
                    'api_key' => $apiKey,
                ]);

            if (!$response->ok()) {
                // Fail-open: accept with reduced score
                return new EmailVerificationResult(
                    accepted: true,
                    score: 90,
                    normalizedEmail: $email,
                    reasons: ['external_provider_unavailable'],
                    meta: ['provider' => 'custom', 'http_status' => $response->status()],
                );
            }

            $data = $response->json() ?? [];
            $status = $data['status'] ?? 'unknown';

            // Map provider status to scores
            return match ($status) {
                'valid' => new EmailVerificationResult(
                    accepted: true,
                    score: 100,
                    normalizedEmail: $email,
                    meta: ['provider' => 'custom', 'status' => $status],
                ),
                'invalid' => new EmailVerificationResult(
                    accepted: false,
                    score: 0,
                    normalizedEmail: $email,
                    reasons: ['external_rejected:invalid'],
                    meta: ['provider' => 'custom', 'status' => $status],
                ),
                'risky' => new EmailVerificationResult(
                    accepted: true,
                    score: 75,
                    normalizedEmail: $email,
                    reasons: ['external_risky'],
                    meta: ['provider' => 'custom', 'status' => $status],
                ),
                default => new EmailVerificationResult(
                    accepted: true,
                    score: 80,
                    normalizedEmail: $email,
                    reasons: ['external_unknown'],
                    meta: ['provider' => 'custom', 'status' => $status],
                ),
            };
        } catch (\Throwable $e) {
            // Fail-open on exceptions
            return new EmailVerificationResult(
                accepted: true,
                score: 90,
                normalizedEmail: $email,
                reasons: ['external_exception'],
                meta: ['provider' => 'custom', 'error' => $e->getMessage()],
            );
        }
    }
}
```

Register your custom driver in a service provider:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use WillVincent\EmailVerifier\External\ExternalEmailVerifierManager;
use App\EmailVerification\CustomEmailVerifier;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->extend(ExternalEmailVerifierManager::class, function ($manager, $app) {
            $manager->extend('custom', function () use ($app) {
                return $app->make(CustomEmailVerifier::class);
            });

            return $manager;
        });
    }
}
```

Configure in `config/email-verifier.php`:

```php
'external' => [
    'driver' => env('EMAIL_VERIFIER_EXTERNAL_DRIVER'), // 'custom'

    'custom' => [
        'api_key' => env('CUSTOM_API_KEY'),
        'endpoint' => env('CUSTOM_ENDPOINT', 'https://api.example.com/verify'),
    ],
],
```

Then set in `.env`:

```env
EMAIL_VERIFIER_EXTERNAL_DRIVER=custom
CUSTOM_API_KEY=your_api_key
CUSTOM_ENDPOINT=https://api.example.com/verify
```

**Best Practices for Custom Drivers:**

- **Fail-Open Design**: Always return `accepted: true` on errors/timeouts with a reduced score (80-90)
- **Scoring**: Use 100 for valid, 75 for risky, 80 for unknown, 0 for hard rejections
- **Meta Data**: Include provider name, status, and raw response for debugging
- **Timeouts**: Respect the `email-verifier.external.timeout_seconds` config
- **Retries**: Use `retry(1, 250)` for transient failures
- **Configuration**: Check if API key/endpoint are configured before making requests

### Provider Behavior

- External providers are **optional** and only called after local checks pass
- Failures are **fail-open** (provider unavailable = accept with lower score)
- Results are merged with local validation scores
- Custom endpoints can be configured for all providers

## Disposable Domain Detection

### Update Disposable Domains List

```bash
php artisan email-verifier:fetch-disposable-domains
```

Options:
```bash
# Custom source URL
php artisan email-verifier:fetch-disposable-domains --url=https://example.com/domains.txt

# Custom output path
php artisan email-verifier:fetch-disposable-domains --path=/custom/path.txt

# Force update even if unchanged
php artisan email-verifier:fetch-disposable-domains --force
```

### Add Custom Disposable Domains

In `config/email-verifier.php`:

```php
'disposable' => [
    'extra_domains' => [
        'tempmail.com',
        'throwaway.email',
    ],
],
```

## Advanced Usage

### Dependency Injection

```php
use WillVincent\EmailVerifier\Contracts\EmailVerifierContract;

class UserController extends Controller
{
    public function __construct(
        private EmailVerifierContract $verifier
    ) {}

    public function store(Request $request)
    {
        $result = $this->verifier->verify($request->email);

        if ($result->score < 90) {
            return back()->withErrors([
                'email' => 'Please provide a high-quality email address.'
            ]);
        }

        // Proceed with user registration
    }
}
```

### Custom Validation Messages

In `resources/lang/en/validation.php`:

```php
'custom' => [
    'email' => [
        'verified_email' => 'The :attribute address appears to be invalid or temporary.',
    ],
],
```

Or publish and edit the package translations:

```bash
php artisan vendor:publish --tag=email-verifier-lang
```

## Testing

```bash
# Run tests
composer test

# Run tests with coverage
composer test-coverage

# Type coverage
composer type-coverage

# Static analysis
composer phpstan

# Code style check
composer pint-test
```

## Architecture

### Validation Flow

1. **Format Check**: RFC 5322 validation
2. **Domain Sanity**: Check for valid TLD, no leading/trailing dots
3. **Normalization**: Lowercase domain, optionally lowercase local part
4. **MX Records**: Verify domain has mail servers
5. **Disposable Detection**: Check against known disposable domains
6. **Role-Based Detection**: Flag generic addresses (admin@, info@)
7. **Plus Addressing**: Detect and flag plus addressing
8. **Score Check**: Reject if score below threshold
9. **External Verification** (optional): Verify with third-party API
10. **Final Score Check**: Apply threshold after external verification

### Chain of Responsibility Pattern

Each validation rule is independent and can modify the result:

```php
interface Rule
{
    public function apply(
        VerificationContext $ctx,
        EmailVerificationResult $result
    ): void;
}
```

Rules can:
- Reject the email (`$result->accepted = false`)
- Reduce the score (`$result->score -= 15`)
- Add reasons (`$result->addReason('...')`)
- Add metadata (`$result->meta['key'] = 'value'`)

## Performance

### Latency Characteristics

- **Local checks**: < 1ms (format, domain, disposable)
- **MX lookup**: 10-50ms (DNS query)
- **External provider**: 100-500ms (HTTP request)
- **Total (with external)**: ~150-600ms per email

### Performance Recommendations

#### 1. Use Queue-Based Verification for User Registration

For the best user experience during registration, validate emails asynchronously:

```php
use Illuminate\Support\Facades\Queue;
use WillVincent\EmailVerifier\Facades\EmailVerifier;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        // Quick validation without external provider (< 50ms)
        $request->validate([
            'email' => ['required', 'email', new VerifiedEmail(allowExternal: false)],
        ]);

        // Create user with pending status
        $user = User::create([
            'email' => $request->email,
            'email_verified_at' => null,
        ]);

        // Run full verification in background
        Queue::push(new VerifyUserEmailJob($user));

        return redirect()->route('verify-email-notice');
    }
}
```

Job implementation:

```php
namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use WillVincent\EmailVerifier\Facades\EmailVerifier;

class VerifyUserEmailJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $user
    ) {}

    public function handle(): void
    {
        // Full verification with external provider
        $result = EmailVerifier::verify($this->user->email);

        if ($result->accepted && $result->score >= 80) {
            // Email looks good - allow user to proceed
            $this->user->update([
                'email_verification_score' => $result->score,
            ]);
        } else {
            // Email suspicious - require additional verification
            $this->user->update([
                'email_verification_score' => $result->score,
                'requires_manual_review' => true,
            ]);

            // Optionally notify admins
        }
    }
}
```

#### 2. Disable External Verification in Synchronous Validation

For form requests that need immediate responses, disable external verification:

```php
// Fast validation (< 50ms) - perfect for forms
$request->validate([
    'email' => ['required', new VerifiedEmail(allowExternal: false)],
]);

// Or using string syntax
$request->validate([
    'email' => 'required|verified_email:70,no_external',
]);
```

#### 3. Use External Verification Selectively

Only enable external verification when email quality is critical:

```php
class NewsletterSubscriptionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            // Fast validation for most users
            'email' => ['required', new VerifiedEmail(allowExternal: false)],
        ];
    }
}

// Then verify in background if needed
dispatch(new VerifySubscriberEmailJob($subscriber));
```

#### 4. Cache Verification Results

For repeated verification of the same email:

```php
use Illuminate\Support\Facades\Cache;

public function verifyEmail(string $email): EmailVerificationResult
{
    return Cache::remember(
        "email_verification:{$email}",
        now()->addHours(24),
        fn () => EmailVerifier::verify($email)
    );
}
```

#### 5. Batch Verification

For bulk operations, process in chunks:

```php
use Illuminate\Support\Collection;

Collection::chunk($emails, 100)->each(function ($chunk) {
    dispatch(new BulkVerifyEmailsJob($chunk));
});
```

### Performance Impact Summary

| Approach | Latency | External Check | Best For |
|----------|---------|----------------|----------|
| Sync with external | 150-600ms | ✅ Yes | Background jobs, API endpoints with async processing |
| Sync without external | 10-50ms | ❌ No | Form validation, immediate feedback |
| Queue-based | < 1ms (response) | ✅ Yes (async) | User registration, newsletter signups |
| Cached results | < 1ms | ➖ First call only | Repeated checks, bulk operations |

**Recommendation**: For user-facing forms, use `allowExternal: false` during validation and run full verification with external providers in a background queue. This provides instant feedback while still maintaining high email quality standards.

## Security

- **No Data Leakage**: Validation messages are generic by default
- **Fail-Open**: External provider failures don't block legitimate users
- **Rate Limiting**: Recommended for public endpoints
- **Input Validation**: All inputs are validated and sanitized

## License

MIT License. See [LICENSE.md](LICENSE.md) for details.

## Credits

Created by [Will Vincent](https://github.com/willvincent)

## Support

- **Issues**: [GitHub Issues](https://github.com/willvincent/laravel-email-verifier/issues)
- **Security**: Please report security vulnerabilities privately

## Contributing

Contributions are welcome! Please ensure:
- All tests pass (`composer test`)
- Type coverage remains 100% (`composer type-coverage`)
- PHPStan level 9 passes (`composer phpstan`)
- Code style follows Pint (`composer pint-test`)
