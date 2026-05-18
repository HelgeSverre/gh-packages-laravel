# Laravel EnvGuard

Typed, validated, documented environment variable schemas for Laravel. Replaces the convention of committing a `.env.example` with real tooling: a schema file that defines types, validation rules, required/optional status, and documentation for every environment variable your application uses.

## Why this exists

The standard Laravel workflow is to commit a `.env.example` file with placeholder values and tell developers to copy it to `.env` and fill it in. This has a few problems that get worse at scale:

- **No types.** Nothing prevents a string going into `DB_PORT` or a garbage value going into `APP_URL`.
- **No validation.** You find out a variable is missing or wrong when the application breaks, not when you deploy.
- **No documentation.** Comments in `.env.example` drift or disappear. New team members have no idea what half the variables do or whether they are required.
- **No environment awareness.** Some variables are required in production but not locally. `.env.example` cannot express that.
- **No diffing.** You cannot easily see what your local env is missing compared to production, or what someone added to production without documenting.
- **No CI gate.** Nothing stops a deployment to an environment where a required variable is missing.

EnvGuard solves all of this with a single `.env.schema.php` file that you commit to version control. The schema is the source of truth. The `.env.example` becomes a generated artifact.

## Features

- **Typed schema** — define each variable as `string`, `integer`, `float`, `boolean`, `enum`, `url`, or `email`
- **Fluent builder** — a readable API for documenting requirements, defaults, validation rules, and warnings
- **Environment-specific requirements** — a variable can be optional locally but required in production
- **Sensitive value masking** — secrets are automatically redacted in diff output
- **Remote environment readers** — compare or validate environments via local files, SSH, Laravel Forge, or Laravel Cloud
- **Seven Artisan commands** — validate, diff, check, generate, audit, drift, init
- **CI/CD gate** — fail your pipeline if a deployment environment is missing required variables

## Installation

```bash
composer require fvfvfvfv/laravel-envguard
```

The service provider is auto-discovered. Publish the config file if you want to customize it:

```bash
php artisan vendor:publish --tag=envguard-config
```

## Quick start

**1. Generate a schema from your existing `.env.example`:**

```bash
php artisan env:init
```

This creates `.env.schema.php` at your project root. If `.env.example` exists, EnvGuard parses it and creates an entry for each variable. If it does not exist, it generates a schema covering all standard Laravel variables.

**2. Customize the schema:**

Open `.env.schema.php` and annotate each variable:

```php
return [
    'APP_KEY' => EnvVar::string()
        ->required()
        ->sensitive()
        ->description('Application encryption key — generate with: php artisan key:generate'),

    'APP_ENV' => EnvVar::enum(['local', 'staging', 'production'])
        ->required()
        ->description('Deployment environment'),

    'DB_PORT' => EnvVar::integer()
        ->optional()
        ->min(1)
        ->max(65535)
        ->default(3306),

    'STRIPE_SECRET' => EnvVar::string()
        ->requiredIn(['production', 'staging'])
        ->sensitive()
        ->validatedBy('starts_with:sk_')
        ->description('Stripe secret key'),
];
```

**3. Validate your local environment:**

```bash
php artisan env:validate
```

**4. Commit the schema file.** It replaces `.env.example` as the canonical reference for what your application needs.

---

## Defining a schema

The schema file lives at `.env.schema.php` (configurable) and must return an associative array mapping variable names to `EnvVar` instances.

```php
<?php

use Fvfvfvfv\EnvGuard\Schema\EnvVar;

return [
    'VARIABLE_NAME' => EnvVar::string()->required()->description('...'),
];
```

### Type factories

```php
EnvVar::string()          // Any string value
EnvVar::integer()         // Must be a whole number: "42", "3306"
EnvVar::float()           // Must be numeric: "3.14", "42"
EnvVar::boolean()         // true/false/1/0/yes/no (case-insensitive)
EnvVar::enum(['a', 'b'])  // Value must be one of the given options
EnvVar::url()             // Must pass filter_var FILTER_VALIDATE_URL
EnvVar::email()           // Must pass filter_var FILTER_VALIDATE_EMAIL
```

### Fluent methods

```php
// Requirement
->required()                          // Required in all environments
->requiredIn(['production', 'staging'])// Required only in named environments
->optional()                          // Explicitly optional (the default)

// Value constraints
->default('value')                    // Default value (shown in generated .env.example)
->defaultIn('production', false)      // Environment-specific default
->min(1)                              // Minimum value (integer/float only)
->max(65535)                          // Maximum value (integer/float only)
->validatedBy('starts_with:sk_')      // Any Laravel validation rule string

// Documentation
->description('Human-readable description')
->example('sk_live_abc123')           // Example value (used in generated .env.example)
->sensitive()                         // Mask this value in diff output

// Warnings and lifecycle
->warnIf(fn($value, $env) => ..., 'Warning message')  // Conditional warning
->deprecated('Use NEW_VAR instead')   // Mark as deprecated
```

### The `warnIf` closure

The closure receives the current value and the environment name. Return `true` to trigger the warning:

```php
'APP_DEBUG' => EnvVar::boolean()
    ->required()
    ->warnIf(
        fn($value, $env) => in_array($env, ['production', 'staging'])
            && in_array(strtolower($value), ['true', '1', 'yes']),
        'Debug mode should be disabled in production',
    ),
```

---

## Commands

### `env:init` — scaffold the schema

```bash
php artisan env:init
```

Creates `.env.schema.php`. If `.env.example` exists, it parses it into a schema. Otherwise it generates a schema covering standard Laravel 12 variables with correct types and descriptions.

---

### `env:validate` — validate the local environment

```bash
php artisan env:validate [--env=production] [--strict]
```

Reads the `.env` file from disk (not from the running application environment), validates it against the schema, and reports errors, warnings, and undocumented variables.

```
 EnvGuard Validation — environment: local

 ERRORS (1)
 ✗ Missing required variable: APP_KEY (required)

 WARNINGS (1)
 ⚠ APP_DEBUG — Debug mode should be disabled in production

 UNDOCUMENTED (2)
 ? TELESCOPE_ENABLED — not defined in schema
 ? LEGACY_API_KEY — not defined in schema

 Result: FAIL (1 error, 1 warning, 2 undocumented)
```

| Option | Description |
|---|---|
| `--env` | Override the environment context for requirement checking. Defaults to the `APP_ENV` value in your `.env` file. |
| `--strict` | Treat warnings as errors. Returns exit code 1 if any warnings exist. |

Exit code is `0` on pass, `1` on failure.

---

### `env:example` — generate `.env.example` from schema

```bash
php artisan env:example [--output=.env.example] [--force]
```

Generates a `.env.example` file from the schema. Variables are grouped by prefix (APP, DB, MAIL, etc.) and each entry gets a comment with its description, required status, and sensitive flag.

```bash
##
## Application
##

# Application display name
APP_NAME=My Application

# Application encryption key — generate with: php artisan key:generate [REQUIRED] [SENSITIVE]
APP_KEY=

##
## Database
##

# Database port [REQUIRED]
DB_PORT=3306
```

| Option | Description |
|---|---|
| `--output` | Output path relative to the project root. Defaults to `.env.example`. |
| `--force` | Overwrite the existing file without prompting. |

---

### `env:audit` — secret hygiene scan

```bash
php artisan env:audit [--fix-env-calls]
```

Scans the project for four categories of issues:

1. **`env()` calls outside config files** — `env()` breaks when `php artisan config:cache` is active. All `env()` calls should be inside `config/` files, accessed via `config()` elsewhere.
2. **`.env` files tracked in git** — flags `.env`, `.env.production`, etc. if they appear in `git ls-files`.
3. **Potential hardcoded secrets in config files** — scans for long alphanumeric strings, hex tokens, and known key patterns that are not wrapped in `env()`.
4. **Sensitive patterns in log files** — scans recent log entries for variable names matching patterns like `*PASSWORD*`, `*SECRET*`, `*KEY*`.

Pass `--fix-env-calls` to get suggested `config()` replacements for each `env()` call found.

---

### `env:diff` — compare two environments

```bash
php artisan env:diff {left} {right} [--reveal] [--only-changes] [--json]
```

Compares two environments side by side. Each environment must be configured in `config/envguard.php` under the `environments` key, or use `local`/`current` to refer to the local `.env` file.

```bash
php artisan env:diff local staging
php artisan env:diff staging production
php artisan env:diff local production --only-changes
```

Output is a color-coded table:
- **Green** — identical on both sides
- **Yellow** — different values
- **Red** — missing on one side

Sensitive variables (marked `->sensitive()` or matching global patterns like `*PASSWORD*`) are masked to show only the first 4 characters: `sk_te***`.

| Option | Description |
|---|---|
| `--reveal` | Show full values for sensitive variables. Prints a warning before output. |
| `--only-changes` | Hide rows where both sides have the same value. |
| `--json` | Output structured JSON instead of a table, suitable for piping. |

Exit code is `0` if no differences, `1` if differences exist.

---

### `env:check` — CI/CD deployment gate

```bash
php artisan env:check {environment} [--strict] [--json]
```

Reads a remote environment's variables and validates them against the schema. Designed to run in CI/CD pipelines before deployment.

```bash
php artisan env:check production
php artisan env:check production --strict || exit 1
```

Minimal output by default — just `PASS` or `FAIL` with counts. Use `--json` for machine-readable output suitable for parsing in pipeline scripts.

| Option | Description |
|---|---|
| `--strict` | Treat warnings as errors. |
| `--json` | Output JSON: `{"environment": "production", "status": "pass", "errors": [], "warnings": [], "undocumented": []}` |

Exit code is `0` on pass, `1` on failure.

---

### `env:drift` — detect undocumented variables

```bash
php artisan env:drift {environment}
```

Compares a remote environment's actual variables against the schema and reports:

- **Undocumented in schema** — variables that exist in the environment but have no schema definition. These might be secrets someone added manually without documenting.
- **Missing required variables** — variables the schema requires for that environment that are absent from the remote environment.

This is distinct from `env:check` (which validates values) — drift focuses on schema coverage.

```bash
php artisan env:drift production

 Undocumented in schema (2)
 ? REDIS_SENTINEL_HOST
 ? PUSHER_BEAMS_SECRET

 Missing required variables (1)
 ✗ STRIPE_WEBHOOK_SECRET
```

---

## Configuring remote environments

Add named environments to `config/envguard.php` under the `environments` key. Each entry requires a `driver` and driver-specific options.

### Local file driver

Reads a `.env`-style file from the local filesystem. Useful for comparing against `.env.staging` or `.env.production` files you keep alongside the project (but outside version control).

```php
'environments' => [
    'staging' => [
        'driver' => 'file',
        'path' => '.env.staging',       // relative to project root
    ],
    'production' => [
        'driver' => 'file',
        'path' => '/absolute/path/to/.env.production',
    ],
],
```

---

### SSH driver

Reads a `.env` file from a remote server over SSH. Requires the server to be accessible and the user to have read permission on the file.

```php
'environments' => [
    'production' => [
        'driver' => 'ssh',
        'host' => 'production.example.com',
        'user' => 'deploy',
        'path' => '/var/www/app/.env',
        'port' => 22,                    // optional, defaults to 22
        'key'  => '~/.ssh/id_rsa',       // optional, defaults to SSH agent
    ],
],
```

For better SSH support, install `phpseclib/phpseclib`. Without it, EnvGuard falls back to the system `ssh` command:

```bash
composer require phpseclib/phpseclib --dev
```

**Using SSH in CI/CD:** Add your deploy key as an environment secret and write it to a temp file before running `env:check`:

```yaml
- name: Write SSH key
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/deploy_key
    chmod 600 ~/.ssh/deploy_key
    ssh-keyscan production.example.com >> ~/.ssh/known_hosts

- name: Check production environment
  run: php artisan env:check production
  env:
    ENVGUARD_SSH_KEY: ~/.ssh/deploy_key
```

---

### Laravel Forge driver

Reads environment variables from a Forge-managed site via the Forge API. Requires the `laravel/forge-sdk` package.

```bash
composer require laravel/forge-sdk
```

```php
'environments' => [
    'production' => [
        'driver'    => 'forge',
        'server_id' => env('FORGE_SERVER_ID'),
        'site_id'   => env('FORGE_SITE_ID'),
        'token'     => env('FORGE_API_TOKEN'),
    ],
],
```

Generate a Forge API token at **forge.laravel.com → Account → API**.

**Recommended setup:** Store your Forge credentials as CI secrets and inject them as environment variables. Never commit them to the schema file — use `env()` in the config as shown above.

---

### Laravel Cloud driver

Reads environment variables from Laravel Cloud via the Cloud REST API

```php
'environments' => [
    'cloud-production' => [
        'driver'         => 'cloud',
        'environment_id' => env('LARAVEL_CLOUD_ENV_ID'),
        'token'          => env('LARAVEL_CLOUD_API_TOKEN'),
    ],
],
```

Generate a Cloud API token in your Cloud dashboard under **Account → API Tokens**.

---

### Callback driver

For custom integrations where none of the built-in drivers apply, use a callback that returns an associative array.

```php
'environments' => [
    'vault-production' => [
        'driver'   => 'callback',
        'name'     => 'HashiCorp Vault (production)',
        'callback' => function () {
            $client = new VaultClient(env('VAULT_ADDR'), env('VAULT_TOKEN'));
            return $client->read('secret/myapp/production');
        },
    ],
],
```

---

## CI/CD integration

The `env:check` command is designed to be a deployment gate. It reads a named remote environment, validates it against the schema, and returns a non-zero exit code if anything is wrong.

### GitHub Actions

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'

      - name: Install dependencies
        run: composer install --no-dev --optimize-autoloader

      - name: Gate — validate production environment
        run: php artisan env:check production --strict --json
        env:
          FORGE_API_TOKEN: ${{ secrets.FORGE_API_TOKEN }}
          FORGE_SERVER_ID: ${{ secrets.FORGE_SERVER_ID }}
          FORGE_SITE_ID: ${{ secrets.FORGE_SITE_ID }}

      - name: Deploy
        run: ./deploy.sh
```

If `env:check` returns a non-zero exit code, the `Deploy` step never runs.

### Using the JSON output in CI

The `--json` flag makes the output machine-readable for custom pipeline logic:

```bash
result=$(php artisan env:check production --json)
status=$(echo "$result" | jq -r '.status')
errors=$(echo "$result" | jq '.errors[]')

if [ "$status" != "pass" ]; then
  echo "Environment check failed:"
  echo "$errors"
  exit 1
fi
```

### Validating schema drift before merge

Add a job that detects schema drift between a feature branch and production, alerting you when production has undocumented variables that the new schema doesn't cover:

```yaml
- name: Check for production drift
  run: php artisan env:drift production
  env:
    LARAVEL_CLOUD_ENV_ID: ${{ secrets.CLOUD_ENV_ID }}
    LARAVEL_CLOUD_API_TOKEN: ${{ secrets.CLOUD_API_TOKEN }}
```

---

## Local development workflow

**Day-to-day workflow for individual developers:**

```bash
# After pulling changes, check if your local .env is missing anything new
php artisan env:validate

# See what your local env is missing compared to staging
php artisan env:diff local staging --only-changes

# After adding new variables to the schema, regenerate .env.example
php artisan env:example

# Before a production deployment, validate the production environment
php artisan env:check production
```

**Onboarding a new developer:**

```bash
# 1. Clone the repo — .env.schema.php is already committed
# 2. Copy .env.example to .env
cp .env.example .env

# 3. Fill in your local values, then validate
php artisan env:validate --env=local

# 4. See which variables are still missing or wrong
# The output tells you exactly what to fix
```

**Adding a new environment variable:**

```bash
# 1. Add the variable to .env.schema.php
# 2. Add it to your local .env
# 3. Validate
php artisan env:validate

# 4. Regenerate .env.example so it stays in sync
php artisan env:example

# 5. Commit both .env.schema.php and .env.example
git add .env.schema.php .env.example
git commit -m "Add NEW_VAR to schema"
```

---

## Configuration

Publish the config file to customize behavior:

```bash
php artisan vendor:publish --tag=envguard-config
```

```php
// config/envguard.php

return [
    // Path to the schema file, relative to base_path()
    'schema_path' => '.env.schema.php',

    // Variable names matching these glob patterns are always treated as sensitive,
    // even if not explicitly marked with ->sensitive() in the schema.
    // Sensitive values are masked in diff output unless --reveal is passed.
    'global_sensitive_patterns' => [
        '*PASSWORD*',
        '*SECRET*',
        '*KEY*',
        '*TOKEN*',
        '*_DSN',
    ],

    // Number of characters to reveal at the start of a masked sensitive value.
    // e.g. 4 → "sk_te***"
    'mask_reveal_chars' => 4,

    // Variables with these prefixes are considered framework-internal and will
    // not be flagged as "undocumented" during validation.
    'framework_internal_prefixes' => [
        'IGNITION_',
        'DEBUGBAR_',
        'TELESCOPE_',
        'PULSE_',
        'OCTANE_',
        'HORIZON_',
    ],

    // Named remote environments for env:diff, env:check, and env:drift.
    'environments' => [
        // See "Configuring remote environments" for available drivers.
    ],
];
```

---

## Security notes

- The schema file (`.env.schema.php`) is safe to commit. It contains types and documentation, not values.
- Your `.env` file should never be committed. Ensure it is in `.gitignore`. Run `php artisan env:audit` to verify.
- The `--reveal` flag on `env:diff` prints full sensitive values. EnvGuard prints a warning when this flag is used. Do not share that output.
- The `env:audit` command scans logs locally and never transmits them anywhere.
- All remote environment reads happen at command invocation time. Nothing is cached or stored.
