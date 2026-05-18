# Laravel RuntimeGuard

![Packagist](https://img.shields.io/packagist/v/m9nx/laravel-runtime-guard)
![Downloads](https://img.shields.io/packagist/dt/m9nx/laravel-runtime-guard)
![License](https://img.shields.io/github/license/M9nx/laravel-runtime-guard)

**Enterprise-grade runtime security inspection for Laravel applications.**

RuntimeGuard provides a comprehensive, extensible framework for runtime security monitoring. Unlike static analyzers, it inspects actual data flowing through your application in real-time, detecting threats before they can cause damage.

---

## Table of Contents

- [Laravel RuntimeGuard](#laravel-runtimeguard)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Security Guards](#security-guards)
    - [Performance](#performance)
    - [Enterprise Features](#enterprise-features)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
    - [Basic Usage](#basic-usage)
    - [Controller Trait](#controller-trait)
    - [PHP Attributes](#php-attributes)
  - [Configuration](#configuration)
  - [Security Guards](#security-guards-1)
  - [Middleware Usage](#middleware-usage)
  - [Artisan Commands](#artisan-commands)
  - [Testing](#testing)
  - [Documentation](#documentation)
  - [Contributing](#contributing)
  - [Security](#security)
  - [Credits](#credits)
  - [License](#license)

---

## Features

### Security Guards
- **SQL Injection** — UNION attacks, boolean-based, time-based, stacked queries
- **XSS Detection** — Script tags, event handlers, DOM-based XSS, encoded payloads
- **Command Injection** — Shell metacharacters, command chaining, path traversal
- **SSRF Protection** — Internal IPs, cloud metadata endpoints, DNS rebinding
- **NoSQL Injection** — MongoDB operators, JSON-encoded attacks
- **Mass Assignment** — Dangerous field protection
- **GraphQL Security** — Query depth limits, complexity analysis
- **JWT/Token Abuse** — Algorithm confusion, replay attacks, JKU injection
- **Bot Detection** — Behavioral analysis, honeypot integration
- **Session Integrity** — Fingerprint drift, geolocation jumps

### Performance
- Tiered inspection (quick scan + deep analysis)
- LRU deduplication cache
- Request sampling
- Bloom filter pre-screening
- Lazy guard resolution
- Streaming inspection for large payloads
- Async guard execution with PHP Fibers

### Enterprise Features
- ML-powered anomaly detection
- Multi-tenant security isolation
- Real-time metrics (Prometheus-compatible)
- SIEM integration (Splunk, ELK, Datadog)
- WAF rule export (AWS WAF, Cloudflare, ModSecurity)
- Threat intelligence feeds
- Compliance reporting (PCI-DSS, OWASP Top 10)

---

## Requirements

- PHP 8.1+
- Laravel 10.0+ or 11.0+

---

## Installation

```bash
composer require m9nx/laravel-runtime-guard
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=runtime-guard-config
```

For database reporting (optional):

```bash
php artisan vendor:publish --tag=runtime-guard-migrations
php artisan migrate
```

---

## Quick Start

### Basic Usage

```php
use M9nx\RuntimeGuard\Facades\RuntimeGuard;

// Inspect input with all enabled guards
$results = RuntimeGuard::inspect($userInput);

// Check if threat was detected
if ($results->hasThreat()) {
    Log::warning('Threat detected', [
        'level' => $results->getHighestThreatLevel()->value,
        'guards' => $results->getTriggeredGuards(),
    ]);
}

// Inspect with a specific guard
$result = RuntimeGuard::inspectWith('sql-injection', $userInput);
```

### Controller Trait

```php
use M9nx\RuntimeGuard\Traits\InspectsInput;

class FormController extends Controller
{
    use InspectsInput;

    public function submit(Request $request)
    {
        $this->inspectRequest($request);
        
        // Or inspect specific fields only
        $this->inspectRequestFields(['name', 'email', 'message']);
    }
}
```

### PHP Attributes

```php
use M9nx\RuntimeGuard\Attributes\GuardProfile;
use M9nx\RuntimeGuard\Attributes\SkipGuard;

class AdminController extends Controller
{
    #[GuardProfile('admin')]
    public function sensitiveAction()
    {
        // Uses 'admin' profile with stricter rules
    }

    #[SkipGuard(['xss'])]
    public function richTextEditor()
    {
        // XSS guard skipped for this endpoint
    }
}
```

---

## Configuration

```php
// config/runtime-guard.php

return [
    'enabled' => env('RUNTIME_GUARD_ENABLED', true),
    'mode' => env('RUNTIME_GUARD_MODE', 'log'), // 'block', 'log', 'silent'
    
    'pipeline' => [
        'strategy' => 'short_circuit', // 'full', 'short_circuit', 'threshold'
        'tiered' => true,
    ],

    'guards' => [
        'sql-injection' => ['enabled' => true, 'priority' => 100],
        'xss' => ['enabled' => true, 'priority' => 90],
        'command-injection' => ['enabled' => true, 'priority' => 95],
        // ... more guards
    ],

    'profiles' => [
        'api' => [
            'guards' => ['sql-injection', 'command-injection'],
            'mode' => 'log',
        ],
        'admin' => [
            'guards' => '*',
            'mode' => 'block',
        ],
    ],
];
```

---

## Security Guards

| Guard | Description | Default Priority |
|-------|-------------|------------------|
| `sql-injection` | SQL injection patterns | 100 |
| `command-injection` | Shell command injection | 95 |
| `xss` | Cross-site scripting | 90 |
| `deserialization` | Unsafe deserialization | 92 |
| `nosql-injection` | NoSQL/MongoDB injection | 88 |
| `file-operation` | Path traversal, file inclusion | 85 |
| `ssrf` | Server-side request forgery | 80 |
| `mass-assignment` | Dangerous field assignment | 75 |
| `graphql` | GraphQL abuse prevention | 70 |
| `jwt` | JWT/Token attacks | 65 |
| `bot-behavior` | Bot/automation detection | 60 |
| `session-integrity` | Session hijacking detection | 55 |
| `anomaly` | Behavioral anomaly detection | 50 |

---

## Middleware Usage

```php
// routes/web.php

// Apply to specific routes
Route::middleware(['runtime-guard'])->group(function () {
    Route::post('/submit', [FormController::class, 'submit']);
});

// With a specific profile
Route::middleware(['runtime-guard:admin'])->group(function () {
    Route::resource('/admin/users', AdminUserController::class);
});
```

---

## Artisan Commands

```bash
# List all registered guards
php artisan runtime-guard:list

# Test a guard with sample input
php artisan runtime-guard:test sql-injection "1' OR '1'='1"

# Check system status
php artisan runtime-guard:status

# Toggle guards at runtime
php artisan runtime-guard:toggle sql-injection --disable

# Generate a new custom guard
php artisan runtime-guard:make-guard CustomGuard

# Run security audit
php artisan runtime-guard:security-audit
```

---

## Testing

RuntimeGuard provides testing utilities for your application tests:

```php
use M9nx\RuntimeGuard\Facades\RuntimeGuard;

class SecurityTest extends TestCase
{
    public function test_sql_injection_is_detected(): void
    {
        $fake = RuntimeGuard::fake();
        
        $this->post('/api/search', ['query' => "1' OR '1'='1"]);
        
        $fake->assertThreatDetected();
        $fake->assertGuardTriggered('sql-injection');
    }

    public function test_clean_input_passes(): void
    {
        $fake = RuntimeGuard::fake();
        
        $this->post('/api/search', ['query' => 'normal search']);
        
        $fake->assertNoThreatsDetected();
    }
}
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Internal architecture and component overview |
| [Features](docs/FEATURES.md) | Complete feature list and capabilities |
| [Changelog v4.0](docs/V4_CHANGELOG.md) | What's new in version 4.0 |
| [Contributing](CONTRIBUTING.md) | Contribution guidelines |
| [Security Policy](SECURITY.md) | Security reporting procedures |

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

```bash
# Development setup
composer install
composer test
composer analyse
```

---

## Security

If you discover a security vulnerability, please send an email to the maintainer instead of using the issue tracker. See [SECURITY.md](SECURITY.md) for details.

---

## Credits

- [M9nx](https://github.com/M9nx)
- [All Contributors](../../contributors)

---

## License

The MIT License (MIT). See [LICENSE](LICENSE) for more information.
