# Laravel Deployer

[![PHP Version](https://img.shields.io/packagist/php-v/shaf/laravel-deployer)](composer.json)
[![Laravel](https://img.shields.io/badge/Laravel-11.x%20%7C%2012.x-red)](https://laravel.com)

Rsync-based zero-downtime deployment automation for Laravel.

## Requirements

- PHP >= 8.2, Laravel 11.x or 12.x
- SSH access to deployment servers
- rsync on local and remote machines

## Installation

```bash
composer require shaf/laravel-deployer
php artisan deployer:setup install
```

This creates a `.deploy/` directory with `deploy.json` and example environment files.

## Quick Start

**1. Configure** `.deploy/deploy.json`:

```json
{
  "$schema": "./vendor/shaf/laravel-deployer/stubs/deploy.schema.json",
  "keepReleases": 3,
  "environments": {
    "staging": { "deployPath": "/var/www/staging" },
    "production": { "deployPath": "/var/www/production" }
  },
  "beforeSymlink": ["php artisan optimize:clear"]
}
```

**2. Create environment file:**

```bash
cp .deploy/.env.staging.example .deploy/.env.staging
```

```env
DEPLOY_HOST=staging.example.com
DEPLOY_USER=deployer
DEPLOY_IDENTITY_FILE=~/.ssh/id_rsa
```

**3. Deploy:**

```bash
php artisan deployer:release staging
```

## Commands

```bash
# Deploy
php artisan deployer:release staging              # Full deployment
php artisan deployer:release staging --dry-run    # Show plan only
php artisan deployer:release staging --interactive # Prompt for each option
php artisan deployer:release staging --no-confirm  # Skip confirmation

# Sync (patches current release — no new release, no rollback)
php artisan deployer:sync staging                  # Full rsync checksum scan
php artisan deployer:sync staging --dirty          # Uncommitted changes only
php artisan deployer:sync staging --since=abc123   # Since a commit
php artisan deployer:sync staging --branch         # vs main branch

# Rollback
php artisan deployer:rollback staging

# Server
php artisan deployer:server clear staging          # Clear caches on server
php artisan deployer:server provision              # Provision new Ubuntu server
php artisan deployer:diagnose staging              # Diagnose deployment issues

# Setup
php artisan deployer:setup install                 # Install/regenerate config
php artisan deployer:setup init staging            # Migrate existing site
php artisan deployer:setup keygen                  # Generate SSH keys

# Database
php artisan deployer:db backup staging             # Backup on server
php artisan deployer:db backup staging --download  # Backup + download
php artisan deployer:db backup staging --install   # Backup + download + install locally
php artisan deployer:db download staging           # Download backup
php artisan deployer:db download staging --latest  # Download latest
php artisan deployer:db install                    # Install backup to local database
php artisan deployer:db install --latest           # Install latest backup
php artisan deployer:db list                       # List local backups
```

## Deployment Flow

```
BEFORE SYMLINK:
  Lock → Structure → Release dir → Build assets → Diff → Confirm →
  Copy prev release → Rsync → Shared symlinks → Composer → Permissions →
  Migrations → beforeSymlink hooks → Storage link

SYMLINK SWITCH:
  current → /releases/YYYYMM.N/

AFTER SYMLINK:
  Log → Health check → Cleanup → Service restarts →
  artisan optimize → postDeploy hooks → Receipt
```

## Configuration

### deploy.json

All settings below are optional. Only `environments` with at least one `deployPath` is required.

<details>
<summary><strong>Global Settings</strong></summary>

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `keepReleases` | int | `3` | Releases to keep on server |
| `phpBinary` | string | `"php"` | PHP binary path on server |
| `copyVendor` | bool | `true` | Copy vendor/ from previous release |
| `skipPermissionFix` | bool | `false` | Skip permission fixing |
| `backupBeforeMigrate` | bool | `false` | Backup DB before migrations |
| `maintenanceMode` | bool | `false` | Enable maintenance mode during deploy |
| `maintenanceSecret` | string | `null` | Secret to bypass maintenance |

</details>

<details>
<summary><strong>Display Settings</strong></summary>

```json
{
  "display": {
    "showDiff": true,
    "confirmChanges": true,
    "showUploadProgress": true,
    "diffDisplayLimit": 20
  }
}
```

</details>

<details>
<summary><strong>SSH Settings</strong></summary>

```json
{
  "ssh": {
    "strictHostKeyChecking": true
  }
}
```

</details>

<details>
<summary><strong>Rsync Settings</strong></summary>

```json
{
  "rsync": {
    "exclude": [".git/", "node_modules/", "/vendor/", "storage/", ".env", "tests/"],
    "include": ["composer.json", "composer.lock"],
    "flags": "rz",
    "options": ["delete", "delete-after", "compress"]
  }
}
```

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `useGitignore` | bool | `true` | Auto-exclude files from `.gitignore` |
| `exclude` | array | `[]` | Additional exclude patterns |
| `include` | array | `[]` | Include patterns (processed before excludes) |
| `flags` | string | `"rz"` | Rsync flags (r=recursive, z=compress) |
| `options` | array | `["delete", "delete-after", "compress"]` | Rsync options |

**Patterns:** `/vendor/` = root only, `vendor/` = anywhere, `*.log` = all log files.

</details>

<details>
<summary><strong>Composer Settings</strong></summary>

```json
{
  "composer": {
    "options": "--prefer-dist --no-interaction --optimize-autoloader"
  }
}
```

For production, add `--no-dev` via environment override.

</details>

<details>
<summary><strong>Asset Settings</strong></summary>

```json
{
  "assets": {
    "failOnError": true,
    "verify": ["public/build/manifest.json"]
  }
}
```

</details>

<details>
<summary><strong>Permission Settings</strong></summary>

```json
{
  "permissions": {
    "webGroup": "www-data",
    "enforceSetgid": true,
    "directoryMode": "2775",
    "fileMode": "664"
  }
}
```

</details>

<details>
<summary><strong>Health Check Settings</strong></summary>

```json
{
  "healthCheck": {
    "enabled": true,
    "url": "/health",
    "timeout": 10,
    "expectedStatus": 200,
    "retries": 3,
    "retryDelay": 2,
    "endpoints": ["/api/status", { "url": "/admin", "status": 302 }]
  }
}
```

</details>

<details>
<summary><strong>Service Restart Settings</strong></summary>

```json
{
  "requiredServices": ["php-fpm", "nginx"],
  "optionalServices": ["supervisor"]
}
```

Required services fail the deploy if they can't restart. Optional services warn only.

</details>

### Environments

Environments can override any global setting and inherit from other environments with `extends`:

```json
{
  "environments": {
    "local": {
      "local": true,
      "deployPath": "/tmp/app"
    },
    "production": {
      "deployPath": "/var/www/production",
      "composer": { "options": "--prefer-dist --no-interaction --no-dev --optimize-autoloader" }
    },
    "staging": {
      "extends": "production",
      "deployPath": "/var/www/staging",
      "display": { "confirmChanges": false }
    }
  }
}
```

### Environment Secrets

Server credentials live in `.deploy/.env.{environment}` (not tracked in git):

| Variable | Description |
|----------|-------------|
| `DEPLOY_HOST` | Server hostname or IP |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_IDENTITY_FILE` | Path to SSH private key |
| `DEPLOY_PORT` | SSH port (default: 22) |
| `GITHUB_TOKEN` | GitHub token for private packages |

## Hooks

### Quick Hooks

Simple arrays for the most common hook points:

```json
{
  "beforeSymlink": ["php artisan optimize:clear"],
  "afterSymlink": ["php artisan queue:restart"],
  "postDeploy": ["php artisan filament:optimize"]
}
```

| Hook | Timing | On Failure |
|------|--------|------------|
| `beforeSymlink` | Before symlink switch | **Aborts deploy** |
| `afterSymlink` | After symlink switch | Warns, continues |
| `postDeploy` | After optimization | Warns, continues |

> **Important:** `beforeSymlink` should only clear caches. Optimization (`config:cache`, `route:cache`, `view:cache`) runs automatically after symlink with fresh OPcache — do NOT add these to `beforeSymlink`.

<details>
<summary><strong>Advanced Hooks (14 hook points)</strong></summary>

```json
{
  "hooks": {
    "before:deploy": ["local:npm run lint"],
    "after:setup": [],
    "before:build": [],
    "after:build": [],
    "before:sync": [],
    "after:sync": [],
    "before:composer": [],
    "after:composer": [],
    "before:migrate": ["php artisan backup:run --only-db"],
    "after:migrate": [],
    "before:symlink": [],
    "after:symlink": [],
    "after:deploy": ["notify:slack"],
    "on:failure": ["notify:slack"]
  }
}
```

Hooks prefixed `before:` are critical (abort on failure). Others warn and continue.

**Command prefixes:**

| Prefix | Runs on | Example |
|--------|---------|---------|
| `local:` | Local machine | `local:npm run test` |
| `artisan ` | Remote (shortcut) | `artisan cache:clear` |
| `notify:` | Notification | `notify:slack` |
| _(none)_ | Remote server | `php artisan migrate` |

</details>

## Sync Mode

Syncs files to the **current release** without creating a new one. No rollback available.

Smart step skipping based on git diff:

| Step | Skipped when... |
|------|-----------------|
| `assets:build` | No JS/CSS/Blade in diff |
| `composer:install` | No `composer.lock` in diff |
| `permissions:fix` | No new files (only mods) |
| `artisan:migrate` | No `database/migrations/` files |

## Server Provisioning

```bash
php artisan deployer:server provision
```

<details>
<summary><strong>Non-interactive provisioning</strong></summary>

```bash
php artisan deployer:server provision \
    --host=your-server.com \
    --user=ubuntu \
    --key=/path/to/ssh/key \
    --create-user \
    --deploy-user=deployer \
    --php-version=8.3 \
    --nodejs-version=20 \
    --with-mysql \
    --with-redis \
    --non-interactive
```

Installs: Nginx, PHP-FPM, Node.js, Composer, MySQL/PostgreSQL/Redis (optional), Supervisor, UFW firewall, swap space.

</details>

## Troubleshooting

- **"View Not Found" after deploy** — Add `"php artisan optimize:clear"` to `beforeSymlink`
- **Cache permission errors** — `sudo chgrp -R www-data bootstrap/cache && sudo chmod -R 2775 bootstrap/cache`
- **Deploy too slow** — Remove redundant `:clear`/`:cache` commands from hooks
- **Deployment locked** — `ssh user@server "rm /var/www/app/.dep/deploy.lock"`

## Testing

```bash
# Package tests
vendor/bin/pest

# Real-world integration harness (OrbStack VM scenarios)
.harness/run-tests.sh --scenario all --clean
```

Artifacts: `.harness/artifacts/orbstack/latest/`

## License

MIT

## Credits

Built with [Spatie SSH](https://github.com/spatie/ssh). Inspired by [Deployer](https://deployer.org/).
