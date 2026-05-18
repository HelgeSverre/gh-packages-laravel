# Laravel Domain Toolkit

A Laravel toolkit that scaffolds a layered architecture using repositories, services, DTOs, and domain-oriented generators.  
It helps enforce separation of concerns and promotes scalable, testable application design.

---

## Requirements

- PHP 8.1 or higher
- Laravel 9, 10, 11, 12 and 13

---

## Compatibility

This package supports:

- Laravel 9.x
- Laravel 10.x
- Laravel 11.x
- Laravel 12.x
- Laravel 13.x (Experimental)

---

## Supporting Links

> Resources related to repository patterns, service layers, and domain-oriented design.

### Architecture & Domain Design
- https://dev.to/blamsa0mine/structuring-a-laravel-project-with-the-repository-pattern-and-services-11pm
- https://laravel-news.com/using-dtos-to-keep-context
- https://domainlanguage.com/ddd/reference/

### Laravel Foundations
- https://laravel.com/docs/container
- https://laravel.com/docs/providers
- https://laravel.com/docs/artisan

---

## Installation

### Step 1: Install via Composer

```sh
composer require reizucodes/laravel-domain-toolkit
```

---

### Step 2: Register the Service Provider (If Needed)

Laravel supports package auto-discovery, so this step is usually unnecessary.

If auto-discovery is disabled, manually register the service provider:

#### Laravel 10 and Below

Add to `config/app.php`:

```php
'providers' => [
    BlaiseBueno\LaravelDomainToolkit\DomainToolkitServiceProvider::class,
],
```

#### Laravel 11 and Above

Add to `bootstrap/providers.php`:

```php
return [
    BlaiseBueno\LaravelDomainToolkit\DomainToolkitServiceProvider::class,
];
```

---

### Step 3: Publish Toolkit Resources

```sh
php artisan vendor:publish --tag=laravel-domain-toolkit
```

This will publish:

```
app/Repositories/BaseRepository.php
app/Repositories/Interfaces/EloquentInterface.php
app/Providers/RepositoryServiceProvider.php

stubs/domain-toolkit/
├── repository.stub
├── repository-interface.stub
├── service.stub
└── dto.stub
```

Publishing installs required base classes and stub templates used by the generators.

The published stubs allow you to customize how repositories, services, and DTOs are generated.

You must publish the toolkit before using the generators.

Use `--force` to overwrite existing files:

```sh
php artisan vendor:publish --tag=laravel-domain-toolkit --force
```

---

## Repository Bindings

Repository bindings are handled through:

```
app/Providers/RepositoryServiceProvider.php
```

### Laravel 11 and Above

No manual registration is required.  
Laravel automatically loads providers inside the `app/Providers` directory.

### Laravel 10 and Below

Register the provider in `config/app.php`:

```php
App\Providers\RepositoryServiceProvider::class,
```

---

## Smart Class Resolution

If your application defines:

- App\Support\ServiceReturn  

The toolkit will automatically use your existing implementation.  
Otherwise, it falls back to the package default.

---

## Commands

All commands are registered automatically via the package.  
No manual registration is required.

---

## Service Return

The toolkit provides a `ServiceReturn` helper to standardize responses from the service layer.

It encapsulates:
- data
- errors
- HTTP status codes

Example:

```php
return ServiceReturn::success($data);

return ServiceReturn::clientError('Invalid input');
```

You can convert responses to JSON:

```php
return $serviceReturn->toJsonResponse();
```

If your application defines:

```
App\Support\ServiceReturn
```

it will be used when generating services via `make:service` instead of the package default.

---

# Usage

The toolkit provides generators for common architecture components.

---

## Generate a Repository

```sh
php artisan make:repository User
```

Creates:

```
app/Repositories/UserRepository.php
app/Repositories/Interfaces/UserInterface.php
```

Also registers the binding in:

```
app/Providers/RepositoryServiceProvider.php
```

---

## Generate a Service

```sh
php artisan make:service User
```

Creates:

```
app/Services/UserService.php
```

---

## Generate a DTO

```sh
php artisan make:dto User
```

Creates:

```
app/DTO/UserDto.php
```

---

### Nested DTOs (Recommended)

You can generate DTOs inside folders using slash notation:

```sh
php artisan make:dto Auth/User
```

Creates:

```
app/DTO/Auth/UserDto.php
```

Namespace:

```php
App\DTO\Auth\UserDto
```

---

### DTO Naming Rules

The generator automatically:

- Converts names to StudlyCase
- Ensures a single `Dto` suffix
- Prevents duplicate suffixes

Examples:

| Input | Output |
|------|--------|
| `User` | `UserDto` |
| `UserDto` | `UserDto` |
| `user_dto` | `UserDto` |
| `Auth/UserDTO` | `Auth/UserDto` |

---

### Notes

- Nested paths (`Auth/User`) are the standard way to define folders
- Folder structure is automatically reflected in the namespace
- Existing files will prompt for overwrite unless `--force` is used

---

## Generate a Full Domain Scaffold

```sh
php artisan make:domain User
```

Creates:

```
app/Models/User.php
app/Http/Controllers/UserController.php
app/Repositories/UserRepository.php
app/Repositories/Interfaces/UserInterface.php
app/Services/UserService.php
```

This command orchestrates the generators and sets up a complete domain layer.

---

## Stub Customization

All generator templates are published to:

```
stubs/domain-toolkit/
```

You may modify these files to customize generated classes.

---

## License

This package is open-source and available under the MIT license.
