# Laravel Service/Repository Generator Package

This Laravel package provides Artisan commands to quickly generate service and repository classes with their corresponding interfaces and factories following a standardized structure.

## Installation

1. Install the package via Composer:
```bash
composer require lowel/laravel-service-maker
```

2. The package will automatically register its service provider. If you need to publish the configuration file:
```bash
php artisan vendor:publish --provider="Lowel\\LaravelServiceMaker\\LaravelServiceMakerProvider" --tag="config"
```

## Commands

### Create a new service

```bash
php artisan lowel:make:service {name} {--s|singleton}
```

**Options:**
- `name`: The name of the service (e.g., `Payment` will create `PaymentService`)
- `--s|singleton`: Create the service as a singleton

**Example:**
```bash
php artisan lowel:make:service Payment
```

This will generate:
- `App/Services/Payment/PaymentService.php`
- `App/Services/Payment/PaymentServiceInterface.php`
- `App/Services/Payment/PaymentServiceFactory.php`

### Create a new repository

```bash
php artisan lowel:make:repository {name} {--s|singleton}
```

**Options:**
- `name`: The name of the repository (e.g., `User` will create `UserRepository`)
- `--s|singleton`: Create the repository as a singleton

**Example:**
```bash
php artisan lowel:make:repository User --singleton
```

This will generate:
- `App/Repositories/User/UserRepository.php`
- `App/Repositories/User/UserRepositoryInterface.php`
- `App/Repositories/User/UserRepositoryFactory.php`

## File Structure

The package follows this directory structure:

```
app/
├── Repositories/
│   ├── {RepositoryName}/
│   │   ├── {RepositoryName}Repository.php
│   │   ├── {RepositoryName}RepositoryInterface.php
│   │   └── {RepositoryName}RepositoryFactory.php
└── Services/
    ├── {ServiceName}/
    │   ├── {ServiceName}Service.php
    │   ├── {ServiceName}ServiceInterface.php
    │   └── {ServiceName}ServiceFactory.php
```

## Usage

After generating the classes, you can use them through Laravel's dependency injection:

```php
use App\Services\Payment\PaymentServiceInterface;
use App\Repositories\User\UserRepositoryInterface;
use Illuminate\Support\Facades\App;

// Using app() helper
$service = app(PaymentServiceInterface::class);
$repository = app(UserRepositoryInterface::class);

// Using App facade
$service = App::make(PaymentServiceInterface::class);

// Using constructor injection
public function __construct(
    PaymentServiceInterface $paymentService,
    UserRepositoryInterface $userRepository
) {
    // ...
}
```

The package automatically registers the interfaces in Laravel's container, binding them to their concrete implementations.

## Configuration

You can customize the generation behavior by publishing and modifying the package configuration file:

```bash
php artisan vendor:publish --provider="Lowel\\LaravelServiceMaker\\LaravelServiceMakerProvider" --tag="config"
```

This will create `config/service-maker.php` where you can configure:
- Base paths
- Class mapping
- Formatting

## Requirements
- PHP 8.3+
- Laravel 9+

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
