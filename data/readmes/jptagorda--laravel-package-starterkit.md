# Laravel Package Starterkit

A production-ready Laravel package template with action-based architecture, strict conventions, and comprehensive tooling.

## Overview

This starterkit provides a solid foundation for building Laravel packages that follow best practices:

- **Action-based architecture** for predictable state mutations
- **Contract-driven design** for testability and flexibility
- **Value objects** for type-safe, immutable data
- **Pest + Orchestra Testbench** for robust testing
- **Pre-configured tooling** (Pint, Prettier, PHPUnit)

## Requirements

- PHP 8.4+
- Laravel 12+
- Composer 2.0+

## Installation

Install the starterkit in your Laravel application:

```bash
composer require jptagorda/laravel-package-starterkit --dev
```

## Quick Start

### Create a New Package

Use the Artisan command to scaffold a new package:

```bash
php artisan make:package vendor/package-name
```

**Example:**

```bash
php artisan make:package acme/billing
```

This creates a fully configured package at `packages/acme/billing/` with:

- Service provider with auto-discovery
- Exception hierarchy
- Test infrastructure (Pest + Orchestra Testbench)
- Configuration file
- Documentation stubs
- Code style configs (Pint, Prettier)

### Command Options

```bash
# Create a new package
php artisan make:package acme/my-package

# Overwrite existing package
php artisan make:package acme/my-package --force
```

### After Scaffolding

```bash
cd packages/acme/my-package
composer install
composer test
```

### Add to Root composer.json

Add the package as a path repository:

```json
{
    "repositories": [
        {
            "type": "path",
            "url": "packages/acme/my-package"
        }
    ]
}
```

Then require it:

```bash
composer require acme/my-package
```

## Generated Structure

```
packages/acme/my-package/
├── src/
│   ├── Actions/              # State mutation classes
│   ├── Contracts/            # Interface definitions
│   ├── Exceptions/           # Package-specific exceptions
│   │   ├── PackageException.php
│   │   ├── ValidationException.php
│   │   └── ConfigurationException.php
│   ├── ValueObjects/         # Immutable data containers
│   └── MyPackageServiceProvider.php
├── config/
│   └── my-package.php
├── tests/
│   ├── Feature/
│   │   └── ServiceProviderTest.php
│   ├── Unit/
│   ├── Pest.php
│   └── TestCase.php
├── .docs/
│   ├── index.md
│   ├── installation.md
│   ├── configuration.md
│   └── usage.md
├── composer.json
├── README.md
├── CHANGELOG.md
├── phpunit.xml.dist
├── pint.json
└── .prettierrc
```

## Architecture Guidelines

### Actions

All state mutations flow through Action classes:

```php
<?php

declare(strict_types=1);

namespace Acme\MyPackage\Actions;

final readonly class CreateEntityAction
{
    public function __construct(
        private EntityRepositoryContract $repository,
    ) {}

    public function __invoke(EntityData $data): Entity
    {
        return $this->repository->create($data);
    }
}
```

### Contracts

Define behavior through interfaces:

```php
<?php

declare(strict_types=1);

namespace Acme\MyPackage\Contracts;

interface EntityRepositoryContract
{
    public function find(int $id): ?Entity;
    public function create(EntityData $data): Entity;
}
```

### Value Objects

Immutable data with constructor validation:

```php
<?php

declare(strict_types=1);

namespace Acme\MyPackage\ValueObjects;

final readonly class Email
{
    public function __construct(
        public string $value,
    ) {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::invalidField('email', 'Invalid email format');
        }
    }
}
```

### Exceptions

Use specific, contextual exceptions:

```php
use Acme\MyPackage\Exceptions\ValidationException;

throw ValidationException::invalidField('email', 'Must be a valid email');
throw ValidationException::requiredField('name');
```

## Package Commands

Inside your generated package:

| Command | Description |
|---------|-------------|
| `composer test` | Run Pest tests |
| `composer format` | Format code with Pint |

## Configuration

Generated config files follow these rules:

- All keys have explicit defaults (no nulls)
- Keys use `snake_case`
- Maximum 3 levels of nesting
- Config declares policy, not logic

## Testing

Tests use Pest with Orchestra Testbench:

```php
<?php

declare(strict_types=1);

it('creates entity with valid data', function (): void {
    $action = app(CreateEntityAction::class);

    $result = $action(new EntityData(name: 'Test'));

    expect($result)->toBeInstanceOf(Entity::class);
});

it('throws exception for invalid data', function (): void {
    $action = app(CreateEntityAction::class);

    expect(fn () => $action(new EntityData(name: '')))
        ->toThrow(ValidationException::class);
});
```

## Code Style

- **PHP**: Laravel Pint (PSR-12 + Laravel preset)
- **JS/JSON/MD**: Prettier

Run formatters:

```bash
composer format        # PHP files
npx prettier --write . # Other files
```

## Alternative: Manual Setup

If you prefer to clone the starterkit directly:

```bash
git clone https://github.com/jptagorda/laravel-package-starterkit.git my-package
cd my-package
rm -rf .git
git init
```

Then manually update:

1. `composer.json` - package name, namespace
2. Service provider - rename and update namespace
3. Config file - rename
4. Test files - update namespaces

## License

MIT
