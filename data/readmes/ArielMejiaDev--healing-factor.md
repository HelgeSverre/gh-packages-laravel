![Healing Factor Dashboard](images/preview.png)

# Healing-Factor

[![Latest Version on Packagist](https://img.shields.io/packagist/v/ariel-mejia-dev/healing-factor.svg?style=flat-square)](https://packagist.org/packages/ariel-mejia-dev/healing-factor)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/ariel-mejia-dev/healing-factor/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/ariel-mejia-dev/healing-factor/actions?query=workflow%3Arun-tests+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/ariel-mejia-dev/healing-factor.svg?style=flat-square)](https://packagist.org/packages/ariel-mejia-dev/healing-factor)

A self-healing Laravel package that catches exceptions and automatically creates pull requests with fixes using AI. When an error occurs in your app, Healing-Factor captures it, spins up an AI agent in an isolated git worktree, and opens a draft PR with the fix — all without touching your production code.

[To learn all about it, head over to the extensive documentation.](!https://healing-factor.com/index.html)

## How It Works

1. An exception occurs in your Laravel app
2. Healing-Factor captures it via a **webhook** (Nightwatch/Bugsnag) or the built-in **exception listener**
3. The exception is fingerprinted, debounced, and deduplicated
4. A queued job creates an **isolated git worktree** on a new branch
5. An AI agent (Claude Code, OpenCode, or the Anthropic API) analyzes the code and writes a fix
6. The fix is committed, pushed, and a **draft pull request** is opened
7. The worktree is automatically cleaned up
8. You review the PR and merge

## Requirements

- PHP 8.4+
- Laravel 11 or 12
- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated
- A queue worker running

**Plus one of:**

| Driver | Requires                                                                                                                                     |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `cli`  | [Claude Code](https://docs.anthropic.com/en/docs/claude-code) or [OpenCode](https://github.com/opencode-ai/opencode) installed on the server |
| `api`  | Only an `ANTHROPIC_API_KEY` (no CLI installation needed)                                                                                     |

## Installation

```bash
composer require ariel-mejia-dev/healing-factor
```

```bash
php artisan healing-factor:install
```

This publishes the config, runs the migration, and verifies your setup.

## Quick Start

Pick the setup that matches your environment:

### Option A: CLI Driver + Exception Listener (simplest)

No external monitor needed. Healing-Factor listens to Laravel errors directly.

```dotenv
APP_ENV=staging
HEALING_FACTOR_DRIVER=cli
HEALING_FACTOR_CLI_TOOL=claude
HEALING_FACTOR_MONITOR=exception_listener
```

### Option B: CLI Driver + Nightwatch Webhook

```dotenv
APP_ENV=staging
HEALING_FACTOR_DRIVER=cli
HEALING_FACTOR_CLI_TOOL=claude
HEALING_FACTOR_MONITOR=nightwatch
HEALING_FACTOR_WEBHOOK_SECRET=your-strong-random-secret
```

### Option C: API Driver (no CLI installation needed)

Ideal for staging/production servers (DigitalOcean, Laravel Cloud, AWS) where you can't install CLI tools.

```dotenv
APP_ENV=staging
HEALING_FACTOR_DRIVER=api
HEALING_FACTOR_MONITOR=exception_listener
ANTHROPIC_API_KEY=sk-ant-...
HEALING_FACTOR_GITHUB_PAT=github_pat_...
```

Then start a queue worker:

```bash
php artisan queue:work --timeout=3700
```

> **Why `APP_ENV=staging`?** Healing-Factor only runs in `production` and `staging` by default. In `local`, errors are expected during development. You can change this in `config/healing-factor.php` under `environments`.

> **Why no `ANTHROPIC_API_KEY` for CLI?** Claude Code handles its own authentication. The API driver calls the Anthropic API directly, so it needs the key.

## Verify Your Setup

```bash
php artisan healing-factor:test
```

This creates a test issue and dispatches it for resolution. Add `--sync` to skip the queue.

## Dashboard

Healing-Factor includes a web dashboard at `/healing-factor` to browse issues, view stacktraces, see PR links, and retry failed resolutions.

By default it's only accessible in `local`. To allow access in other environments, register an auth gate in your `AppServiceProvider`:

```php
use ArielMejiaDev\HealingFactor\Facades\HealingFactor;

public function boot(): void
{
    HealingFactor::auth(function ($user) {
        return in_array($user->email, [
            'admin@example.com',
        ]);
    });
}
```

## Artisan Commands

| Command                        | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `healing-factor:install`       | Publish config, run migration, verify setup |
| `healing-factor:test`          | Create a test issue to verify the pipeline  |
| `healing-factor:status`        | Show all issues with summary statistics     |
| `healing-factor:retry {id}`    | Retry a failed issue                        |
| `healing-factor:prune`         | Delete old resolved/failed issues           |
| `healing-factor:recover-stale` | Mark stuck `resolving` issues as `failed`   |

### Recommended Schedule

```php
// routes/console.php
use Illuminate\Support\Facades\Schedule;

Schedule::command('healing-factor:recover-stale')->hourly();
Schedule::command('healing-factor:prune')->daily();
```

## Configuration Highlights

All config lives in `config/healing-factor.php`. Key options:

| Option        | Env Variable                      | Default      | Description                                      |
| ------------- | --------------------------------- | ------------ | ------------------------------------------------ |
| Master switch | `HEALING_FACTOR_ENABLED`          | `true`       | Disable all processing                           |
| Dry run       | `HEALING_FACTOR_DRY_RUN`          | `false`      | Log actions without executing                    |
| Driver        | `HEALING_FACTOR_DRIVER`           | `cli`        | `cli` or `api`                                   |
| CLI tool      | `HEALING_FACTOR_CLI_TOOL`         | `claude`     | `claude` or `opencode`                           |
| Monitor       | `HEALING_FACTOR_MONITOR`          | `nightwatch` | `nightwatch`, `bugsnag`, or `exception_listener` |
| Timeout       | `HEALING_FACTOR_PROCESS_TIMEOUT`  | `3600`       | Max seconds for CLI process                      |
| Debounce      | `HEALING_FACTOR_DEBOUNCE_MINUTES` | `5`          | Min minutes between same exception               |

### Exception Categories

Customize AI behavior per exception type — each category can override `cli_tool`, `model`, `timeout`, `max_turns`, and `prompt`:

```php
'categories' => [
    'quick_fixes' => [
        'timeout' => 1800,
        'max_turns' => 15,
        'exceptions' => [ErrorException::class, TypeError::class, ...],
    ],
    'complex_fixes' => [
        'timeout' => 3600,
        'max_turns' => 30,
        'exceptions' => [LogicException::class, RuntimeException::class, ...],
    ],
],
```

### Ignored Exceptions

Exceptions that should never be processed (infrastructure issues, unfixable errors):

```php
'ignored_exceptions' => [
    \OutOfMemoryError::class,
    \Illuminate\Http\Exceptions\ThrottleRequestsException::class,
    \Symfony\Component\HttpKernel\Exception\HttpException::class,
    \Illuminate\Session\TokenMismatchException::class,
],
```

## Events

| Event                   | Fired When                              |
| ----------------------- | --------------------------------------- |
| `IssueCreated`          | Issue created from webhook or exception |
| `IssueResolving`        | Resolution starts                       |
| `IssueResolved`         | Resolution succeeds                     |
| `IssueResolutionFailed` | Resolution fails                        |

```php
use ArielMejiaDev\HealingFactor\Events\IssueResolved;

Event::listen(IssueResolved::class, function (IssueResolved $event) {
    // Send Slack notification, update status page, etc.
});
```

## What Healing-Factor Can Fix

Any runtime exception that occurs while the app is still running:

- Undefined variables/properties, type errors, bad method calls
- Missing models, query errors, validation logic errors
- Authorization/authentication bugs, route and controller errors
- Logic errors (RuntimeException, DomainException, off-by-one mistakes)

## What It Cannot Fix

- PHP syntax errors (app can't boot)
- Fatal errors that kill the process (OOM, segfaults)
- Infrastructure failures (DB down, Redis unreachable)
- Environment/configuration issues
- Issues requiring human judgment (business logic, UX, architecture)

## Documentation

See [docs/documentation.md](docs/documentation.md) for the full reference including webhook setup, signature verification, API driver details, custom prompts, security model, theming, and troubleshooting.

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Credits

- [ArielMejiaDev](https://github.com/ArielMejiaDev)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
