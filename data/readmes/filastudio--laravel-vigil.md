# Laravel Vigil

![Laravel Vigil](https://github.com/user-attachments/assets/bf5d25ca-7fd8-4651-9cd8-cc9de0964553)

[![Latest Version on Packagist](https://img.shields.io/packagist/v/filastudio/laravel-vigil.svg?style=flat-square)](https://packagist.org/packages/filastudio/laravel-vigil)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/filastudio/laravel-vigil/tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/filastudio/laravel-vigil/actions?query=workflow%3Atests+branch%3Amain)
[![PHP Version](https://img.shields.io/packagist/php-v/filastudio/laravel-vigil.svg?style=flat-square)](https://packagist.org/packages/filastudio/laravel-vigil)
[![Laravel Version](https://img.shields.io/badge/laravel-11.x%20%7C%2012.x-red.svg?style=flat-square)](https://laravel.com)
[![License](https://img.shields.io/packagist/l/filastudio/laravel-vigil.svg?style=flat-square)](https://packagist.org/packages/filastudio/laravel-vigil)

Security audit tool for Laravel. Scans your application's filesystem, PHP configuration, HTTP headers, and Composer dependencies for common vulnerabilities and misconfigurations. Ships with 15 checks out of the box, a scoring system, and an optional Filament v5 dashboard.

## Features

- **15 built-in checks** grouped into 5 categories (filesystem, configuration, HTTP headers, dependencies, extended)
- **Filesystem scanning** for malicious JS, dangerous uploads, wrong permissions, and exposed sensitive files
- **Configuration audits** covering PHP.ini, `.env`, session, and CORS settings
- **HTTP header validation** (HSTS, CSP, X-Frame-Options, etc.)
- **Composer audit integration** to flag vulnerable packages
- **Hardcoded secret detection** with smart `env()` filtering to reduce false positives
- **Security score** from 0 to 100 based on check results
- **File integrity monitoring** via SHA-256 baseline comparison
- **Filament v5 dashboard** (optional) with scan history, score widgets, and one-click scanning
- **JSON and table output**, CI/CD-friendly exit codes
- **Extensible** with custom checks via a simple interface
- **PHP 8.2 enums** for status, severity, and category values

## Why this package

We kept running into the same issues across projects: `.env` files accessible via HTTP, debug mode left on in production, API keys committed to repos, malicious files sneaking into upload directories. Vigil automates the checks we were doing manually.

A few things we focused on:

- **Low noise.** Each check is tuned to avoid false positives. The secret scanner, for example, understands `env()` calls and won't flag them.
- **Useful output.** Failed checks include the exact file, line number, and a concrete fix suggestion.
- **Reasonable performance.** File scanning respects size limits so it won't choke on large codebases.

## Requirements

- PHP 8.2+
- Laravel 11.x or 12.x
- Filament 5.x (optional, for the dashboard)

## Installation

```bash
composer require filastudio/laravel-vigil
```

The service provider registers automatically.

Publish the config:

```bash
php artisan vendor:publish --tag=vigil-config
```

If you want scan history stored in the database:

```bash
php artisan vendor:publish --tag=vigil-migrations
php artisan migrate
```

This creates `vigil_scans` and `vigil_check_results` tables. Old records are cleaned up automatically based on the retention setting in config.

Run your first scan:

```bash
php artisan vigil:audit
```

## Configuration

The configuration file `config/vigil.php` allows you to enable/disable individual checks and customize behavior:

```php
return [
    // Enable or disable individual checks
    'checks' => [
        'fs.public_folder'        => true,
        'fs.malicious_js'         => true,
        'fs.storage_dangerous'    => true,
        'fs.permissions'          => true,
        'fs.sensitive_exposure'   => true,
        'cfg.php_ini'             => true,
        'cfg.env'                 => true,
        'cfg.session'             => true,
        'cfg.cors'                => true,
        'http.headers'            => true,
        'dep.composer_audit'      => true,
        'ext.hardcoded_secrets'   => true,
        'ext.debug_routes'        => true,
        'ext.telescope_debugbar'  => true,
        'ext.file_integrity'      => false, // Requires baseline
    ],

    // Allowed file extensions in public directory
    'public_allowed_extensions' => [
        'css', 'js', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp',
        'ico', 'woff', 'woff2', 'ttf', 'eot', 'pdf', 'map', 'txt',
    ],

    // Dangerous file extensions in storage
    'storage_dangerous_extensions' => [
        'php', 'phtml', 'phar', 'php3', 'php4', 'php5', 'php7',
        'exe', 'bat', 'cmd', 'sh', 'bash', 'bin', 'js', 'vbs', 'ps1',
    ],

    // Store scan results in database
    'store_results' => true,
    
    // Retention period for scan results (days)
    'results_retention_days' => 90,

    // Notification settings (future feature)
    'notifications' => [
        'enabled'            => false,
        'channels'           => ['mail'],
        'notify_on_severity' => ['critical', 'high'],
        'mail_to'            => env('VIGIL_MAIL_TO', null),
    ],
];
```

## Usage

### Artisan Commands

#### `vigil:audit`

Runs all enabled checks and prints results as a table:

```bash
php artisan vigil:audit
```

Options:

- `--category=filesystem,configuration` — filter by category
- `--check=fs.public_folder,cfg.env` — run specific checks only
- `--fail-on=critical,high` — exit with code 1 on matching severity (default: `critical`)
- `--format=json` — JSON output instead of table
- `--output=/path/to/file.json` — write JSON to file
- `--detailed` — show full messages, file paths, line numbers, and fix suggestions

Examples:

```bash
# Only filesystem checks
php artisan vigil:audit --category=filesystem

# Specific checks with details
php artisan vigil:audit --check=fs.public_folder,cfg.env --detailed

# JSON report
php artisan vigil:audit --format=json --output=storage/security-report.json

# CI/CD: fail on critical or high
php artisan vigil:audit --fail-on=critical,high
```

#### `vigil:baseline`

Generates SHA-256 hashes of files in `public/` and `storage/app/public/` for integrity monitoring:

```bash
php artisan vigil:baseline
```

Saves to `storage/app/vigil_baseline.json`. Once a baseline exists, enable the `ext.file_integrity` check in config to compare against it on subsequent scans.

#### `vigil:list`

Shows all 15 checks with their category, severity, and enabled/disabled status:

```bash
php artisan vigil:list
```

### Detailed Output

The `--detailed` flag adds full context to each check result: untruncated messages, exact file paths with line numbers, and specific recommendations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ✗ FAILED - Hardcoded Secrets Detection                                     │
│ ID: ext.hardcoded_secrets | Category: extended | Severity: CRITICAL        │
├─────────────────────────────────────────────────────────────────────────────┤
│ Message: Found 3 potential hardcoded secrets in your codebase              │
│                                                                             │
│ Details:                                                                    │
│   • app/Services/PaymentService.php:42                                     │
│     $apiKey = 'sk_live_abc123def456';                                      │
│                                                                             │
│   • config/services.php:18                                                 │
│     'secret' => 'hardcoded_secret_key',                                    │
│                                                                             │
│ Recommendation:                                                             │
│   Move all secrets to .env file and use env() helper:                      │
│   $apiKey = env('PAYMENT_API_KEY');                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

Useful for investigating failures, generating compliance reports, or just understanding what exactly triggered a check.

### Programmatic Usage

You can also run scans from code:

```php
use FilaStudio\Vigil\SecurityScanner;

$scanner = app(SecurityScanner::class);

// Run all enabled checks
$results = $scanner->run();

foreach ($results as $checkId => $entry) {
    $check = $entry['check'];   // SecurityCheck instance
    $result = $entry['result'];  // CheckResult instance
    
    echo "{$check->title()}: {$result->status}\n";
    
    if ($result->status === 'failed') {
        echo "Message: {$result->message}\n";
        echo "Recommendation: {$result->recommendation}\n";
        print_r($result->details);
    }
}

// Filter by check ID or category
$results = $scanner->run(['fs.public_folder', 'cfg.env']);
$results = $scanner->run(null, ['filesystem', 'configuration']);

// Security score
$passed = count(array_filter($results, fn($e) => $e['result']->status === 'passed'));
$skipped = count(array_filter($results, fn($e) => $e['result']->status === 'skipped'));
$score = $scanner->calculateSecurityScore($passed, count($results), $skipped);

// List all checks (including disabled)
$allChecks = $scanner->getAllChecks();

// Delete old scan records (respects retention config)
$deletedCount = $scanner->cleanupOldScans();
```

## Filament Integration

If you use Filament v5, Vigil ships with a dashboard page and widgets.

Register the plugin in your `AdminPanelProvider`:

```php
use FilaStudio\Vigil\Filament\VigilPlugin;

public function panel(Panel $panel): Panel
{
    return $panel
        ->plugins([
            VigilPlugin::make()
                ->navigationGroup('Security')
                ->navigationSort(99),
        ]);
}
```

The dashboard includes:

- **Security score widget** — 0-100 score, color-coded by severity
- **Critical issues counter** — number of failed critical checks
- **Recent scans table** — history with scores, timestamps, and issue counts
- **Detailed results** — click into any scan to see per-check results with messages and recommendations
- **Run scan button** — trigger scans from the browser without CLI access

Handy for tracking trends over time, sharing results with the team, or pulling up a quick overview during a meeting.

## All Security Checks

| Check ID | Title | Category | Severity | Description |
|----------|-------|----------|----------|-------------|
| `fs.public_folder` | Public Folder Security | filesystem | high | Scans for unexpected files in public directory |
| `fs.malicious_js` | Malicious JavaScript Detection | filesystem | critical | Detects obfuscated/malicious JS patterns |
| `fs.storage_dangerous` | Dangerous Files in Storage | filesystem | critical | Finds executable files in public storage |
| `fs.permissions` | File Permissions Check | filesystem | high | Verifies Unix file permissions (Linux/Mac only) |
| `fs.sensitive_exposure` | Sensitive Files Exposure | filesystem | critical | Checks if .env, composer.json, .git are accessible via HTTP |
| `cfg.php_ini` | PHP Configuration Check | configuration | high | Validates PHP ini directives for security |
| `cfg.env` | Environment Configuration | configuration | critical | Checks APP_DEBUG, APP_KEY, APP_ENV settings |
| `cfg.session` | Session Configuration | configuration | medium | Validates session security settings |
| `cfg.cors` | CORS Configuration | configuration | high | Detects dangerous CORS misconfigurations |
| `http.headers` | Security Headers Check | http_headers | high | Ensures HSTS, CSP, X-Frame-Options, etc. are set |
| `dep.composer_audit` | Composer Dependencies Audit | dependencies | critical | Runs `composer audit` to find vulnerable packages |
| `ext.hardcoded_secrets` | Hardcoded Secrets Detection | extended | critical | Scans for hardcoded passwords, API keys, tokens |
| `ext.debug_routes` | Debug Routes Detection | extended | high | Finds debug endpoints (phpinfo, dd, dump) in routes |
| `ext.telescope_debugbar` | Telescope & Debugbar Check | extended | high | Ensures debug tools are secured in production |
| `ext.file_integrity` | File Integrity Check | extended | critical | Compares files against baseline to detect tampering |

## Custom Checks

Implement the `SecurityCheck` interface:

```php
namespace App\Security\Checks;

use FilaStudio\Vigil\Checks\Contracts\SecurityCheck;
use FilaStudio\Vigil\Checks\Results\CheckResult;
use FilaStudio\Vigil\Enums\Severity;
use FilaStudio\Vigil\Enums\Category;

class DatabaseSSLCheck implements SecurityCheck
{
    public function id(): string { return 'custom.database_ssl'; }
    public function title(): string { return 'Database SSL Connection Check'; }
    public function description(): string { return 'Ensures database connections use SSL in production'; }
    public function category(): string { return Category::Configuration->value; }
    public function severity(): string { return Severity::High->value; }

    public function run(): CheckResult
    {
        if (app()->environment('local')) {
            return CheckResult::skipped('Not applicable in local environment');
        }

        $issues = [];
        foreach (config('database.connections') as $name => $config) {
            if (($config['driver'] ?? '') === 'mysql') {
                if (empty($config['options'][\PDO::MYSQL_ATTR_SSL_CA])) {
                    $issues[] = "Connection '{$name}' does not use SSL";
                }
            }
        }

        if (!empty($issues)) {
            return CheckResult::failed(
                'Database connections without SSL detected',
                ['connections' => $issues],
                'Add SSL options to config/database.php for production connections'
            );
        }

        return CheckResult::passed('All database connections use SSL');
    }
}
```

Register it in a service provider:

```php
use FilaStudio\Vigil\SecurityScanner;

public function boot()
{
    app(SecurityScanner::class)->registerCheck(new \App\Security\Checks\DatabaseSSLCheck());
}
```

After that, `php artisan vigil:audit` will include your check alongside the built-in ones.

`CheckResult` has four static constructors: `passed()`, `failed()`, `warning()`, `skipped()`. Use `skipped()` when a check doesn't apply to the current environment.

### Enums

PHP 8.2 backed enums are available for type-safe values:

- `CheckStatus`: `Passed`, `Failed`, `Warning`, `Skipped`
- `Severity`: `Critical`, `High`, `Medium`, `Low`, `Info`
- `Category`: `Filesystem`, `Configuration`, `HttpHeaders`, `Dependencies`, `Extended`

## Cleanup

Scan results accumulate in the database over time. The retention period is configurable:

```php
// config/vigil.php
'results_retention_days' => 90,
```

To delete records older than the retention period:

```php
app(SecurityScanner::class)->cleanupOldScans();
```

Or schedule it:

```php
// app/Console/Kernel.php
$schedule->call(function () {
    app(\FilaStudio\Vigil\SecurityScanner::class)->cleanupOldScans();
})->weekly();
```

## CI/CD Integration

The `--fail-on` flag makes Vigil work as a pipeline gate. If any check with the specified severity fails, the command exits with code 1.

```bash
php artisan vigil:audit --fail-on=critical,high
```

GitHub Actions example:

```yaml
- name: Security Audit
  run: php artisan vigil:audit --fail-on=critical,high
```

GitLab CI:

```yaml
security_audit:
  stage: test
  script:
    - php artisan vigil:audit --fail-on=critical,high
```

Jenkins:

```groovy
sh 'php artisan vigil:audit --fail-on=critical,high'
```

You can adjust the threshold: `--fail-on=critical` for lenient, `--fail-on=critical,high,medium` for strict.

## Development

```bash
# Tests (PestPHP)
composer test

# Code style (Laravel Pint)
composer pint:test

# Static analysis (PHPStan level 8)
composer phpstan

# All at once
composer test && composer pint:test && composer phpstan
```

## Contributing

Pull requests are welcome.

## License

MIT. See [LICENSE](LICENSE.md).
