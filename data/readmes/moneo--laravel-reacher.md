# Laravel Reacher

A comprehensive Laravel package for [check-if-email-exists](https://github.com/reacherhq/check-if-email-exists) (Reacher). Check if an email address exists without sending any email.

This package communicates with the Reacher HTTP backend and provides a clean Laravel-friendly API with Facade support, typed DTOs, validation rules, caching, retry logic, bulk verification, queue support, Artisan commands, event dispatching, and full test coverage.

## Requirements

- PHP 8.1+
- Laravel 10, 11, or 12
- A running [Reacher HTTP backend](https://github.com/reacherhq/check-if-email-exists#1-%EF%B8%8F-http-backend-using-docker-popular-method-)

## Installation

```bash
composer require moneo/laravel-reacher
```

The service provider and facade are auto-discovered. To publish the config file:

```bash
php artisan vendor:publish --tag=reacher-config
```

## Configuration

Add these environment variables to your `.env` file:

```env
# Required
REACHER_BASE_URL=http://localhost:8080

# API version (v1 recommended, v0 deprecated)
REACHER_API_VERSION=v1

# SMTP settings
REACHER_FROM_EMAIL=noreply@yourdomain.com
REACHER_HELLO_NAME=yourdomain.com
REACHER_SMTP_PORT=25
REACHER_CHECK_GRAVATAR=false

# Authentication (optional)
REACHER_HEADER=Authorization
REACHER_SECRET=Bearer your-api-token

# SOCKS5 Proxy (optional)
REACHER_PROXY_HOST=proxy.example.com
REACHER_PROXY_PORT=1080
REACHER_PROXY_USERNAME=user
REACHER_PROXY_PASSWORD=pass

# Timeouts
REACHER_TIMEOUT=60
REACHER_CONNECT_TIMEOUT=10

# Cache (optional)
REACHER_CACHE_ENABLED=false
REACHER_CACHE_TTL=3600
REACHER_CACHE_STORE=redis

# Retry (optional)
REACHER_RETRY_TIMES=3
REACHER_RETRY_SLEEP_MS=1000

# Logging (optional)
REACHER_LOGGING_ENABLED=false
REACHER_LOG_CHANNEL=stack

# Verification method overrides (optional)
REACHER_YAHOO_VERIF_METHOD=Headless
REACHER_HOTMAILB2C_VERIF_METHOD=Smtp
```

## Starting the Reacher Backend

The easiest way to run the Reacher backend is via Docker:

```bash
docker run -p 8080:8080 reacherhq/backend:latest
```

---

## Usage

### Basic Email Check

```php
use Moneo\Reacher\Facades\Reacher;

$result = Reacher::check('someone@gmail.com');

// Reachability status
echo $result->isReachable; // 'safe', 'risky', 'invalid', 'unknown'

// Convenience methods
$result->isSafe();
$result->isRisky();
$result->isInvalid();
$result->isUnknown();
```

### Check with Options

```php
$result = Reacher::check('someone@gmail.com', [
    'from_email' => 'verify@yourdomain.com',
    'hello_name' => 'yourdomain.com',
    'smtp_port' => 587,
    'check_gravatar' => true,
    'smtp_timeout' => ['secs' => 30, 'nanos' => 0],
    'verification_methods' => [
        'yahoo' => 'Headless',
        'hotmailb2c' => 'Smtp',
    ],
    'proxy' => [
        'host' => 'proxy.example.com',
        'port' => 1080,
        'username' => 'user',
        'password' => 'pass',
    ],
]);
```

### Accessing Result Details

```php
$result = Reacher::check('someone@gmail.com');

// Syntax
$result->syntax->isValidSyntax;  // bool
$result->syntax->domain;         // 'gmail.com'
$result->syntax->username;       // 'someone'
$result->syntax->suggestion;     // null or suggested correction

// MX Records
$result->mx->acceptsMail;  // bool
$result->mx->records;      // ['alt1.gmail-smtp-in.l.google.com.', ...]

// SMTP
$result->smtp->canConnectSmtp;  // bool
$result->smtp->isDeliverable;   // bool
$result->smtp->isCatchAll;      // bool
$result->smtp->hasFullInbox;    // bool
$result->smtp->isDisabled;      // bool

// Misc
$result->misc->isDisposable;    // bool
$result->misc->isRoleAccount;   // bool
$result->misc->isB2c;           // bool
$result->misc->gravatarUrl;     // string|null
$result->misc->haveibeenpwned;  // bool|null

// Debug info (when available)
$result->debug?->serverName;              // 'backend-dev'
$result->debug?->durationInSeconds();     // 5.5
$result->debug?->verificationMethod();    // VerificationMethod::Smtp
```

### Convenience Helper Methods

```php
$result = Reacher::check('someone@gmail.com');

$result->isDeliverable();     // Is the email deliverable?
$result->isDisposable();      // Is it a disposable/temporary email?
$result->isRoleAccount();     // Is it a role account (admin@, info@)?
$result->isCatchAll();        // Is it a catch-all address?
$result->hasFullInbox();      // Is the inbox full?
$result->isDisabled();        // Is the mailbox disabled?
$result->hasValidSyntax();    // Is the syntax valid?
$result->domainAcceptsMail(); // Does the domain accept mail?
$result->hasErrors();         // Did any sub-check return an error?
$result->getErrors();         // Get all errors as ['smtp' => ErrorResult, ...]
```

### Quick Check Methods

```php
// One-liner checks (each makes an API call)
Reacher::isDeliverable('someone@gmail.com');  // bool
Reacher::isSafe('someone@gmail.com');         // bool
Reacher::isDisposable('someone@gmail.com');   // bool
Reacher::isRoleAccount('someone@gmail.com');  // bool
Reacher::isCatchAll('someone@gmail.com');     // bool
```

### Bulk Email Check (Sequential)

```php
$results = Reacher::checkMany([
    'user1@gmail.com',
    'user2@yahoo.com',
    'user3@outlook.com',
]);

foreach ($results as $result) {
    echo "{$result->input}: {$result->isReachable}\n";
}
```

### Bulk Verification via API (v1)

For large-scale verification using Reacher's bulk API with RabbitMQ worker queue:

```php
// Create a bulk job
$jobId = Reacher::createBulk([
    'user1@gmail.com',
    'user2@yahoo.com',
    // ... thousands of emails
]);

// With webhook
$jobId = Reacher::createBulk($emails, [
    'webhook' => [
        'on_each_email' => [
            'url' => 'https://yoursite.com/api/reacher-webhook',
            'extra' => ['batch_id' => 'abc123'],
        ],
    ],
]);

// Check job status
$job = Reacher::getBulkStatus($jobId);
echo $job->jobStatus;           // 'Running' or 'Completed'
echo $job->progressPercentage(); // 75.0
echo $job->totalProcessed;       // 750
echo $job->summary->totalSafe;   // 500

// Get results (paginated)
$results = Reacher::getBulkResults($jobId, limit: 50, offset: 0);

foreach ($results->results as $result) {
    echo "{$result->input}: {$result->isReachable}\n";
}

// Filter results
$safeEmails = $results->safe();
$invalidEmails = $results->invalid();
```

### Backend Health Check

```php
// Get backend version
$version = Reacher::version(); // '0.11.0'

// Check if backend is healthy
if (Reacher::isHealthy()) {
    echo 'Reacher is running';
}
```

### Using the Reachability Enum

```php
use Moneo\Reacher\Enums\Reachability;

$result = Reacher::check('someone@gmail.com');

match ($result->reachability()) {
    Reachability::Safe    => 'Email is safe to send to',
    Reachability::Risky   => 'Email might bounce',
    Reachability::Invalid => 'Email does not exist',
    Reachability::Unknown => 'Could not determine',
};
```

### API Version Control

```php
// Default uses v1 (recommended)
$result = Reacher::check('test@example.com');

// Switch to v0 (deprecated, bypasses throttle)
Reacher::setApiVersion('v0');
$result = Reacher::check('test@example.com');
```

---

## Caching

Enable caching to avoid redundant API calls for the same email:

```env
REACHER_CACHE_ENABLED=true
REACHER_CACHE_TTL=3600
REACHER_CACHE_STORE=redis
```

```php
// First call hits API, stores in cache
$result = Reacher::check('someone@gmail.com');

// Second call returns from cache
$result = Reacher::check('someone@gmail.com');

// Bypass cache for a single call
$result = Reacher::withoutCache()->check('someone@gmail.com');

// Remove a specific email from cache
Reacher::forget('someone@gmail.com');
```

Note: Cache is only used for calls without custom options to ensure consistency.

---

## Retry & Backoff

Automatic retry with exponential backoff for transient errors:

```env
REACHER_RETRY_TIMES=3
REACHER_RETRY_SLEEP_MS=1000
```

```php
// config/reacher.php
'retry' => [
    'times' => 3,              // Max retry attempts
    'sleep_ms' => 1000,        // Initial wait (1 second)
    'backoff_multiplier' => 2, // Exponential: 1s, 2s, 4s
    'retry_on' => [429, 500, 502, 503, 504],
],
```

Rate limit (429) responses are automatically retried. The package parses the retry-after duration from Reacher's error message.

---

## Queue / Jobs

Dispatch email checks to the background queue:

```php
// Single email check (dispatched to queue)
Reacher::dispatchCheck('someone@gmail.com');

// With options and custom queue
Reacher::dispatchCheck('someone@gmail.com', ['smtp_port' => 587], queue: 'email-verification');

// Bulk check via queue
Reacher::dispatchBulkCheck([
    'user1@gmail.com',
    'user2@yahoo.com',
], queue: 'email-verification');
```

When a queued check completes, an `EmailChecked` event is automatically dispatched.

---

## Events

The package dispatches Laravel events:

| Event | When |
|---|---|
| `EmailChecked` | After each email verification completes |
| `BulkJobStarted` | After a bulk job is created via API |
| `BulkJobCompleted` | After a bulk job finishes |

```php
use Moneo\Reacher\Events\EmailChecked;
use Moneo\Reacher\Events\BulkJobStarted;

// In EventServiceProvider or listener
class LogVerification
{
    public function handle(EmailChecked $event): void
    {
        logger()->info('Email checked', [
            'email' => $event->email,
            'reachable' => $event->result->isReachable,
        ]);
    }
}
```

---

## Validation Rule

The package includes a Laravel validation rule:

```php
use Moneo\Reacher\Rules\ReachableEmail;
use Moneo\Reacher\Enums\Reachability;

// Basic: only accept 'safe' emails, reject disposable
$request->validate([
    'email' => ['required', 'email', new ReachableEmail],
]);

// Accept both 'safe' and 'risky' emails
$request->validate([
    'email' => ['required', 'email', new ReachableEmail(
        acceptedLevels: [Reachability::Safe, Reachability::Risky],
    )],
]);

// Allow disposable, reject role accounts
$request->validate([
    'email' => ['required', 'email', new ReachableEmail(
        rejectDisposable: false,
        rejectRoleAccounts: true,
    )],
]);
```

---

## Artisan Commands

```bash
# Check a single email
php artisan reacher:check someone@gmail.com
php artisan reacher:check someone@gmail.com --json
php artisan reacher:check someone@gmail.com --smtp-port=587 --gravatar

# Bulk check from file (one email per line)
php artisan reacher:bulk emails.txt
php artisan reacher:bulk emails.txt --json
php artisan reacher:bulk emails.txt --api-bulk --webhook=https://yoursite.com/hook

# Health check
php artisan reacher:health
```

---

## Error Handling

```php
use Moneo\Reacher\Exceptions\ReacherApiException;
use Moneo\Reacher\Exceptions\ReacherException;
use Moneo\Reacher\Exceptions\RateLimitException;
use Moneo\Reacher\Exceptions\AuthenticationException;
use Moneo\Reacher\Exceptions\InvalidEmailException;

try {
    $result = Reacher::check('someone@gmail.com');
} catch (InvalidEmailException $e) {
    // Email format is invalid (before API call)
} catch (AuthenticationException $e) {
    // 401/403 - Check your API credentials
} catch (RateLimitException $e) {
    // 429 - Rate limited
    $e->getRetryAfterSeconds(); // Seconds to wait
} catch (ReacherApiException $e) {
    // Other API errors (5xx, connection issues)
    $e->getCode();          // HTTP status code
    $e->getResponseBody();  // Response body array
} catch (ReacherException $e) {
    // General error (JSON decode failure, etc.)
}
```

### Handling Sub-Result Errors

The Reacher API can return errors for individual sections (mx, smtp, misc):

```php
$result = Reacher::check('someone@example.com');

if ($result->hasErrors()) {
    foreach ($result->getErrors() as $section => $error) {
        echo "[{$section}] {$error->type}: {$error->message}\n";
        // e.g. [smtp] SmtpError: Connection timed out
    }
}

// Check specific sections
if ($result->smtp->hasError()) {
    echo $result->smtp->error->message;
}
```

---

## Logging

Enable logging to track API calls:

```env
REACHER_LOGGING_ENABLED=true
REACHER_LOG_CHANNEL=stack
```

Logs include: request details, response reachability status, duration, retries, and errors.

---

## Dependency Injection

You can use dependency injection instead of the Facade:

```php
use Moneo\Reacher\Reacher;

class EmailVerificationController extends Controller
{
    public function __construct(
        private Reacher $reacher,
    ) {}

    public function verify(Request $request)
    {
        $result = $this->reacher->check($request->email);

        return response()->json([
            'reachable' => $result->isReachable,
            'deliverable' => $result->isDeliverable(),
            'disposable' => $result->isDisposable(),
        ]);
    }
}
```

---

## Full API Reference

### Facade Methods

| Method | Return | Description |
|---|---|---|
| `check($email, $options)` | `EmailCheckResult` | Verify a single email |
| `checkMany($emails, $options)` | `EmailCheckResult[]` | Verify multiple emails sequentially |
| `isDeliverable($email)` | `bool` | Quick deliverability check |
| `isSafe($email)` | `bool` | Quick safety check |
| `isDisposable($email)` | `bool` | Quick disposable check |
| `isRoleAccount($email)` | `bool` | Quick role account check |
| `isCatchAll($email)` | `bool` | Quick catch-all check |
| `createBulk($emails, $options)` | `int` | Create bulk verification job |
| `getBulkStatus($jobId)` | `BulkJob` | Get bulk job status |
| `getBulkResults($jobId, $limit, $offset)` | `BulkResults` | Get bulk job results |
| `version()` | `string` | Get backend version |
| `isHealthy()` | `bool` | Check backend health |
| `dispatchCheck($email, $options, $queue)` | `PendingDispatch` | Queue a single check |
| `dispatchBulkCheck($emails, $options, $queue)` | `PendingDispatch` | Queue a bulk check |
| `withoutCache()` | `Reacher` | Bypass cache for next call |
| `forget($email)` | `bool` | Remove email from cache |
| `getApiVersion()` | `string` | Get current API version |
| `setApiVersion($version)` | `Reacher` | Set API version (v0/v1) |

### Data Classes

| Class | Properties |
|---|---|
| `EmailCheckResult` | `input`, `isReachable`, `syntax`, `mx`, `smtp`, `misc`, `debug` |
| `SyntaxResult` | `domain`, `isValidSyntax`, `username`, `suggestion` |
| `MxResult` | `acceptsMail`, `records`, `error` |
| `SmtpResult` | `canConnectSmtp`, `hasFullInbox`, `isCatchAll`, `isDeliverable`, `isDisabled`, `error` |
| `MiscResult` | `isDisposable`, `isRoleAccount`, `isB2c`, `gravatarUrl`, `haveibeenpwned`, `error` |
| `DebugResult` | `startTime`, `endTime`, `duration`, `serverName`, `verifMethodType` |
| `BulkJob` | `jobId`, `createdAt`, `finishedAt`, `totalRecords`, `totalProcessed`, `summary`, `jobStatus` |
| `BulkSummary` | `totalSafe`, `totalRisky`, `totalInvalid`, `totalUnknown` |
| `BulkResults` | `results` |
| `ErrorResult` | `type`, `message` |

### Enums

| Enum | Values |
|---|---|
| `Reachability` | `Safe`, `Risky`, `Invalid`, `Unknown` |
| `VerificationMethod` | `Smtp`, `Headless`, `Api`, `Skipped` |
| `JobStatus` | `Running`, `Completed` |

---

## Testing

```bash
composer test
```

## License

MIT License. See [LICENSE](LICENSE) for more information.
