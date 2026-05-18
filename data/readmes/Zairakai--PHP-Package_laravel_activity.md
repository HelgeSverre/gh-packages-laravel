# zairakai/laravel-activity

[![Main][pipeline-main-badge]][pipeline-main-link]
[![Develop][pipeline-develop-badge]][pipeline-develop-link]
[![Coverage][coverage-badge]][coverage-link]

[![GitLab Release][gitlab-release-badge]][gitlab-release]
[![Packagist][packagist-badge]][packagist]
[![Downloads][downloads-badge]][packagist]
[![License][license-badge]][license]

[![PHP][php-badge]][php]
[![Laravel][laravel-badge]][laravel]
[![Static Analysis][phpstan-badge]][phpstan]
[![Code Style][pint-badge]][pint]

Pivot activity logging for Eloquent many-to-many relationships, built on top of [Spatie Laravel Activity Log](https://github.com/spatie/laravel-activitylog).

---

## Features

- **Fluent API** — chainable `->activity()->by()->withMessage()->sync()` on any `BelongsToMany` relation
- **Automatic diffing** — logs attached, detached, and unchanged IDs on every `sync` operation
- **Actor tracking** — `->by($user)` records who performed the action
- **Custom messages** — `->withMessage('Assigned roles')` for human-readable log entries
- **Zero configuration** — no config file needed, just `composer require`

---

## Requirements

- `spatie/laravel-activitylog` must be installed and configured

---

## Install

```bash
composer require zairakai/laravel-activity
```

---

## Usage

```php
use App\Models\User;

$user = User::find(1);

// Log a sync operation on a BelongsToMany relationship
$user->roles()
    ->activity()
    ->by(auth()->user())
    ->withMessage('Assigned roles')
    ->sync([1, 2, 3]);

// Without an actor
$user->permissions()
    ->activity()
    ->withMessage('Permissions updated')
    ->sync([10, 20]);

// Attach and detach also fire activity
$user->tags()->activity()->attach(5);
$user->tags()->activity()->detach(5);
```

The activity log will record:

- `attached`: IDs that were added
- `detached`: IDs that were removed
- `unchanged`: IDs that were already present

---

## Development

```bash
make quality        # pint + phpstan + rector + insights + markdownlint + shellcheck
make quality-fast   # pint + phpstan + markdownlint
make test           # phpunit / pest
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
[pipeline-main-badge]: https://gitlab.com/zairakai/php-packages/laravel-activity/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main
[pipeline-main-link]: https://gitlab.com/zairakai/php-packages/laravel-activity/commits/main
[pipeline-develop-badge]: https://gitlab.com/zairakai/php-packages/laravel-activity/badges/develop/pipeline.svg?ignore_skipped=true&key_text=Develop
[pipeline-develop-link]: https://gitlab.com/zairakai/php-packages/laravel-activity/commits/develop
[coverage-badge]: https://gitlab.com/zairakai/php-packages/laravel-activity/badges/main/coverage.svg
[coverage-link]: https://gitlab.com/zairakai/php-packages/laravel-activity/-/commits/main
[gitlab-release-badge]: https://img.shields.io/gitlab/v/release/zairakai/php-packages/laravel-activity?logo=gitlab
[gitlab-release]: https://gitlab.com/zairakai/php-packages/laravel-activity/-/releases
[packagist-badge]: https://img.shields.io/packagist/v/zairakai/laravel-activity
[packagist]: https://packagist.org/packages/zairakai/laravel-activity
[downloads-badge]: https://img.shields.io/packagist/dt/zairakai/laravel-activity
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license]: ./LICENSE
[security-badge]: https://img.shields.io/badge/security-scanned-green.svg
[security]: ./SECURITY.md
[issues-badge]: https://img.shields.io/gitlab/issues/open-raw/zairakai%2Fphp-packages%2Flaravel-activity?logo=gitlab&label=Issues
[issues]: https://gitlab.com/zairakai/php-packages/laravel-activity/-/issues
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
