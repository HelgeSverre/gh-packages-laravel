# Laravel Repo Facade Builder

A Laravel package that provides convenient Artisan commands for creating repositories, facades, enums, interfaces, and traits with proper namespace support and subfolder handling.

## Features

- 🚀 **Repository Pattern**: Create repositories with interfaces
- 🎭 **Facades**: Generate Laravel facade classes
- 📋 **Enums**: Create PHP 8.1+ enum classes with backing types
- 🔌 **Interfaces**: Generate interface files
- 🧩 **Traits**: Create reusable trait files
- ⚙️ **Services**: Generate service classes
- 📁 **Subfolder Support**: All commands support nested folder structures
- ✨ **Auto-namespace**: Automatically handles namespaces based on folder structure

## Requirements

- PHP 8.1 or higher
- Laravel 10.x or 11.x

## Installation

Install the package via Composer:

```bash
composer require jaikumar0101/laravel-repo-facade-builder
```

The service provider will be automatically registered via Laravel's package discovery.

## Usage

### Make Repository

Create a repository with its interface:

```bash
php artisan make:repository User
# or
php artisan make:repo User
```

This creates:
- `app/Repositories/UserRepositoryInterface.php`
- `app/Repositories/UserRepository.php`

**With subfolders:**

```bash
php artisan make:repository Accounting/Bill/CreditNote
```

This creates:
- `app/Repositories/Accounting/Bill/CreditNoteRepositoryInterface.php`
- `app/Repositories/Accounting/Bill/CreditNoteRepository.php`

### Make Facade

Create a Laravel facade:

```bash
php artisan make:facade Payment
```

This creates:
- `app/Facades/Payment.php`

**With subfolders:**

```bash
php artisan make:facade Services/Payment
```

This creates:
- `app/Facades/Services/Payment.php`

### Make Enum

Create an enum class:

```bash
php artisan make:enum Status
```

**With backing type:**

```bash
php artisan make:enum Status --type=string
php artisan make:enum Priority --type=int
```

This creates:
- `app/Enums/Status.php`

**With subfolders:**

```bash
php artisan make:enum Constants/OrderStatus --type=string
```

This creates:
- `app/Enums/Constants/OrderStatus.php`

### Make Interface

Create an interface:

```bash
php artisan make:interface PaymentGateway
```

This creates:
- `app/Interfaces/PaymentGatewayInterface.php`

**With subfolders:**

```bash
php artisan make:interface Contracts/Payment/Gateway
```

This creates:
- `app/Interfaces/Contracts/Payment/GatewayInterface.php`

### Make Trait

Create a trait:

```bash
php artisan make:trait HasUuid
```

This creates:
- `app/Traits/HasUuid.php`

**With subfolders:**

```bash
php artisan make:trait Concerns/HasSlug
```

This creates:
- `app/Traits/Concerns/HasSlug.php`

### Make Service

Create a service class:

```bash
php artisan make:service User
```

This creates:
- `app/Services/UserService.php`

**With subfolders:**

```bash
php artisan make:service Payment/Stripe/StripePayment
```

This creates:
- `app/Services/Payment/Stripe/StripePaymentService.php`

## Examples

### Complete Repository Pattern Example

```bash
# Create a user repository
php artisan make:repository User
```

Generated files:

**UserRepositoryInterface.php:**
```php
<?php

namespace App\Repositories;

interface UserRepositoryInterface
{
    // Methods...
}
```

**UserRepository.php:**
```php
<?php

namespace App\Repositories;

class UserRepository implements UserRepositoryInterface
{
    // Implementation...
}
```

### Enum with Backing Type

```bash
php artisan make:enum OrderStatus --type=string
```

Generated file:
```php
<?php

namespace App\Enums;

enum OrderStatus: string
{
    // Define your cases here
    // Example for string enum:
    // case ACTIVE = 'active';
    // case INACTIVE = 'inactive';
}
```

### Facade Example

```bash
php artisan make:facade PaymentService
```

Generated file:
```php
<?php

namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class PaymentService extends Facade
{
    protected static function getFacadeAccessor()
    {
        return 'payment_service';
    }
}
```

## Folder Structure

The package creates files in the following directories:

```
app/
├── Repositories/     # Repository files
├── Facades/          # Facade files
├── Enums/            # Enum files
├── Interfaces/       # Interface files
├── Traits/           # Trait files
└── Services/         # Service files
```

## Benefits

- **Consistent Structure**: Maintains a clean and consistent project structure
- **Time-Saving**: Quickly scaffold common OOP patterns
- **Namespace Management**: Automatically handles complex namespace hierarchies
- **Best Practices**: Follows Laravel and PHP best practices
- **Flexible**: Supports any level of folder nesting

## Testing

The package includes a comprehensive test suite. To run the tests:

```bash
# Install dependencies
composer install

# Run tests
composer test

# Run tests with coverage
composer test-coverage
```

### Running Specific Tests

```bash
# Run only repository command tests
vendor/bin/phpunit tests/Commands/MakeRepositoryCommandTest.php

# Run with specific filter
vendor/bin/phpunit --filter it_creates_repository_with_subfolders
```

### Test Coverage

The test suite covers:
- ✅ Repository creation with interfaces
- ✅ Facade generation
- ✅ Enum creation with backing types
- ✅ Interface generation
- ✅ Trait creation
- ✅ Service creation
- ✅ Subfolder support for all commands
- ✅ Namespace handling
- ✅ Directory creation

## License

This package is open-sourced software licensed under the [MIT license](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Author

**Jaikumar0101**

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.

## Changelog

### [Unreleased]

#### Added
- New `make:service` command to generate service classes in `app/Services/` directory
- Support for subfolder structures in service generation
- Comprehensive test coverage for service command
