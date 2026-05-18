# Laravel Audit Suite

[![Tests](https://github.com/martin-lechene/audit-laravel/actions/workflows/tests.yml/badge.svg)](https://github.com/martin-lechene/audit-laravel/actions/workflows/tests.yml)
[![PHP](https://img.shields.io/badge/PHP-8.1%2B-blue.svg)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-10%20|%2011%20|%2012-red.svg)](https://laravel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive audit package for Laravel projects. Run a single Artisan command to get an automated health report across **6 pillars**: SEO, Security, Performance, Database, Code Quality, and Infrastructure.

## Requirements

| Dependency | Version |
|------------|---------|
| PHP | ^8.1 |
| Laravel | 10, 11 or 12 |

## Installation

```bash
composer require martin-lechene/audit-laravel
```

Publish the configuration:

```bash
php artisan vendor:publish --tag=audit-suite-config
```

Publish and run the migrations (only needed if you want to persist audit history):

```bash
php artisan vendor:publish --tag=audit-suite-migrations
php artisan migrate
```

## Quick Start

```bash
php artisan audit:run
```

## Usage

### Options

```bash
# Filter by category
php artisan audit:run --category=security

# Filter displayed results by severity
php artisan audit:run --severity=critical,high

# Export as JSON / HTML / Markdown
php artisan audit:run --format=json --output=report.json
php artisan audit:run --format=html --output=report.html
php artisan audit:run --format=markdown --output=report.md

# Persist results to database and compare with previous run
php artisan audit:run --store --historic

# Run only specific auditors
php artisan audit:run --only=security,performance

# Skip specific auditors
php artisan audit:run --except=seo,database
```

### Option Reference

| Option | Description | Default |
|--------|-------------|---------|
| `--category` | Filter displayed findings by category | — |
| `--severity` | Filter displayed findings by severity | — |
| `--format` | Output format: `console`, `json`, `html`, `markdown` | `console` |
| `--store` | Persist results to the database | false |
| `--historic` | Compare with the previous stored audit (requires `--store`) | false |
| `--output` | File path for non-console output | auto |
| `--only` | Comma-separated list of auditors to run | all |
| `--except` | Comma-separated list of auditors to skip | none |

## Auditors & Rules

15 rules are shipped across 6 auditors.

### SEO (3 rules)

| Rule | Severity |
|------|----------|
| Meta description present on Blade views | medium |
| `robots.txt` present and valid | low |
| `sitemap.xml` present and valid | medium |

### Security (4 rules)

| Rule | Severity |
|------|----------|
| HTTPS enforced in production | high |
| CSRF protection enabled | critical |
| `APP_DEBUG` disabled in production | critical |
| `APP_KEY` defined and non-default | critical |

### Performance (2 rules)

| Rule | Severity |
|------|----------|
| Slow queries detected in logs | medium |
| Cache driver suitable for environment | medium |

### Database (1 rule)

| Rule | Severity |
|------|----------|
| All migrations have been run | high |

### Code Quality (2 rules)

| Rule | Severity |
|------|----------|
| PSR-12 tooling configured | low |
| Automated tests exist | medium |

### Infrastructure (3 rules)

| Rule | Severity |
|------|----------|
| PHP version meets requirement | high |
| `storage/` and `bootstrap/cache` are writable | high |
| Required environment variables are defined | high |

## Scoring

```
Global Score = Σ (category_average × weight) / total_weight

Weights:
  Security        35 %
  Performance     25 %
  SEO             20 %
  Code Quality    12 %
  Database         5 %
  Infrastructure   3 %
```

| Score | Interpretation |
|-------|----------------|
| 90–100 | Excellent |
| 80–89  | Very Good |
| 70–79  | Good |
| 60–69  | Acceptable |
| 50–59  | Needs Attention |
| < 50   | Critical |

Severity impact on category score:

| Severity | Score penalty |
|----------|--------------|
| Critical | −20 pts |
| High     | −10 pts |
| Medium   | −5 pts |
| Low      | −2 pts |
| Info     | 0 pts |

## Extending

### Custom rule

```php
namespace App\AuditRules;

use MartinLechene\AuditSuite\Rules\BaseRule;
use MartinLechene\AuditSuite\Models\AuditResult;
use MartinLechene\AuditSuite\Services\AuditContext;

class MyCustomRule extends BaseRule
{
    public function getName(): string      { return 'custom.my_rule'; }
    public function getDescription(): string { return 'My custom rule'; }
    public function getSeverity(): string  { return 'medium'; }
    public function getCategory(): string  { return 'security'; }

    public function check(AuditContext $context): AuditResult
    {
        if (/* condition */) {
            return AuditResult::passed($this->getName());
        }

        return AuditResult::failed($this->getName())
            ->withMessage('Issue detected')
            ->withEvidence(['key' => 'value'])
            ->withScore(50);
    }

    public function getFix(): ?string
    {
        return 'How to fix this issue.';
    }
}
```

### Register the rule

```php
use MartinLechene\AuditSuite\Services\RuleEngine;

// Inside a ServiceProvider::boot()
public function boot(): void
{
    $ruleEngine = app(RuleEngine::class);
    $ruleEngine->registerRule(new MyCustomRule());
}
```

### Listen to events

```php
use MartinLechene\AuditSuite\Events\FindingDetected;

Event::listen(FindingDetected::class, function (FindingDetected $event) {
    if ($event->finding->severity === 'critical') {
        // Send a notification, trigger an alert, etc.
    }
});
```

Available events: `AuditStarted`, `AuditCompleted`, `AuditFailed`, `FindingDetected`.

## Configuration

`config/audit-suite.php`:

```php
return [
    'enabled' => env('AUDIT_ENABLED', true),

    'auditors' => [
        'seo'            => env('AUDIT_SEO', true),
        'security'       => env('AUDIT_SECURITY', true),
        'performance'    => env('AUDIT_PERFORMANCE', true),
        'database'       => env('AUDIT_DATABASE', true),
        'code_quality'   => env('AUDIT_CODE_QUALITY', true),
        'infrastructure' => env('AUDIT_INFRASTRUCTURE', true),
    ],

    'store_results'    => env('AUDIT_STORE_RESULTS', false),
    'max_stored_audits' => 50,

    'scoring' => [
        'weights' => [
            'security'       => 35,
            'performance'    => 25,
            'seo'            => 20,
            'code_quality'   => 12,
            'database'       => 5,
            'infrastructure' => 3,
        ],
        'minimum_score' => 70,
    ],
];
```

## Testing

```bash
composer test
```

## License

MIT — see [LICENSE](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

