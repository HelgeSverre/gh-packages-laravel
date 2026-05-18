# Common functions used in Laravel packages

[![Latest Version on Packagist](https://img.shields.io/packagist/v/roberts/support.svg?style=flat-square)](https://packagist.org/packages/roberts/support)
[![GitHub Tests Action Status](https://img.shields.io/github/actions/workflow/status/roberts/support/run-tests.yml?branch=main&label=tests&style=flat-square)](https://github.com/roberts/support/actions?query=workflow%3Arun-tests+branch%3Amain)
[![GitHub Code Style Action Status](https://img.shields.io/github/actions/workflow/status/roberts/support/fix-php-code-style-issues.yml?branch=main&label=code%20style&style=flat-square)](https://github.com/roberts/support/actions?query=workflow%3A"Fix+PHP+code+style+issues"+branch%3Amain)
[![Total Downloads](https://img.shields.io/packagist/dt/roberts/support.svg?style=flat-square)](https://packagist.org/packages/roberts/support)

Traits, Helper functions, and scaffolding tools for Laravel packages & applications.

## 🚀 Quick Start: Project Scaffolding

Quickly set up GitHub Workflow, Actions and Docker:

```bash
composer require roberts/support
composer support:scaffold
```

This automatically generates:
- ✅ GitHub Actions workflows (tests, PHPStan, linting)
- ✅ Docker configuration for Cloud Run
- ✅ PHPStan configuration
- ✅ VS Code workspace settings

**[Scaffolding Documentation →](SCAFFOLDING.md)**

## Features

### Project Scaffolding
- **Auto-detect** project type (Laravel app or package)
- **Smart detection** of features (Flux, Filament, Twitter, Mail)
- **One command** to set up complete CI/CD pipeline
- **Google Cloud Run** deployment ready

### Model Traits
- HasCreator
- HasUpdater

Model Traits for Status
- HasActiveStatus
- HasApplicationStatus
- HasApprovalStatus
- HasModeratorStatus
- HasOrderStatus
- HasProcessingStatus
- HasPublishingStatus
- HasSubscriptionStatus

## Installation

You can install the package via composer:

```bash
composer require roberts/support
```

## Usage

On packages or Laravel applications that require this package, you can add the Traits to models like:

```php
use HasCreator, HasUpdater, HasPublishingStatus;
```

You may only add 1 of the Status Traits since they all use the same `status` database column. They are not designed to work together but to replace the functionality with the Enum structures.

### Expected Columns

When using any of the Status Traits on a model, add the following format for the `status` database column on your table:

- `status` (string (25 character max), nullable, index)

**Note:** Status traits automatically set appropriate default values when models are created (e.g., `pending` for moderator status, `active` for active status).

When using the `HasCreator` and/or `HasUpdater` traits on a model, add the following nullable columns to your table:

- `creator_id` (unsignedBigInteger, nullable)
- `updater_id` (unsignedBigInteger, nullable)

Example migration snippet:

```php
Schema::table('your_table', function (Blueprint $table) {
	$table->string('status', 25)->nullable()->index();

	$table->foreignId('creator_id')->nullable()->constrained('users');
	$table->foreignId('updater_id')->nullable()->constrained('users');
});
```

The traits automatically:
- Set `creator_id` on model creating (when an authenticated user is present).
- Set `updater_id` on model saving (create and update) when an authenticated user is present.

### Overriding the Auth Provider Model

By default, the creator & updater traits resolve the related user model from `config('auth.providers.users.model')`.
If your application uses a different provider or model, ensure the config points to your user class. For example, in `config/auth.php`:

```php
'providers' => [
	'users' => [
		'driver' => 'eloquent',
		'model' => App\Models\User::class,
	],
],
```

Or override at runtime (e.g., inside a service provider) if needed:

```php
config(['auth.providers.users.model' => App\Domain\Auth\User::class]);
```

## Enums

Status traits use enums with the following values, setting the first one on model creation:
- `HasActiveStatus`: active, inactive
- `HasApplicationStatus`: pending, started, verified, applied, accepted, rejected
- `HasApprovalStatus`: pending, submitted, approved, rejected
- `HasModeratorStatus`: pending, flagged, approved, rejected
- `HasOrderStatus`: cart, pending, checkout, paid, shipped, delivered, canceled
- `HasProcessingStatus`: pending, processing, completed, failed
- `HasPublishingStatus`: draft, scheduled, published, archived
- `HasSubscriptionStatus`: trial, active, canceled, expired

## Testing

```bash
composer test
```

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](CONTRIBUTING.md) for details.

## Credits

- [Drew Roberts](https://github.com/drewroberts)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
