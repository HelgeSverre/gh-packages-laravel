# zairakai/laravel-dev-tools

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Coverage][coverage-badge]][coverage-link]

[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![Packagist][packagist-badge]][packagist]
[![Downloads][downloads-badge]][packagist]
[![License][license-badge]][license]

[![PHP][php-badge]][php]
[![Laravel][laravel-badge]][laravel]
[![Static Analysis][phpstan-badge]][phpstan]
[![Code Style][pint-badge]][pint]

One unified toolkit to set up Laravel quality tooling. Context-aware by default — it adapts to both standalone packages and full-stack applications.

---

## Why zairakai/laravel-dev-tools?

| Concept | Benefit |
| :--- | :--- |
| **Unified Logic** | The same quality gate for all your projects. Only the target (package or app) changes, not the rigor. |
| **Concentrated Configs** | Centralized, opinionated configurations for PHPStan, Rector, Pint, and PHP Insights. Avoid configuration drift across projects. |
| **Unified Workflow** | One set of `make` commands to rule them all. Whether it's a small package or a full-stack app, the quality gate remains the same. |
| **Auto-Syncing CI** | Automatically updates GitLab CI ref tags in your `.gitlab-ci.yml` when you update the package. Keep your pipelines current without manual effort. |
| **Zero Friction** | Automated setup via composer plugin and shell scripts handles the heavy lifting on install. |

---

## Features

| Tool | Responsibility |
| :--- | :--- |
| **Pint** | Opinionated Laravel code style enforcer. |
| **PHPStan** | Static analysis at max level with Laravel-aware rules. |
| **Rector** | Automated refactoring and modernization. |
| **PHP Insights** | Architecture and code quality metrics. |
| **PHPMetrics** | Code metrics report. |
| **Markdownlint** | Consistent documentation. |
| **ShellCheck** | Validated shell scripts. |
| **GitLab CI** | Reusable pipeline templates for Laravel apps and packages. |
| **Makefile** | Unified `make quality`, `make test`, `make ci` targets (delegated to core). |
| **Full-stack** | Integrates with `@zairakai/js-dev-tools` for JS/TS tooling in one unified workflow. |

On install, the composer plugin:

- creates `Makefile` (PHP-only or full-stack if `package.json` is detected, delegating to `vendor/zairakai/laravel-dev-tools/tools/make/core.mk`)
- creates `.editorconfig`
- creates `config/dev-tools/baseline.neon` for PHPStan
- adds necessary scripts to `composer.json`
- registers the automatic GitLab CI ref synchronization

---

## Install

```bash
composer require --dev zairakai/laravel-dev-tools
```

For full-stack Laravel + Vue projects:

```bash
composer require --dev zairakai/laravel-dev-tools
npm install --save-dev @zairakai/js-dev-tools
php artisan dev-tools:publish --fullstack
```

---

## Usage

```bash
make quality        # pint + phpstan + rector + insights + markdownlint + shellcheck
make quality-fast   # pint + phpstan + markdownlint (fast CI check)
make quality-fix    # auto-fix (rector + pint + markdownlint)
make test           # phpunit
make test-coverage  # phpunit with coverage report (requires PCOV or Xdebug)
make test-all       # phpunit + bats
make ci             # full pipeline simulation
make doctor         # environment diagnostics
```

---

## Configuration

The package provides a set of opinionated configurations that you can use as-is or extend in your project.

### PHPStan

Create `phpstan.neon` in your project root:

```neon
includes:
    - vendor/zairakai/laravel-dev-tools/config/base.neon

parameters:
    paths:
        - src
        - tests
```

### Rector

Create `rector.php` in your project root:

```php
<?php

declare(strict_types=1);

use Rector\Config\RectorConfig;

return static function (RectorConfig $rectorConfig): void
{
    $rectorConfig->import(__DIR__ . '/vendor/zairakai/laravel-dev-tools/config/rector.base.php');

    $rectorConfig->paths([
        __DIR__ . '/src',
        __DIR__ . '/tests',
    ]);
};
```

### PHP Insights

Create `insights.php` in your project root:

```php
<?php

declare(strict_types=1);

return require 'vendor/zairakai/laravel-dev-tools/config/insights.base.php';
```

---

## Publishing configs

Publish config files to `config/dev-tools/` (never overwritten unless `--force`):

```bash
# All at once
php artisan dev-tools:publish --publish

# By group
php artisan dev-tools:publish --publish=quality
php artisan dev-tools:publish --publish=style
php artisan dev-tools:publish --publish=testing
php artisan dev-tools:publish --publish=hooks

# Single files
php artisan dev-tools:publish --publish=phpstan
php artisan dev-tools:publish --publish=baseline
php artisan dev-tools:publish --publish=rector
php artisan dev-tools:publish --publish=insights
php artisan dev-tools:publish --publish=pint
php artisan dev-tools:publish --publish=markdownlint
php artisan dev-tools:publish --publish=phpunit
php artisan dev-tools:publish --publish=gitlab-ci

# Full-stack Makefile (PHP + JS)
php artisan dev-tools:publish --fullstack
```

For standalone packages (without artisan):

```bash
bash vendor/zairakai/laravel-dev-tools/scripts/setup-package.sh --publish=gitlab-ci
bash vendor/zairakai/laravel-dev-tools/scripts/setup-package.sh --fullstack
```

---

## GitLab CI pipeline templates

```yaml
# Laravel package pipeline
include:
  - project: 'zairakai/php-packages/laravel-dev-tools'
    ref: v1.0.0          # pin to a release tag for reproducible builds
    file: '.gitlab/ci/pipeline-php-package.yml'

variables:
  CACHE_KEY: "my-package-v1"
  PACKAGIST_PACKAGE: "vendor/my-package"
```

```yaml
# Laravel application pipeline
include:
  - project: 'zairakai/php-packages/laravel-dev-tools'
    ref: v1.0.0          # pin to a release tag for reproducible builds
    file: '.gitlab/ci/pipeline-laravel-app.yml'

variables:
  CACHE_KEY: "my-app-v1"
```

```yaml
# Laravel + Vue full-stack pipeline (PHP + JS in one include)
include:
  - project: 'zairakai/php-packages/laravel-dev-tools'
    ref: v1.0.0          # pin to a release tag for reproducible builds
    file: '.gitlab/ci/pipeline-laravel-fullstack.yml'

variables:
  CACHE_KEY: "my-app-v1"
```

Available templates:

- `pipeline-php-package.yml` — security → install → validate → quality → test → publish → release
- `pipeline-laravel-app.yml` — security → install → validate → quality → test → deploy → metrics
- `pipeline-laravel-fullstack.yml` — aggregates PHP + JS pipelines via a single include

---

## Development

```bash
make quality        # full quality check
make quality-fast   # fast check (pint + phpstan + markdownlint)
make test           # run tests
make doctor         # environment diagnostics
```

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md][contributing] for the project-specific workflow and quality standards.

---

## Getting Help

[![License][license-badge]][license]
[![Security Policy][security-badge]][security]
[![Issues][issues-badge]][issues]

**Made with ❤️ by [Zairakai][ecosystem]**

<!-- Reference Links -->
[pipeline-main-badge]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/commits/main
[coverage-badge]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/-/jobs/artifacts/main/browse
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/php-packages/laravel-dev-tools?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/-/releases
[packagist-badge]: https://img.shields.io/packagist/v/zairakai/laravel-dev-tools
[packagist]: https://packagist.org/packages/zairakai/laravel-dev-tools
[downloads-badge]: https://img.shields.io/packagist/dt/zairakai/laravel-dev-tools
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fphp-packages%2Flaravel-dev-tools?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/php-packages/laravel-dev-tools/-/issues
[php-badge]: https://img.shields.io/badge/php-8.4-blue?logo=php
[php]: https://www.php.net
[laravel-badge]: https://img.shields.io/badge/Laravel-12%20%7C%2013-red?logo=laravel
[laravel]: https://laravel.com
[phpstan-badge]: https://img.shields.io/badge/static%20analysis-phpstan-5B2C6F.svg?logo=php
[phpstan]: https://phpstan.org
[pint-badge]: https://img.shields.io/badge/code%20style-pint-22C55E.svg
[pint]: https://laravel.com/docs/pint
[ecosystem]: https://gitlab.com/zairakai
[contributing]: ./CONTRIBUTING.md
