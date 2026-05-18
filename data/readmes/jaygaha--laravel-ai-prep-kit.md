# Laravel AI Prep Kit

[![Latest Version on Packagist](https://img.shields.io/packagist/v/jaygaha/laravel-ai-prep-kit.svg?style=flat-square)](https://packagist.org/packages/jaygaha/laravel-ai-prep-kit)
[![Tests](https://img.shields.io/github/actions/workflow/status/jaygaha/laravel-ai-prep-kit/ci.yml?branch=main&label=tests&style=flat-square)](https://github.com/jaygaha/laravel-ai-prep-kit/actions/workflows/ci.yml)
[![PHP Version](https://img.shields.io/packagist/php-v/jaygaha/laravel-ai-prep-kit.svg?style=flat-square)](https://packagist.org/packages/jaygaha/laravel-ai-prep-kit)
[![License](https://img.shields.io/packagist/l/jaygaha/laravel-ai-prep-kit.svg?style=flat-square)](LICENSE)

Audit, optimize, and prepare your Laravel codebase for AI coding agents (Claude Code, Cursor, Copilot, Codex).

## Requirements

- PHP 8.3+
- Laravel 11 or 12

## Installation

```bash
composer require jaygaha/laravel-ai-prep-kit --dev
```

Publish the config (optional):

```bash
php artisan vendor:publish --tag=ai-prep-kit-config
```

Optional dependencies:

```bash
composer require --dev rector/rector        # PHPDoc and strong type refactoring
composer require --dev spatie/laravel-data   # DTO auto-generation
```

## Usage

### Audit

Scan your codebase and get a 0-100 AI-readiness score:

```bash
php artisan ai:prep --audit
php artisan ai:prep --audit --format=json
```

Scores are based on type coverage, Pint adherence, Larastan compliance, test coverage, and pattern enforcement. Reports are saved to `storage/ai-prep-kit/`.

### Fix

Auto-fix issues to improve readiness:

```bash
php artisan ai:prep --fix
php artisan ai:prep --fix --dry-run    # Preview without modifying
php artisan ai:prep --fix --force      # Skip git safety checks
```

The fix pipeline runs: Pint formatting, Larastan analysis, Rector types, test stub generation, controller refactoring (FormRequests, DTOs, Actions/Services), and pattern enforcement scaffolding.

### Generate AGENTS.md

Create AI agent guidelines from your project's patterns:

```bash
php artisan ai:prep --generate-guidelines
```

Detects queue, mail, auth, architecture, and testing patterns automatically.

### Simulate

Predict what an AI agent would do with your codebase:

```bash
php artisan ai:prep --simulate
php artisan ai:prep --simulate --prompt="Add CRUD to OrderController"
```

### Publish Stubs

Copy 9 AI-optimized stub templates to your project:

```bash
php artisan ai:prep --publish-stubs
```

## Configuration

All behavior is controlled via `config/ai-prep-kit.php`:

- **paths/exclude** -- Directories to scan and skip
- **weights** -- Scoring weights per analyzer (normalized)
- **thresholds** -- Pass/warn/fail score boundaries
- **fixers** -- Enable/disable individual fixers
- **rules** -- Enable/disable pattern enforcement rules
- **refactors** -- Line count/complexity thresholds, generator toggles
- **guidelines.detectors** -- Enable/disable pattern detectors
- **simulation.scenarios** -- Enable/disable simulation scenarios
- **plugins** -- Register plugin classes
- **macros** -- Enable Eloquent Builder macros (`whereActive`, `whereBelongsToAuth`, etc.)
- **hooks** -- Register AI tool hooks (Prism, NeuronAI)

## Plugins

Register built-in or custom plugins in config:

```php
'plugins' => [
    \JayGaha\AiPrepKit\Plugins\Builtin\FilamentPlugin::class,
    \JayGaha\AiPrepKit\Plugins\Builtin\InertiaPlugin::class,
],
```

Plugins can contribute analyzers, fixers, rules, detectors, and scenarios. Extend `AbstractPlugin` and override only what you need.

## CI Integration

Publish the reusable GitHub Actions workflow:

```bash
php artisan vendor:publish --tag=ai-prep-kit-workflow
```

```yaml
jobs:
  ai-readiness:
    uses: ./.github/workflows/ai-prep-check.yml
    with:
      min-score: 60
```

## Development

```bash
composer test       # Run tests
composer lint       # Check code style
composer fix        # Fix code style
composer analyse    # Run static analysis
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md). Do not open public issues for vulnerabilities.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT -- see [LICENSE](LICENSE).
